import { generatePerfectPlane, generateUntilFullyConnected } from '../algorithms/seating';
import type { SeatingPlan } from '../types/seating';
import * as m from '../paraglide/messages';
import { storage } from '$lib/services/storage';

/**
 * Варіанти маркування столів або гостей/місць.
 */
export type NamingMode = 'letters' | 'numbers';

/**
 * Варіанти кольорової схеми столів:
 * - 'monochrome': єдиний фірмовий акцентний колір (за замовчуванням)
 * - 'palette': різні гармонійні кольори для кожного столу
 */
export type TableColorMode = 'monochrome' | 'palette';

/**
 * Гармонійна палітра для розрізнення столів (16 кольорів).
 */
export const TABLE_PALETTE = [
	'#2563eb', // 1. Blue
	'#059669', // 2. Emerald
	'#7c3aed', // 3. Violet
	'#d97706', // 4. Amber
	'#db2777', // 5. Rose / Magenta
	'#0891b2', // 6. Cyan
	'#ea580c', // 7. Orange
	'#4f46e5', // 8. Indigo
	'#0d9488', // 9. Teal
	'#e11d48', // 10. Crimson Red
	'#65a30d', // 11. Lime
	'#9333ea', // 12. Purple
	'#0284c7', // 13. Sky Blue
	'#ca8a04', // 14. Golden Yellow
	'#c026d3', // 15. Fuchsia
	'#475569' // 16. Slate / Steel
];

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

/**
 * Інформація про розміщення учасника в окремому раунді.
 */
export interface ParticipantRoundInfo {
	roundIndex: number;
	roundNumber: number;
	tableIndex: number;
	tableLabel: string;
	tableColor: string;
	companions: number[];
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
	 * Крос-раундове підсвічування та вибір учасника.
	 */
	hoveredParticipantId = $state<number | null>(null);
	selectedParticipantId = $state<number | null>(null);
	searchQuery = $state('');
	isParticipantModalOpen = $state(false);
	modalParticipantId = $state<number | null>(null);
	isParticipantCopied = $state(false);

	/**
	 * Активний ID учасника (наведений або зафіксований).
	 */
	activeParticipantId = $derived(this.hoveredParticipantId ?? this.selectedParticipantId);

	/**
	 * Режими нумерації столів та учасників/місць.
	 * За замовчуванням: столи — літери (A, B, C...), гості — цифри (1, 2, 3...).
	 */
	tableNaming = $state<NamingMode>('letters');
	participantNaming = $state<NamingMode>('numbers');
	tableColorMode = $state<TableColorMode>('monochrome');

	constructor() {
		const savedColorMode = storage.get('table_color_mode') as TableColorMode | null;
		if (savedColorMode === 'monochrome' || savedColorMode === 'palette') {
			this.tableColorMode = savedColorMode;
		}

		const savedTable = storage.get('table_naming') as NamingMode | null;
		if (savedTable === 'letters' || savedTable === 'numbers') {
			this.tableNaming = savedTable;
		}

		const savedParticipant = storage.get('participant_naming') as NamingMode | null;
		if (savedParticipant === 'letters' || savedParticipant === 'numbers') {
			this.participantNaming = savedParticipant;
		}

		const savedTotal = storage.get('total_people');
		if (savedTotal && !isNaN(Number(savedTotal))) {
			const parsed = Number(savedTotal);
			if (parsed > 0) this.totalPeople = parsed;
		}

		const savedCount = storage.get('table_count');
		if (savedCount && !isNaN(Number(savedCount))) {
			const parsed = Number(savedCount);
			if (parsed > 0) this.tableCount = parsed;
		}

		const savedCapacity = storage.get('table_capacity');
		if (savedCapacity && !isNaN(Number(savedCapacity))) {
			const parsed = Number(savedCapacity);
			if (parsed > 0) this.tableCapacity = parsed;
		}

		const savedNames = storage.get('names_input');
		if (savedNames !== null) {
			this.namesInput = savedNames;
		}

		const savedRounds = storage.get('rounds');
		if (savedRounds) {
			try {
				const parsed = JSON.parse(savedRounds);
				if (Array.isArray(parsed)) {
					this.rounds = parsed;
				}
			} catch (e) {
				console.error('Failed to parse saved rounds:', e);
			}
		}
	}

	/**
	 * Зберігає стан параметрів та результатів розсадки у сховище.
	 */
	saveState() {
		storage.set('total_people', String(this.totalPeople));
		storage.set('table_count', String(this.tableCount));
		storage.set('table_capacity', String(this.tableCapacity));
		storage.set('names_input', this.namesInput);
		storage.set('rounds', JSON.stringify(this.rounds));
	}

	setTableNaming(mode: NamingMode) {
		this.tableNaming = mode;
		storage.set('table_naming', mode);
	}

	setParticipantNaming(mode: NamingMode) {
		this.participantNaming = mode;
		storage.set('participant_naming', mode);
	}

	setTableColorMode(mode: TableColorMode) {
		this.tableColorMode = mode;
		storage.set('table_color_mode', mode);
	}

	setHoveredParticipant(id: number | null) {
		this.hoveredParticipantId = id;
	}

	toggleSelectedParticipant(id: number) {
		if (this.selectedParticipantId === id) {
			this.selectedParticipantId = null;
		} else {
			this.selectedParticipantId = id;
		}
	}

	clearSelection() {
		this.selectedParticipantId = null;
		this.hoveredParticipantId = null;
		this.searchQuery = '';
	}

	openParticipantModal(id: number) {
		this.modalParticipantId = id;
		this.selectedParticipantId = id;
		this.isParticipantModalOpen = true;
	}

	closeParticipantModal() {
		this.isParticipantModalOpen = false;
	}

	/**
	 * Отримує повний індивідуальний розклад учасника за всіма раундами.
	 */
	getParticipantSchedule(id: number): ParticipantRoundInfo[] {
		if (typeof id !== 'number' || isNaN(id) || this.rounds.length === 0) {
			return [];
		}

		const schedule: ParticipantRoundInfo[] = [];

		this.rounds.forEach((round, rIndex) => {
			for (let tIndex = 0; tIndex < round.length; tIndex++) {
				const table = round[tIndex];
				if (table.includes(id)) {
					schedule.push({
						roundIndex: rIndex,
						roundNumber: rIndex + 1,
						tableIndex: tIndex,
						tableLabel: this.getTableLabel(tIndex),
						tableColor: this.getTableColor(tIndex),
						companions: table.filter((personId) => personId !== id)
					});
					break;
				}
			}
		});

		return schedule;
	}

	/**
	 * Форматує персональний план гостя у зручний текст для месенджерів.
	 */
	formatParticipantScheduleText(id: number): string {
		const schedule = this.getParticipantSchedule(id);
		if (schedule.length === 0) return '';

		const name = this.getParticipantName(id);
		let text = `${m.app_title()}\n`;
		text += `${m.participant_schedule()}: ${name} (#${id})\n`;
		text += `-----------------------------------\n\n`;

		schedule.forEach((item) => {
			const companionNames = item.companions.map((cId) => this.getParticipantName(cId)).join(', ');
			text += `${m.round()} ${item.roundNumber}: ${m.table()} ${item.tableLabel}\n`;
			if (companionNames) {
				text += `  ${m.companions()}: ${companionNames}\n`;
			}
			text += `\n`;
		});

		return text.trim();
	}

	/**
	 * Копіює персональний маршрут учасника в буфер обміну.
	 */
	async copyParticipantSchedule(id: number) {
		const text = this.formatParticipantScheduleText(id);
		if (!text) return;

		try {
			if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
				await navigator.clipboard.writeText(text);
			}
			this.isParticipantCopied = true;
			setTimeout(() => {
				this.isParticipantCopied = false;
			}, 2000);
		} catch (e) {
			console.error('Failed to copy participant schedule:', e);
		}
	}

	/**
	 * Отримує колір для столу за його індексом.
	 * Якщо режим 'palette' - повертає унікальний колір з гармонійної палітри,
	 * якщо 'monochrome' - повертає стандартний CSS accent.
	 */
	getTableColor(index: number): string {
		if (this.tableColorMode === 'palette') {
			return TABLE_PALETTE[index % TABLE_PALETTE.length];
		}
		return 'var(--accent-primary)';
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
		if (typeof id !== 'number' || isNaN(id)) return '';
		if (this.participantNaming === 'letters') {
			return indexToLetter(id - 1);
		}
		return String(id);
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
	 * Швидкий пошук учасників за запитом (номер або ім'я).
	 */
	filteredParticipants = $derived.by(() => {
		const query = this.searchQuery.trim().toLowerCase();
		if (!query) return [];

		const matches: Array<{ id: number; name: string }> = [];
		for (let i = 1; i <= this.totalPeople; i++) {
			const name = this.getParticipantName(i);
			const label = String(i);
			if (
				name.toLowerCase().includes(query) ||
				label === query ||
				this.getTableLabel(i - 1).toLowerCase() === query
			) {
				matches.push({ id: i, name });
				if (matches.length >= 8) break;
			}
		}
		return matches;
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
			this.saveState();
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

		storage.remove('total_people');
		storage.remove('table_count');
		storage.remove('table_capacity');
		storage.remove('names_input');
		storage.remove('rounds');
	}
}
