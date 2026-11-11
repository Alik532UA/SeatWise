import { browser } from '$app/environment';
import { storage } from '$lib/services/storage';

/**
 * Керує колірною темою додатку (light/dark).
 * Дотримується архітектурних стандартів UI-UX-v10 та STORAGE-NAMESPACE-v10.
 */
export class ThemeController {
	theme = $state<'light' | 'dark'>('light');

	constructor() {
		if (browser) {
			const saved = storage.get('theme') as 'light' | 'dark' | null;
			const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
			this.theme = saved || (prefersDark ? 'dark' : 'light');
		}
	}

	toggle() {
		this.theme = this.theme === 'dark' ? 'light' : 'dark';
	}

	/**
	 * Синхронізує стан з DOM та сховищем.
	 * Має викликатися всередині $effect у компоненті.
	 */
	sync() {
		if (!browser) return;

		document.documentElement.setAttribute('data-theme', this.theme);
		storage.set('theme', this.theme);

		const meta = document.querySelector('meta[name="color-scheme"]');
		if (meta) {
			meta.setAttribute('content', this.theme === 'dark' ? 'dark' : 'light dark');
		}
	}
}
