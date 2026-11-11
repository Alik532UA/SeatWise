// src/lib/services/redact.ts — Canon v10 PII redaction (SECURITY-v10 § 10)
const SENSITIVE_KEY =
	/pass(?:word)?|token|secret|authorization|cookie|session|e-?mail|phone|api[-_]?key/i;
const MASK = '[redacted]';
/** Пошта, зокрема закодована в адресі чи тілі форми (`john%40example.com`). */
const EMAIL = /\b([\w.%+-])[\w.%+-]*?(?:@|%40)([\w-]+(?:\.[\w-]+)*\.[a-z]{2,})\b/gi;
/** Пара `ключ=значення` — у `?` і `#` абсолютної чи відносної адреси, у рядку параметрів, у тілі форми. */
const PAIR = /(^|[?&#;\s])([^=&#;\s"'<>]+)=([^&#;\s"'<>]*)/g;
/** Пара `"ключ": значення` у рядку JSON (тіло відповіді в повідомленні про збій). */
const JSON_PAIR = /("((?:[^"\\]|\\.)*)"\s*:\s*)("(?:[^"\\]|\\.)*"|-?\d[\d.eE+-]*|true|false|null)/g;

function sensitive(key: string): boolean {
	try {
		return SENSITIVE_KEY.test(decodeURIComponent(key));
	} catch {
		return SENSITIVE_KEY.test(key);
	}
}

function redactText(text: string): string {
	return text
		.replace(/https?:\/\/[^\s"'<>]+/gi, (address) => {
			try {
				const url = new URL(address);
				if (url.password) url.password = MASK;
				return url.href;
			} catch {
				return address;
			}
		})
		.replace(PAIR, (pair: string, lead: string, key: string) =>
			sensitive(key) ? `${lead}${key}=${MASK}` : pair
		)
		.replace(JSON_PAIR, (pair: string, head: string, key: string) =>
			sensitive(key) ? `${head}"${MASK}"` : pair
		)
		.replace(EMAIL, (_, first: string, domain: string) => `${first}***@${domain}`);
}

export function redact(value: unknown, ancestors: WeakSet<object> = new WeakSet()): unknown {
	if (typeof value === 'string') return redactText(value);
	if (typeof value === 'bigint' || typeof value === 'symbol') return String(value);
	if (typeof value === 'function') return '[function]';
	if (value === null || typeof value !== 'object') return value;
	if (ancestors.has(value)) return '[circular]';
	ancestors.add(value);
	try {
		if (value instanceof Error) {
			return {
				...(redact({ ...value }, ancestors) as Record<string, unknown>),
				name: value.name,
				message: redactText(value.message),
				stack: value.stack === undefined ? undefined : redactText(value.stack),
				cause: redact(value.cause, ancestors)
			};
		}
		if (Array.isArray(value)) return value.map((item) => redact(item, ancestors));
		if (value instanceof Map) return redact(Object.fromEntries(value), ancestors);
		if (value instanceof Set) return redact([...value], ancestors);

		const proto = Object.getPrototypeOf(value);
		if (proto !== Object.prototype && proto !== null) return redactText(String(value));
		return Object.fromEntries(
			Object.entries(value).map(([key, item]) => [
				key,
				SENSITIVE_KEY.test(key) ? MASK : redact(item, ancestors)
			])
		);
	} finally {
		ancestors.delete(value);
	}
}
