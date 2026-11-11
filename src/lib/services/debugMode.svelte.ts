import { browser, dev } from '$app/environment';
import { storage } from './storage';

export const SHOW_PRESSES_PROD = 55;
export const HIDE_PRESSES = 5;

const STORAGE_KEY = 'debug_mode';

class DebugMode {
	override = $state<boolean | null>(null);

	constructor() {
		if (browser) {
			const stored = storage.get(STORAGE_KEY);
			this.override = stored === '1' ? true : stored === '0' ? false : null;
		}
	}

	get enabled(): boolean {
		return this.override ?? dev;
	}

	get pressesToToggle(): number {
		if (this.enabled) return HIDE_PRESSES;
		return dev ? HIDE_PRESSES : SHOW_PRESSES_PROD;
	}

	toggle(): boolean {
		const next = !this.enabled;
		this.override = next;
		storage.set(STORAGE_KEY, next ? '1' : '0');
		return next;
	}
}

export const debugMode = new DebugMode();
