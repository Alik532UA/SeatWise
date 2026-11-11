import { generatePerfectPlane, generateUntilFullyConnected } from '../algorithms/seating';
import type { SeatingPlan } from '../types/seating';
import * as m from '../paraglide/messages';

export class SeatingController {
	totalPeople = $state(20);
	tableCount = $state(8);
	tableCapacity = $state(8);
	namesInput = $state('');
	rounds: SeatingPlan = $state([]);
	errorMessage = $state('');
	isCalculating = $state(false);
	isCopied = $state(false);

	/**
	 * Список імен учасників, отриманий з поля вводу.
	 */
	participantNames = $derived.by(() => {
		const names = this.namesInput
			.split('\n')
			.map((n) => n.trim())
			.filter((n) => n.length > 0);

		const list: string[] = [];
		for (let i = 1; i <= this.totalPeople; i++) {
			list.push(names[i - 1] || i.toString());
		}
		return list;
	});

	/**
	 * Отримує ім'я учасника за його ID (1-N).
	 */
	getParticipantName(id: number): string {
		return this.participantNames[id - 1] || id.toString();
	}

	/**
	 * Отримує ініціали учасника за його ID.
	 */
	getInitials(id: number): string {
		const name = this.getParticipantName(id);
		if (!isNaN(Number(name))) return name; // Якщо це просто число

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
				text += `${m.table()} ${tableIdx + 1}: ${names}\n`;
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
		this.totalPeople = 20;
		this.tableCount = 8;
		this.tableCapacity = 8;
		this.namesInput = '';
		this.rounds = [];
		this.errorMessage = '';
		this.isCalculating = false;
	}
}
