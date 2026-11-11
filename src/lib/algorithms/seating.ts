import type { SeatingPlan } from '../types/seating';

/**
 * Множення у полі Галуа або за модулем простого числа.
 */
export function multiply(a: number, b: number, p: number): number {
	if (p === 8) {
		// Спеціальний випадок для GF(8) з поліномом x^3 + x + 1
		let res = 0;
		for (let i = 0; i < 3; i++) {
			if ((b & (1 << i)) !== 0) res ^= a << i;
		}
		for (let i = 5; i >= 3; i--) {
			if ((res & (1 << i)) !== 0) res ^= 11 << (i - 3);
		}
		return res;
	}
	// Для простих чисел 5, 7 тощо - звичайне множення за модулем
	return (a * b) % p;
}

/**
 * Універсальний конструктор афінної площини порядку P.
 * Гарантує P+1 раундів з нульовою колізією для N = P*P осіб.
 */
export function generatePerfectPlane(p: number): SeatingPlan {
	const result: SeatingPlan = [];

	// Раунд 1: Сортування за "рядками" (горизонталі)
	const r1: number[][] = Array.from({ length: p }, () => []);
	for (let x = 0; x < p; x++) {
		for (let y = 0; y < p; y++) {
			r1[x].push(x * p + y + 1);
		}
	}
	result.push(r1);

	// Раунд 2: Сортування за "стовпчиками" (вертикалі)
	const r2: number[][] = Array.from({ length: p }, () => []);
	for (let y = 0; y < p; y++) {
		for (let x = 0; x < p; x++) {
			r2[y].push(x * p + y + 1);
		}
	}
	result.push(r2);

	// Раунди 3...P+1: Використання кутових коефіцієнтів (slopes)
	for (let m = 1; m < p; m++) {
		const rSlope: number[][] = Array.from({ length: p }, () => []);
		for (let x = 0; x < p; x++) {
			for (let y = 0; y < p; y++) {
				let finalK;
				if (p === 8) {
					finalK = y ^ multiply(m, x, p);
				} else {
					finalK = (y + (m * x)) % p;
				}
				
				rSlope[finalK].push(x * p + y + 1);
			}
		}
		result.push(rSlope);
	}

	return result;
}

/**
 * Старі назви для сумісності (якщо потрібно)
 */
export function generatePerfect64(): SeatingPlan {
	return generatePerfectPlane(8);
}

/**
 * Алгоритм повного покриття графа знайомств з розумним скорингом кандидатів
 * та фазою глобальної оптимізації через парні перестановки учасників.
 */
export function generateUntilFullyConnected(N: number, T: number, C: number): SeatingPlan {
	let bestRounds: SeatingPlan = [];
	const totalPairsNeeded = (N * (N - 1)) / 2;
	const MAX_ROUNDS_SAFETY = 40; 

	// ОПТИМІЗАЦІЯ ШВИДКОСТІ: Якщо людей багато, зменшуємо кількість глобальних спроб,
	// оскільки локальний пошук Hill Climbing і так чудово оптимізує граф за один прохід.
	const ATTEMPTS = N > 50 ? 5 : 200; 

	for (let attempt = 0; attempt < ATTEMPTS; attempt++) {
		const pairs = Array.from({ length: N + 1 }, () => Array(N + 1).fill(false));
		let coveredPairs = 0;
		const currentRounds: SeatingPlan = [];

		while (coveredPairs < totalPairsNeeded && currentRounds.length < MAX_ROUNDS_SAFETY) {
			const tables: number[][] = Array.from({ length: T }, () => []);
			const available = Array.from({ length: N }, (_, i) => i + 1);
			
			available.sort(() => Math.random() - 0.5);

			const activeTablesCount = Math.ceil(N / C);
			const tableCapacities = Array(T).fill(0);
			let remainingPeople = N;

			for (let t = 0; t < activeTablesCount; t++) {
				const cap = Math.ceil(remainingPeople / (activeTablesCount - t));
				tableCapacities[t] = cap;
				remainingPeople -= cap;
			}

			// Крок 1: Жадібна чорнова розсадка
			for (let t = 0; t < T; t++) {
				while (tables[t].length < tableCapacities[t] && available.length > 0) {
					let bestCandidateIdx = -1;
					let maxScore = -1;

					for (let i = 0; i < available.length; i++) {
						const candidate = available[i];
						let unmetAtTable = 0;
						for (const member of tables[t]) {
							if (!pairs[candidate][member]) unmetAtTable++;
						}

						let totalUnmetGlobal = 0;
						for (let p = 1; p <= N; p++) {
							if (p !== candidate && !pairs[candidate][p]) totalUnmetGlobal++;
						}

						let currentScore = unmetAtTable * 1000 + totalUnmetGlobal;
						currentScore += Math.random() * 0.1;

						if (currentScore > maxScore) {
							maxScore = currentScore;
							bestCandidateIdx = i;
						}
					}

					if (bestCandidateIdx !== -1) {
						tables[t].push(available[bestCandidateIdx]);
						available.splice(bestCandidateIdx, 1);
					}
				}
			}

			// Крок 2: ОПТИМІЗАЦІЯ Hill Climbing (Локальний пошук)
			let improved = true;
			let swapIterations = 0;
			
			// Запобіжник swapIterations < 50 не дає алгоритму зациклюватися на великих N
			while (improved && swapIterations < 50) {
				improved = false;
				swapIterations++;
				for (let t1 = 0; t1 < T; t1++) {
					for (let t2 = t1 + 1; t2 < T; t2++) {
						for (let i = 0; i < tables[t1].length; i++) {
							for (let j = 0; j < tables[t2].length; j++) {
								const p1 = tables[t1][i];
								const p2 = tables[t2][j];

								let currentNewPairs = 0;
								for (const m of tables[t1]) if (m !== p1 && !pairs[p1][m]) currentNewPairs++;
								for (const m of tables[t2]) if (m !== p2 && !pairs[p2][m]) currentNewPairs++;

								let swappedNewPairs = 0;
								for (const m of tables[t1]) if (m !== p1 && !pairs[p2][m]) swappedNewPairs++;
								for (const m of tables[t2]) if (m !== p2 && !pairs[p1][m]) swappedNewPairs++;

								if (swappedNewPairs > currentNewPairs) {
									tables[t1][i] = p2;
									tables[t2][j] = p1;
									improved = true;
								}
							}
						}
					}
				}
			}

			// Крок 3: Фіксація зв'язків
			for (let t = 0; t < T; t++) {
				for (let i = 0; i < tables[t].length; i++) {
					for (let j = i + 1; j < tables[t].length; j++) {
						const p1 = tables[t][i];
						const p2 = tables[t][j];
						if (!pairs[p1][p2]) {
							pairs[p1][p2] = true;
							pairs[p2][p1] = true;
							coveredPairs++;
						}
					}
				}
			}
			currentRounds.push(tables);
		}

		if (bestRounds.length === 0 || currentRounds.length < bestRounds.length) {
			bestRounds = currentRounds;
		}
	}

	return bestRounds;
}
