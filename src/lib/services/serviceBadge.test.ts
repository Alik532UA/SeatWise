import { describe, it, expect, beforeEach } from 'vitest';
import { redact } from './redact';
import { errorLogger } from './errorLogger';
import { buildLogReport } from './errorReport';
import { createKeySequence } from './keySequence';
import { APP_VERSION } from '$lib/config/version';

describe('redact (SECURITY-v10 § 10)', () => {
	it('masks email addresses in text', () => {
		const text = 'User john.doe@example.com logged in';
		expect(redact(text)).toBe('User j***@example.com logged in');
	});

	it('masks sensitive parameters in URLs', () => {
		const url = 'https://example.com/api?token=secret123&user=admin';
		expect(redact(url)).toContain('token=[redacted]');
		expect(redact(url)).toContain('user=admin');
	});

	it('masks sensitive keys in objects', () => {
		const obj = {
			username: 'alex',
			password: 'my-secret-password',
			apiKey: 'AIza123456789'
		};
		const redacted = redact(obj) as Record<string, string>;
		expect(redacted.username).toBe('alex');
		expect(redacted.password).toBe('[redacted]');
		expect(redacted.apiKey).toBe('[redacted]');
	});
});

describe('errorLogger & errorReport (DEBUGGING-v10 § 1 & § 2)', () => {
	beforeEach(() => {
		errorLogger.clear();
	});

	it('appVersion is defined and matches semver format', () => {
		expect(errorLogger.appVersion).toBe(APP_VERSION);
		expect(errorLogger.appVersion).toMatch(/^\d+\.\d+\.\d+/);
	});

	it('logs errors and updates errorCount', () => {
		expect(errorLogger.errorCount).toBe(0);
		errorLogger.logError(new Error('Sample test error'), { component: 'UnitTest' });
		expect(errorLogger.errorCount).toBe(1);

		const cache = errorLogger.getCache();
		expect(cache.length).toBe(1);
		expect(cache[0].message).toBe('Sample test error');
		expect(cache[0].level).toBe('error');
	});

	it('buildLogReport builds comprehensive report with header', () => {
		errorLogger.logInfo('App initialized', { component: 'Init' });
		errorLogger.logWarning('Network slow', { component: 'Network' });
		errorLogger.logError(new Error('Boom'), { component: 'Crash' });

		const report = buildLogReport();
		expect(report).toContain('--- LOG REPORT ---');
		expect(report).toContain(`VERSION: ${errorLogger.appVersion}`);
		expect(report).toContain('ERRORS: 1 / 3');
		expect(report).toContain('[INFO] [Init] App initialized');
		expect(report).toContain('[WARN] [Network] Network slow');
		expect(report).toContain('[ERROR] [Crash] Boom');
	});
});

describe('keySequence (HOTKEYS-v10 § 2)', () => {
	it('triggers callback only after reaching threshold', () => {
		let completed = false;
		const sequence = createKeySequence({
			code: 'KeyV',
			threshold: 5,
			onComplete: () => {
				completed = true;
			}
		});

		for (let i = 0; i < 4; i++) {
			sequence.handle({ code: 'KeyV' });
			expect(completed).toBe(false);
		}

		sequence.handle({ code: 'KeyV' });
		expect(completed).toBe(true);
	});

	it('resets when a different key is pressed', () => {
		let completed = false;
		const sequence = createKeySequence({
			code: 'KeyV',
			threshold: 3,
			onComplete: () => {
				completed = true;
			}
		});

		sequence.handle({ code: 'KeyV' });
		sequence.handle({ code: 'KeyV' });
		expect(sequence.count).toBe(2);

		sequence.handle({ code: 'KeyA' }); // Broken sequence
		expect(sequence.count).toBe(0);
		expect(completed).toBe(false);
	});
});
