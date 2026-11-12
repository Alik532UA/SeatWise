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
					finalK = (y + m * x) % p;
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

	// ОПТИМІЗАЦІЯ ШВИДКОСТІ ТА МАСШТАБОВАНОСТІ:
	// Адаптивна кількість спроб та ітерацій локального пошуку залежно від розміру графа.
	const ATTEMPTS = N > 60 ? 3 : N > 30 ? 15 : 100;
	const MAX_SWAP_ITERS = N > 60 ? 15 : 40;
	const stride = N + 1;

	for (let attempt = 0; attempt < ATTEMPTS; attempt++) {
		// Оптимізована пласка матриця пар через Uint8Array для мінімізації навантаження на GC
		const pairs = new Uint8Array(stride * stride);
		let coveredPairs = 0;
		const currentRounds: SeatingPlan = [];

		while (coveredPairs < totalPairsNeeded && currentRounds.length < MAX_ROUNDS_SAFETY) {
			const tables: number[][] = Array.from({ length: T }, () => []);
			const available: number[] = new Array(N);
			for (let i = 0; i < N; i++) available[i] = i + 1;

			// Fisher-Yates швидке перемішування
			for (let i = N - 1; i > 0; i--) {
				const j = Math.floor(Math.random() * (i + 1));
				const tmp = available[i];
				available[i] = available[j];
				available[j] = tmp;
			}

			const activeTablesCount = Math.ceil(N / C);
			const tableCapacities = new Array(T).fill(0);
			let remainingPeople = N;

			for (let t = 0; t < activeTablesCount; t++) {
				const cap = Math.ceil(remainingPeople / (activeTablesCount - t));
				tableCapacities[t] = cap;
				remainingPeople -= cap;
			}

			// Крок 1: Жадібна чорнова розсадка
			let availLen = available.length;
			for (let t = 0; t < T; t++) {
				const targetCap = tableCapacities[t];
				while (tables[t].length < targetCap && availLen > 0) {
					let bestCandidateIdx = -1;
					let maxScore = -1;

					// Для великих N обмежуємо кількість перевірених кандидатів для O(N) замість O(N^2)
					const scanLimit = availLen > 40 ? 30 : availLen;
					for (let i = 0; i < scanLimit; i++) {
						const candidate = available[i];
						const cOffset = candidate * stride;
						let unmetAtTable = 0;
						for (let m = 0; m < tables[t].length; m++) {
							if (pairs[cOffset + tables[t][m]] === 0) unmetAtTable++;
						}

						let totalUnmetGlobal = 0;
						for (let p = 1; p <= N; p++) {
							if (p !== candidate && pairs[cOffset + p] === 0) totalUnmetGlobal++;
						}

						const currentScore = unmetAtTable * 1000 + totalUnmetGlobal + Math.random() * 0.1;

						if (currentScore > maxScore) {
							maxScore = currentScore;
							bestCandidateIdx = i;
						}
					}

					if (bestCandidateIdx !== -1) {
						tables[t].push(available[bestCandidateIdx]);
						// Швидке видалення O(1) перестановкою з кінцем масиву
						available[bestCandidateIdx] = available[availLen - 1];
						availLen--;
					} else {
						break;
					}
				}
			}

			// Крок 2: ОПТИМІЗАЦІЯ Hill Climbing (Локальний пошук)
			let improved = true;
			let swapIterations = 0;

			while (improved && swapIterations < MAX_SWAP_ITERS) {
				improved = false;
				swapIterations++;
				for (let t1 = 0; t1 < T; t1++) {
					for (let t2 = t1 + 1; t2 < T; t2++) {
						const tbl1 = tables[t1];
						const tbl2 = tables[t2];
						for (let i = 0; i < tbl1.length; i++) {
							for (let j = 0; j < tbl2.length; j++) {
								const p1 = tbl1[i];
								const p2 = tbl2[j];
								const p1Offset = p1 * stride;
								const p2Offset = p2 * stride;

								let currentNewPairs = 0;
								for (let m = 0; m < tbl1.length; m++) {
									const mem = tbl1[m];
									if (mem !== p1 && pairs[p1Offset + mem] === 0) currentNewPairs++;
								}
								for (let m = 0; m < tbl2.length; m++) {
									const mem = tbl2[m];
									if (mem !== p2 && pairs[p2Offset + mem] === 0) currentNewPairs++;
								}

								let swappedNewPairs = 0;
								for (let m = 0; m < tbl1.length; m++) {
									const mem = tbl1[m];
									if (mem !== p1 && pairs[p2Offset + mem] === 0) swappedNewPairs++;
								}
								for (let m = 0; m < tbl2.length; m++) {
									const mem = tbl2[m];
									if (mem !== p2 && pairs[p1Offset + mem] === 0) swappedNewPairs++;
								}

								if (swappedNewPairs > currentNewPairs) {
									tbl1[i] = p2;
									tbl2[j] = p1;
									improved = true;
								}
							}
						}
					}
				}
			}

			// Крок 3: Фіксація зв'язків
			let roundNewPairs = 0;
			for (let t = 0; t < T; t++) {
				const tbl = tables[t];
				for (let i = 0; i < tbl.length; i++) {
					const p1 = tbl[i];
					const p1Offset = p1 * stride;
					for (let j = i + 1; j < tbl.length; j++) {
						const p2 = tbl[j];
						if (pairs[p1Offset + p2] === 0) {
							pairs[p1Offset + p2] = 1;
							pairs[p2 * stride + p1] = 1;
							coveredPairs++;
							roundNewPairs++;
						}
					}
				}
			}
			currentRounds.push(tables);

			// Якщо цей раунд не приніс жодного нового знайомства, зупиняємо нарощування
			if (roundNewPairs === 0) {
				break;
			}
		}

		if (bestRounds.length === 0 || currentRounds.length < bestRounds.length) {
			bestRounds = currentRounds;
		}

		// Якщо досягнуто 100% покриття графа, подальші спроби не потрібні
		if (coveredPairs >= totalPairsNeeded) {
			break;
		}
	}

	return bestRounds;
}
