import { storage } from '$lib/services/storage';

/**
 * Визначає варіанти UI інтерфейсу додатку.
 */
export type UISkin = 'professional' | 'compact' | 'visual';

/**
 * Керує активним варіантом інтерфейсу (Skin).
 * Дозволяє перемикати UI без зміни бізнес-логіки.
 */
export class UIController {
	skin = $state<UISkin>('professional');

	constructor() {
		const saved = storage.get('skin') as UISkin | null;
		if (saved) this.skin = saved;
	}

	setSkin(skin: UISkin) {
		this.skin = skin;
		storage.set('skin', skin);
	}
}
