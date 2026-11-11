import { describe, it, expect, vi } from 'vitest';
import { SeatingController, indexToLetter } from './SeatingController.svelte';
import { storage } from '$lib/services/storage';

describe('SeatingController (Runes State & Seating Logic)', () => {
	it('initializes with default values including letter tables and number guests', () => {
		const controller = new SeatingController();
		expect(controller.totalPeople).toBe(36);
		expect(controller.tableCount).toBe(6);
		expect(controller.tableCapacity).toBe(6);
		expect(controller.rounds).toEqual([]);
		expect(controller.errorMessage).toBe('');
		expect(controller.isCalculating).toBe(false);
		expect(controller.tableNaming).toBe('letters');
		expect(controller.participantNaming).toBe('numbers');
	});

	it('converts indices to bijective letters correctly (indexToLetter)', () => {
		expect(indexToLetter(0)).toBe('A');
		expect(indexToLetter(1)).toBe('B');
		expect(indexToLetter(25)).toBe('Z');
		expect(indexToLetter(26)).toBe('AA');
		expect(indexToLetter(27)).toBe('AB');
		expect(indexToLetter(51)).toBe('AZ');
		expect(indexToLetter(52)).toBe('BA');
	});

	it('formats table labels based on tableNaming mode', () => {
		const controller = new SeatingController();
		controller.setTableNaming('letters');
		expect(controller.getTableLabel(0)).toBe('A');
		expect(controller.getTableLabel(7)).toBe('H');

		controller.setTableNaming('numbers');
		expect(controller.getTableLabel(0)).toBe('1');
		expect(controller.getTableLabel(7)).toBe('8');
	});

	it('formats participant default names based on participantNaming mode', () => {
		const controller = new SeatingController();
		controller.setParticipantNaming('numbers');
		expect(controller.getParticipantDefaultName(1)).toBe('1');
		expect(controller.getParticipantDefaultName(5)).toBe('5');

		controller.setParticipantNaming('letters');
		expect(controller.getParticipantDefaultName(1)).toBe('A');
		expect(controller.getParticipantDefaultName(5)).toBe('E');
	});

	it('computes participant names based on input or defaults to numbers', () => {
		const controller = new SeatingController();
		controller.setParticipantNaming('numbers');
		controller.totalPeople = 3;
		controller.namesInput = 'Олег Запольнов\nАнна Булат';

		expect(controller.participantNames).toEqual(['Олег Запольнов', 'Анна Булат', '3']);
		expect(controller.getParticipantName(1)).toBe('Олег Запольнов');
		expect(controller.getParticipantName(2)).toBe('Анна Булат');
		expect(controller.getParticipantName(3)).toBe('3');
	});

	it('computes initials correctly for names, numbers and letters', () => {
		const controller = new SeatingController();
		controller.totalPeople = 3;
		controller.namesInput = 'Олег Запольнов\nОлена';

		expect(controller.getInitials(1)).toBe('ОЗ');
		expect(controller.getInitials(2)).toBe('ОЛ');
		expect(controller.getInitials(3)).toBe('3');

		controller.setParticipantNaming('letters');
		controller.namesInput = '';
		expect(controller.getInitials(1)).toBe('A');
	});

	it('formats text export with table letters and participant names', () => {
		const controller = new SeatingController();
		controller.totalPeople = 4;
		controller.tableCount = 2;
		controller.tableCapacity = 2;
		controller.setTableNaming('letters');
		controller.setParticipantNaming('numbers');
		controller.rounds = [
			[
				[1, 2],
				[3, 4]
			]
		];

		const text = controller.formatAsText();
		expect(text).toContain('Стіл A:');
		expect(text).toContain('Стіл B:');
	});

	it('validates capacity overflow error', () => {
		const controller = new SeatingController();
		controller.totalPeople = 100;
		controller.tableCount = 5;
		controller.tableCapacity = 10; // Max 50 people

		controller.calculate();
		expect(controller.errorMessage).not.toBe('');
		expect(controller.rounds.length).toBe(0);
	});

	it('resets state to defaults', () => {
		const controller = new SeatingController();
		controller.totalPeople = 40;
		controller.namesInput = 'Test Name';
		controller.reset();

		expect(controller.totalPeople).toBe(36);
		expect(controller.tableCount).toBe(6);
		expect(controller.tableCapacity).toBe(6);
		expect(controller.namesInput).toBe('');
		expect(controller.rounds).toEqual([]);
	});

	it('persists state and restores it on new instance (survives locale change/page reload)', () => {
		const mockStore: Record<string, string> = {};
		vi.spyOn(storage, 'get').mockImplementation((key: string) => mockStore[key] ?? null);
		vi.spyOn(storage, 'set').mockImplementation((key: string, val: string) => {
			mockStore[key] = val;
		});
		vi.spyOn(storage, 'remove').mockImplementation((key: string) => {
			delete mockStore[key];
		});

		const controller = new SeatingController();
		controller.totalPeople = 45;
		controller.tableCount = 9;
		controller.tableCapacity = 5;
		controller.namesInput = 'Person 1\nPerson 2';
		controller.rounds = [
			[
				[1, 2],
				[3, 4]
			]
		];

		controller.saveState();

		expect(mockStore['total_people']).toBe('45');
		expect(mockStore['table_count']).toBe('9');
		expect(mockStore['table_capacity']).toBe('5');
		expect(mockStore['names_input']).toBe('Person 1\nPerson 2');
		expect(mockStore['rounds']).toBe(
			JSON.stringify([
				[
					[1, 2],
					[3, 4]
				]
			])
		);

		// Симулюємо створення нового екземпляра після перемикання мови / релоаду
		const restoredController = new SeatingController();
		expect(restoredController.totalPeople).toBe(45);
		expect(restoredController.tableCount).toBe(9);
		expect(restoredController.tableCapacity).toBe(5);
		expect(restoredController.namesInput).toBe('Person 1\nPerson 2');
		expect(restoredController.rounds).toEqual([
			[
				[1, 2],
				[3, 4]
			]
		]);

		// Перевірка очищення при reset
		restoredController.reset();
		expect(mockStore['rounds']).toBeUndefined();
		expect(mockStore['total_people']).toBeUndefined();
		expect(mockStore['table_count']).toBeUndefined();
		expect(mockStore['table_capacity']).toBeUndefined();
		expect(mockStore['names_input']).toBeUndefined();

		vi.restoreAllMocks();
	});

	it('extracts participant cross-round schedule accurately and formats text', () => {
		const controller = new SeatingController();
		controller.totalPeople = 4;
		controller.tableCount = 2;
		controller.tableCapacity = 2;
		controller.setTableNaming('letters');
		controller.rounds = [
			// Round 1: Table A: [1, 2], Table B: [3, 4]
			[
				[1, 2],
				[3, 4]
			],
			// Round 2: Table A: [1, 3], Table B: [2, 4]
			[
				[1, 3],
				[2, 4]
			]
		];

		const sched1 = controller.getParticipantSchedule(1);
		expect(sched1.length).toBe(2);
		expect(sched1[0]).toEqual({
			roundIndex: 0,
			roundNumber: 1,
			tableIndex: 0,
			tableLabel: 'A',
			tableColor: 'var(--accent-primary)',
			companions: [2]
		});
		expect(sched1[1]).toEqual({
			roundIndex: 1,
			roundNumber: 2,
			tableIndex: 0,
			tableLabel: 'A',
			tableColor: 'var(--accent-primary)',
			companions: [3]
		});

		const sched4 = controller.getParticipantSchedule(4);
		expect(sched4.length).toBe(2);
		expect(sched4[0].tableLabel).toBe('B');
		expect(sched4[0].companions).toEqual([3]);
		expect(sched4[1].tableLabel).toBe('B');
		expect(sched4[1].companions).toEqual([2]);

		const text = controller.formatParticipantScheduleText(1);
		expect(text).toContain('Раунд 1: Стіл A');
		expect(text).toContain('Раунд 2: Стіл A');

		// Toggle selection
		expect(controller.selectedParticipantId).toBeNull();
		controller.toggleSelectedParticipant(1);
		expect(controller.selectedParticipantId).toBe(1);
		expect(controller.activeParticipantId).toBe(1);

		controller.toggleSelectedParticipant(1);
		expect(controller.selectedParticipantId).toBeNull();
	});
});
