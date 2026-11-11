import { browser, dev } from '$app/environment';
import { APP_VERSION } from '$lib/config/version';
import { redact } from './redact';
import { sessionStore } from './storage';

export type LogLevel = 'info' | 'warn' | 'error';

export interface ErrorEvent {
	id: string;
	level: LogLevel;
	message: string;
	stack?: string;
	context: {
		component?: string;
		page?: string;
		timestamp: string;
		userAgent: string;
	};
	severity: 'low' | 'medium' | 'high' | 'critical';
}

const SESSION_STORAGE_KEY = 'logs_history';
const MAX_CACHE = 1000;
const MIRRORED = 200;

class ErrorLogger {
	private cache: ErrorEvent[] = [];
	private listeners = new Set<() => void>();
	private mirrorEnabled = browser;
	private persisting = false;

	readonly appVersion = APP_VERSION;

	constructor() {
		if (browser) {
			try {
				const saved = sessionStore.get(SESSION_STORAGE_KEY);
				if (saved) {
					const parsed = JSON.parse(saved);
					if (Array.isArray(parsed)) this.cache = parsed;
				}
			} catch {
				// Ignore storage failure on init
			}
		}
	}

	get errorCount(): number {
		return this.cache.filter((e) => e.level === 'error').length;
	}

	subscribe(fn: () => void): () => void {
		this.listeners.add(fn);
		return () => this.listeners.delete(fn);
	}

	private notify(): void {
		for (const fn of this.listeners) {
			try {
				fn();
			} catch {
				// Subscriber errors must never break the logger
			}
		}
	}

	private mirror(): void {
		if (!this.mirrorEnabled || this.persisting) return;
		this.persisting = true;
		try {
			const tail = this.cache.slice(-MIRRORED);
			sessionStore.set(SESSION_STORAGE_KEY, JSON.stringify(tail));
		} catch {
			this.mirrorEnabled = false;
		} finally {
			this.persisting = false;
		}
	}

	private createEvent(
		level: LogLevel,
		message: string,
		stack?: string,
		context?: { component?: string; page?: string },
		severity: 'low' | 'medium' | 'high' | 'critical' = 'medium'
	): ErrorEvent {
		const inBrowser = typeof window !== 'undefined';
		return {
			id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
			level,
			message: String(redact(message)),
			stack: stack ? String(redact(stack)) : undefined,
			context: {
				component: context?.component,
				page: context?.page,
				timestamp: new Date().toISOString(),
				userAgent: inBrowser ? navigator.userAgent : 'SSR'
			},
			severity
		};
	}

	logError(
		err: Error | string,
		context?: { component?: string; page?: string },
		rawError?: unknown
	): void {
		try {
			const message = err instanceof Error ? err.message : String(err);
			const stack =
				err instanceof Error ? err.stack : rawError instanceof Error ? rawError.stack : undefined;
			const event = this.createEvent('error', message, stack, context, 'high');

			this.cache.push(event);
			if (this.cache.length > MAX_CACHE) this.cache.shift();

			if (dev) {
				console.error(`[${context?.component ?? 'app'}] ${message}`, stack ?? '');
			}

			this.mirror();
			this.notify();
		} catch {
			// Logger must never throw
		}
	}

	logWarning(
		message: string,
		context?: { component?: string; page?: string },
		rawError?: unknown
	): void {
		try {
			const stack = rawError instanceof Error ? rawError.stack : undefined;
			const event = this.createEvent('warn', message, stack, context, 'low');

			this.cache.push(event);
			if (this.cache.length > MAX_CACHE) this.cache.shift();

			if (dev) {
				console.warn(`[${context?.component ?? 'app'}] ${message}`, stack ?? '');
			}

			this.mirror();
			this.notify();
		} catch {
			// Logger must never throw
		}
	}

	logInfo(message: string, context?: { component?: string; page?: string }): void {
		try {
			const event = this.createEvent('info', message, undefined, context, 'low');

			this.cache.push(event);
			if (this.cache.length > MAX_CACHE) this.cache.shift();

			if (dev) {
				console.info(`[${context?.component ?? 'app'}] ${message}`);
			}

			this.mirror();
			this.notify();
		} catch {
			// Logger must never throw
		}
	}

	getCache(): ErrorEvent[] {
		return [...this.cache];
	}

	clear(): void {
		this.cache = [];
		try {
			sessionStore.remove(SESSION_STORAGE_KEY);
		} catch {}
		this.notify();
	}
}

export const errorLogger = new ErrorLogger();
export const logService = errorLogger;
