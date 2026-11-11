import { describe, it, expect } from 'vitest';
import { SeatingController } from './SeatingController.svelte';

describe('SeatingController (Runes State & Seating Logic)', () => {
	it('initializes with default values', () => {
		const controller = new SeatingController();
		expect(controller.totalPeople).toBe(20);
		expect(controller.tableCount).toBe(8);
		expect(controller.tableCapacity).toBe(8);
		expect(controller.rounds).toEqual([]);
		expect(controller.errorMessage).toBe('');
		expect(controller.isCalculating).toBe(false);
	});

	it('computes participant names based on input or defaults to numbers', () => {
		const controller = new SeatingController();
		controller.totalPeople = 3;
		controller.namesInput = 'Олег Запольнов\nАнна Булат';

		expect(controller.participantNames).toEqual(['Олег Запольнов', 'Анна Булат', '3']);
		expect(controller.getParticipantName(1)).toBe('Олег Запольнов');
		expect(controller.getParticipantName(2)).toBe('Анна Булат');
		expect(controller.getParticipantName(3)).toBe('3');
	});

	it('computes initials correctly', () => {
		const controller = new SeatingController();
		controller.totalPeople = 2;
		controller.namesInput = 'Олег Запольнов\nОлена';

		expect(controller.getInitials(1)).toBe('ОЗ');
		expect(controller.getInitials(2)).toBe('ОЛ');
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

		expect(controller.totalPeople).toBe(20);
		expect(controller.namesInput).toBe('');
		expect(controller.rounds).toEqual([]);
	});
});
