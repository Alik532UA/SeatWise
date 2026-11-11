// svelte.config.js — канонічний файл (CODE-QUALITY § 1.1.1)
import adapter from '@sveltejs/adapter-static';
import { execSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';

const basePath = /** @type {'' | `/${string}`} */ (process.env.BASE_PATH ?? '/SeatWise');
const fallback = process.env.VITE_ENV === 'dev' ? undefined : '404.html';

const pkg = JSON.parse(readFileSync(new URL('./package.json', import.meta.url), 'utf8'));
function commit() {
	if (process.env.GITHUB_SHA) return process.env.GITHUB_SHA.slice(0, 7);
	try {
		return execSync('git rev-parse --short HEAD', {
			encoding: 'utf8',
			stdio: ['pipe', 'pipe', 'ignore']
		}).trim();
	} catch {
		return 'local';
	}
}
const VERSION_NAME = `${pkg.version}+${commit()}`;

const asBrowserSees = (text) => text.replace(/\r\n?/g, '\n');

/**
 * Хеші інлайн-скриптів app.html — з файлу, під час збірки.
 * @returns {Array<`sha256-${string}`>}
 */
const inlineScriptHashes = () => {
	try {
		return [
			...readFileSync(new URL('./src/app.html', import.meta.url), 'utf8').matchAll(
				/<script\b(?![^>]*\ssrc\s*=)[^>]*>([\s\S]*?)<\/script\s*>/gi
			)
		].map(
			(m) =>
				/** @type {`sha256-${string}`} */ (
					`sha256-${createHash('sha256')
						.update(asBrowserSees(m[1] ?? ''))
						.digest('base64')}`
				)
		);
	} catch {
		return [];
	}
};

/** @type {import('@sveltejs/kit').KitConfig['csp']} */
const csp = {
	mode: 'auto',
	directives: {
		'default-src': ['self'],
		'script-src': ['self', ...inlineScriptHashes()],
		'style-src': ['self', 'unsafe-inline'],
		'img-src': ['self', 'data:'],
		'connect-src': ['self'],
		'object-src': ['none'],
		'base-uri': ['self'],
		'form-action': ['self']
	}
};

/** @type {import('@sveltejs/kit').Config} */
const config = {
	compilerOptions: {
		runes: ({ filename }) => (filename.split(/[/\\]/).includes('node_modules') ? undefined : true)
	},
	kit: {
		adapter: adapter({ pages: 'build', assets: 'build', fallback }),
		paths: { base: basePath, relative: false },
		version: { name: VERSION_NAME, pollInterval: 60_000 },
		prerender: { entries: ['*'] },
		csp
	}
};

export default config;
