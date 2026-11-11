import { describe, it, expect } from 'vitest';
import { multiply, generatePerfectPlane, generateUntilFullyConnected } from './seating';

describe('Seating Algorithms', () => {
	describe('multiply', () => {
		it('should multiply numbers in GF(8) correctly', () => {
			expect(multiply(1, 1, 8)).toBe(1);
			expect(multiply(2, 2, 8)).toBe(4);
			expect(multiply(4, 2, 8)).toBe(3); 
			expect(multiply(7, 3, 8)).toBe(2);
		});

		it('should multiply numbers in GF(5) correctly', () => {
			expect(multiply(2, 2, 5)).toBe(4);
			expect(multiply(3, 4, 5)).toBe(2); // 12 % 5 = 2
		});
	});

	describe('generatePerfectPlane', () => {
		it('should generate exactly P+1 rounds', () => {
			expect(generatePerfectPlane(5).length).toBe(6);
			expect(generatePerfectPlane(7).length).toBe(8);
			expect(generatePerfectPlane(8).length).toBe(9);
		});

		it('should not have any duplicate people in a single round (GF5)', () => {
			const plan = generatePerfectPlane(5);
			plan.forEach(round => {
				const people = round.flat();
				const uniquePeople = new Set(people);
				expect(uniquePeople.size).toBe(25);
			});
		});

		it('should not have any repeat meetings in GF5', () => {
			const plan = generatePerfectPlane(5);
			const meetings = new Set<string>();

			plan.forEach(round => {
				round.forEach(table => {
					for (let i = 0; i < table.length; i++) {
						for (let j = i + 1; j < table.length; j++) {
							const p1 = Math.min(table[i], table[j]);
							const p2 = Math.max(table[i], table[j]);
							const pair = `${p1}-${p2}`;
							expect(meetings.has(pair)).toBe(false);
							meetings.add(pair);
						}
					}
				});
			});
		});
	});

	describe('generateUntilFullyConnected', () => {
		it('should ensure everyone meets everyone for small N', () => {
			const N = 6, T = 2, C = 3;
			const plan = generateUntilFullyConnected(N, T, C);
			const meetings = new Set<string>();
			plan.forEach(round => {
				round.forEach(table => {
					for (let i = 0; i < table.length; i++) {
						for (let j = i + 1; j < table.length; j++) {
							const p1 = Math.min(table[i], table[j]);
							const p2 = Math.max(table[i], table[j]);
							meetings.add(`${p1}-${p2}`);
						}
					}
				});
			});
			expect(meetings.size).toBe((N * (N - 1)) / 2);
		});
	});
});
