import { describe, it, expect } from 'vitest';
import { STORAGE_PREFIX, scopedKey } from '$lib/services/storagePrefix';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

describe('Security & Storage Isolation (SECURITY-v10 & STORAGE-NAMESPACE-v10)', () => {
	it('storage prefix is unique and ends with an underscore', () => {
		expect(STORAGE_PREFIX).toBe('seatwise_');
		expect(STORAGE_PREFIX.endsWith('_')).toBe(true);
	});

	it('scopedKey properly applies prefix', () => {
		expect(scopedKey('theme')).toBe('seatwise_theme');
		expect(scopedKey('skin')).toBe('seatwise_skin');
	});

	it('no unescaped {@html} tags in svelte components except permitted icons', () => {
		function scanDir(dir: string, fileList: string[] = []): string[] {
			const files = readdirSync(dir);
			for (const file of files) {
				const fullPath = join(dir, file);
				if (statSync(fullPath).isDirectory()) {
					if (!fullPath.includes('node_modules') && !fullPath.includes('.svelte-kit')) {
						scanDir(fullPath, fileList);
					}
				} else if (file.endsWith('.svelte')) {
					fileList.push(fullPath);
				}
			}
			return fileList;
		}

		const srcDir = fileURLToPath(new URL('./', import.meta.url));
		const svelteFiles = scanDir(srcDir);
		expect(svelteFiles.length).toBeGreaterThan(0);

		for (const file of svelteFiles) {
			const content = readFileSync(file, 'utf8');
			const htmlMatches = content.match(/\{@html\s+([^}]+)\}/g) || [];
			for (const match of htmlMatches) {
				expect(match).not.toMatch(/user|input|query|url/i);
			}
		}
	});
});
