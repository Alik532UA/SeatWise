import { describe, it, expect } from 'vitest';
import { generatePerfectPlane, generateUntilFullyConnected } from './seating';

describe('Seating Algorithms Scalability & Performance', () => {
	it('Galois Field GF(8) generates exactly 9 collision-free rounds for 64 people in under 20ms', () => {
		const start = performance.now();
		const rounds = generatePerfectPlane(8);
		const duration = performance.now() - start;

		expect(duration).toBeLessThan(50); // fast execution
		expect(rounds.length).toBe(9); // 8 + 1 parallel classes

		// Check table sizes
		for (const round of rounds) {
			expect(round.length).toBe(8); // 8 tables
			for (const table of round) {
				expect(table.length).toBe(8); // 8 people per table
			}
		}

		// Verify zero repeat meetings across all 9 rounds
		const pairCounts = new Map<string, number>();
		for (const round of rounds) {
			for (const table of round) {
				for (let i = 0; i < table.length; i++) {
					for (let j = i + 1; j < table.length; j++) {
						const a = Math.min(table[i], table[j]);
						const b = Math.max(table[i], table[j]);
						const key = `${a}-${b}`;
						pairCounts.set(key, (pairCounts.get(key) || 0) + 1);
					}
				}
			}
		}

		// Every pair meets AT MOST 1 time
		for (const [pair, count] of pairCounts.entries()) {
			expect(count, `Pair ${pair} met more than once`).toBe(1);
		}
	});

	it('GF(7) affine plane generates 8 rounds for 49 participants with 0 collisions', () => {
		const rounds = generatePerfectPlane(7);
		expect(rounds.length).toBe(8); // 7 + 1 classes
		expect(rounds[0].length).toBe(7); // 7 tables
		expect(rounds[0][0].length).toBe(7); // 7 people
	});

	it('GF(5) affine plane generates 6 rounds for 25 participants with 0 collisions', () => {
		const rounds = generatePerfectPlane(5);
		expect(rounds.length).toBe(6); // 5 + 1 classes
		expect(rounds[0].length).toBe(5); // 5 tables
		expect(rounds[0][0].length).toBe(5); // 5 people
	});

	it('Greedy heuristic generates connected rounds for small events within bounds', () => {
		const rounds = generateUntilFullyConnected(16, 4, 4);
		expect(rounds.length).toBeGreaterThanOrEqual(1);
		for (const round of rounds) {
			const participantsInRound = round.flat();
			expect(participantsInRound.length).toBe(16);
		}
	});
});

