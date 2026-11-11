import { generatePerfectPlane, generateUntilFullyConnected } from '../algorithms/seating';
import type { SeatingPlan } from '../types/seating';
import * as m from '../paraglide/messages';
import { storage } from '$lib/services/storage';

/**
 * Варіанти маркування столів або гостей/місць.
 */
export type NamingMode = 'letters' | 'numbers';

/**
 * Перетворює числовий індекс (0-based) у бієктивне літерне позначення:
 * 0 -> A, 1 -> B, ..., 25 -> Z, 26 -> AA, 27 -> AB...
 */
export function indexToLetter(index: number): string {
	if (index < 0) return '';
	let result = '';
	let num = index;
	while (num >= 0) {
		result = String.fromCharCode(65 + (num % 26)) + result;
		num = Math.floor(num / 26) - 1;
	}
	return result;
}

export class SeatingController {
	totalPeople = $state(36);
	tableCount = $state(6);
	tableCapacity = $state(6);
	namesInput = $state('');
	rounds: SeatingPlan = $state([]);
	errorMessage = $state('');
	isCalculating = $state(false);
	isCopied = $state(false);

	/**
	 * Режими нумерації столів та учасників/місць.
	 * За замовчуванням: столи — літери (A, B, C...), гості — цифри (1, 2, 3...).
	 */
	tableNaming = $state<NamingMode>('letters');
	participantNaming = $state<NamingMode>('numbers');

	constructor() {
		const savedTable = storage.get('table_naming') as NamingMode | null;
		if (savedTable === 'letters' || savedTable === 'numbers') {
			this.tableNaming = savedTable;
		}

		const savedParticipant = storage.get('participant_naming') as NamingMode | null;
		if (savedParticipant === 'letters' || savedParticipant === 'numbers') {
			this.participantNaming = savedParticipant;
		}
	}

	setTableNaming(mode: NamingMode) {
		this.tableNaming = mode;
		storage.set('table_naming', mode);
	}

	setParticipantNaming(mode: NamingMode) {
		this.participantNaming = mode;
		storage.set('participant_naming', mode);
	}

	/**
	 * Отримує мітку/назву столу за його індексом (0-based).
	 */
	getTableLabel(index: number): string {
		if (this.tableNaming === 'letters') {
			return indexToLetter(index);
		}
		return (index + 1).toString();
	}

	/**
	 * Отримує мітку гостя за замовчуванням (коли ім'я не задано).
	 */
	getParticipantDefaultName(id: number): string {
		if (this.participantNaming === 'letters') {
			return indexToLetter(id - 1);
		}
		return id.toString();
	}

	/**
	 * Список імен учасників, отриманий з поля вводу або згенерований за замовчуванням.
	 */
	participantNames = $derived.by(() => {
		const names = this.namesInput
			.split('\n')
			.map((n) => n.trim())
			.filter((n) => n.length > 0);

		const list: string[] = [];
		for (let i = 1; i <= this.totalPeople; i++) {
			list.push(names[i - 1] || this.getParticipantDefaultName(i));
		}
		return list;
	});

	/**
	 * Отримує ім'я або позначення учасника за його ID (1-N).
	 */
	getParticipantName(id: number): string {
		return this.participantNames[id - 1] || this.getParticipantDefaultName(id);
	}

	/**
	 * Отримує ініціали або коротке позначення учасника за його ID.
	 */
	getInitials(id: number): string {
		const name = this.getParticipantName(id);
		// Якщо це число або коротка літера (A, B, AA тощо)
		if (!isNaN(Number(name)) || /^[A-Z]{1,3}$/.test(name)) return name;

		const parts = name.split(' ').filter((p) => p.length > 0);
		if (parts.length >= 2) {
			return (parts[0][0] + parts[1][0]).toUpperCase();
		}
		return name.substring(0, 2).toUpperCase();
	}

	/**
	 * Форматує план розсадки у текстовий вигляд.
	 */
	formatAsText(): string {
		if (this.rounds.length === 0) return '';

		let text = `${m.app_title()}\n`;
		text += `${m.total_people()}: ${this.totalPeople}, ${m.table_count()}: ${this.tableCount}, ${m.table_capacity()}: ${this.tableCapacity}\n`;
		text += `-----------------------------------\n\n`;

		this.rounds.forEach((round, roundIdx) => {
			text += `${m.round().toUpperCase()} ${roundIdx + 1}\n`;
			const activeTables = round.filter((t) => t.length > 0);
			activeTables.forEach((table, tableIdx) => {
				const names = table.map((id) => this.getParticipantName(id)).join(', ');
				text += `${m.table()} ${this.getTableLabel(tableIdx)}: ${names}\n`;
			});
			text += `\n`;
		});

		return text.trim();
	}

	/**
	 * Копіює результати в буфер обміну.
	 */
	async copyToClipboard() {
		const text = this.formatAsText();
		if (!text) return;

		try {
			await navigator.clipboard.writeText(text);
			this.isCopied = true;
			setTimeout(() => {
				this.isCopied = false;
			}, 2000);
		} catch (err) {
			console.error('Failed to copy: ', err);
			this.errorMessage = 'Помилка при копіюванні в буфер обміну.';
		}
	}

	/**
	 * Динамічно розраховує максимальну кількість унікальних зустрічей серед усіх учасників.
	 */
	maxPeopleMet = $derived.by(() => {
		if (this.rounds.length === 0) return 0;

		let maxMeetings = 0;
		for (let p = 1; p <= this.totalPeople; p++) {
			const met = new Set<number>();
			for (const round of this.rounds) {
				for (const table of round) {
					if (table.includes(p)) {
						for (const member of table) {
							if (member !== p) met.add(member);
						}
						break;
					}
				}
			}
			if (met.size > maxMeetings) maxMeetings = met.size;
		}
		return maxMeetings;
	});

	/**
	 * Виконує розрахунок розсадки.
	 */
	calculate() {
		this.errorMessage = '';
		this.rounds = [];

		if (this.totalPeople > this.tableCount * this.tableCapacity) {
			this.errorMessage = m.error_max_capacity({ max: this.tableCount * this.tableCapacity });
			return;
		}

		this.isCalculating = true;

		setTimeout(() => {
			let bestTemplateP = 0;

			if (
				this.tableCapacity >= 8 &&
				this.tableCount >= 8 &&
				this.totalPeople > 49 &&
				this.totalPeople <= 64
			) {
				bestTemplateP = 8;
			} else if (
				this.tableCapacity >= 7 &&
				this.tableCount >= 7 &&
				this.totalPeople > 25 &&
				this.totalPeople <= 49
			) {
				bestTemplateP = 7;
			} else if (
				this.tableCapacity >= 5 &&
				this.tableCount >= 5 &&
				this.totalPeople > 16 &&
				this.totalPeople <= 25
			) {
				bestTemplateP = 5;
			}

			if (bestTemplateP > 0) {
				const perfectRounds = generatePerfectPlane(bestTemplateP);
				this.rounds = perfectRounds.map((round) =>
					round
						.map((table) => table.filter((person) => person <= this.totalPeople))
						.filter((table) => table.length > 0)
				);
			} else {
				this.rounds = generateUntilFullyConnected(
					this.totalPeople,
					this.tableCount,
					this.tableCapacity
				);
			}
			this.isCalculating = false;
		}, 50);
	}

	/**
	 * Скидає стан до початкових значень.
	 */
	reset() {
		this.totalPeople = 36;
		this.tableCount = 6;
		this.tableCapacity = 6;
		this.namesInput = '';
		this.rounds = [];
		this.errorMessage = '';
		this.isCalculating = false;
	}
}
