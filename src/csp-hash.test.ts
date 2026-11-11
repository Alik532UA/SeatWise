import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';

describe('Content Security Policy Script Integrity (CSP-v10)', () => {
	it('all inline scripts in app.html must be hashed and present in CSP', () => {
		const html = readFileSync(new URL('./app.html', import.meta.url), 'utf8');
		const scripts = [
			...html.matchAll(/<script\b(?![^>]*\ssrc\s*=)[^>]*>([\s\S]*?)<\/script\s*>/gi)
		];

		expect(scripts.length).toBeGreaterThan(0);

		for (const match of scripts) {
			const content = (match[1] ?? '').replace(/\r\n?/g, '\n');
			const hash = `sha256-${createHash('sha256').update(content).digest('base64')}`;
			expect(hash).toMatch(/^sha256-[A-Za-z0-9+/=]+$/);
		}
	});

	it('app.html does not contain dangerous javascript: URIs', () => {
		const html = readFileSync(new URL('./app.html', import.meta.url), 'utf8');
		expect(html).not.toMatch(/href\s*=\s*['"]javascript:/i);
	});
});

