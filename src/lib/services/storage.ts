import { browser } from '$app/environment';
import { STORAGE_PREFIX } from './storagePrefix';

/**
 * Ізольований фасад доступу до Web Storage (STORAGE-NAMESPACE-v10 § 1).
 * Усі ключі автоматично отримують префікс 'seatwise_'.
 * Безпечно ковтає винятки у приватному режимі перегляду та при відключених cookie.
 */
export const storage = {
	get(key: string): string | null {
		if (!browser) return null;
		try {
			return localStorage.getItem(STORAGE_PREFIX + key);
		} catch {
			return null;
		}
	},
	set(key: string, value: string): void {
		if (!browser) return;
		try {
			localStorage.setItem(STORAGE_PREFIX + key, value);
		} catch {}
	},
	remove(key: string): void {
		if (!browser) return;
		try {
			localStorage.removeItem(STORAGE_PREFIX + key);
		} catch {}
	}
};

export const sessionStore = {
	get(key: string): string | null {
		if (!browser) return null;
		try {
			return sessionStorage.getItem(STORAGE_PREFIX + key);
		} catch {
			return null;
		}
	},
	set(key: string, value: string): void {
		if (!browser) return;
		try {
			sessionStorage.setItem(STORAGE_PREFIX + key, value);
		} catch {}
	},
	remove(key: string): void {
		if (!browser) return;
		try {
			sessionStorage.removeItem(STORAGE_PREFIX + key);
		} catch {}
	}
};

