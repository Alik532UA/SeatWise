import { describe, expect, it } from 'vitest';
import { sessionStore, storage } from './storage';
import { STORAGE_PREFIX } from './storagePrefix';

describe('SeatWise Storage Facade (STORAGE-NAMESPACE-v10)', () => {
	it('defines correct STORAGE_PREFIX', () => {
		expect(STORAGE_PREFIX).toBe('seatwise_');
	});

	it('returns null safely in non-browser/SSR environment', () => {
		expect(storage.get('test_key')).toBeNull();
		expect(sessionStore.get('test_key')).toBeNull();
	});

	it('suppresses writes safely when storage is not available in non-browser environment', () => {
		expect(() => storage.set('test_key', 'val')).not.toThrow();
		expect(() => storage.remove('test_key')).not.toThrow();
		expect(() => sessionStore.set('test_key', 'val')).not.toThrow();
		expect(() => sessionStore.remove('test_key')).not.toThrow();
	});
});
