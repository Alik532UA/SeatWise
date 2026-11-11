/**
 * Результат розсадки за один раунд.
 * Масив столів, де кожен стіл — це масив номерів учасників.
 */
export type Round = number[][];

/**
 * Повний результат розсадки — масив раундів.
 */
export type SeatingPlan = Round[];

/**
 * Конфігурація розсадки.
 */
export interface SeatingConfig {
	totalPeople: number;
	tableCount: number;
	tableCapacity: number;
}
