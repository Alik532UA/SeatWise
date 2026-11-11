import { storage } from '$lib/services/storage';

/**
 * Визначає варіанти UI інтерфейсу додатку.
 * 'classic' замінює попередній 'professional' згідно з каноном.
 */
export type UISkin = 'classic' | 'compact' | 'visual';

/**
 * Керує активним варіантом інтерфейсу (Skin) та станом онбордингу.
 */
export class UIController {
	skin = $state<UISkin>('classic');
	isOnboardingOpen = $state(false);

	constructor() {
		const saved = storage.get('skin') as string | null;
		if (saved === 'classic' || saved === 'compact' || saved === 'visual') {
			this.skin = saved as UISkin;
		} else if (saved === 'professional') {
			this.skin = 'classic';
		}

		// Перевірка першого запуску для нового користувача
		const onboardingDone = storage.get('onboarding_completed');
		if (!onboardingDone) {
			this.isOnboardingOpen = true;
		}
	}

	setSkin(skin: UISkin) {
		this.skin = skin;
		storage.set('skin', skin);
	}

	startOnboarding() {
		this.isOnboardingOpen = true;
	}

	completeOnboarding() {
		this.isOnboardingOpen = false;
		storage.set('onboarding_completed', 'true');
	}
}
