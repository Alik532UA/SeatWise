import { errorLogger } from './errorLogger';
import { redact } from './redact';

/**
 * Формує текстовий діагностичний звіт для буфера обміну (DEBUGGING-v10 § 2.3).
 */
export function buildLogReport(): string {
	const inBrowser = typeof window !== 'undefined';
	const all = errorLogger.getCache();

	const header = [
		'--- LOG REPORT ---',
		`DATE: ${new Date().toISOString()}`,
		`VERSION: ${errorLogger.appVersion}`,
		`URL: ${inBrowser ? redact(window.location.href) : 'SSR'}`,
		`DEVICE: ${inBrowser ? navigator.userAgent : 'SSR'}`,
		`ONLINE: ${inBrowser ? navigator.onLine : 'n/a'}`,
		`ERRORS: ${errorLogger.errorCount} / ${all.length}`,
		'---'
	].join('\n');

	const body = all
		.map(
			(e) =>
				`[${e.context.timestamp}] [${e.level.toUpperCase()}] ` +
				`[${e.context.component ?? 'app'}] ${e.message}` +
				(e.stack ? `\n${e.stack}` : '')
		)
		.join('\n');

	return `${header}\n${body || '[No logs recorded]'}`;
}
