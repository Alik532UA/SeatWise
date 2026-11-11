import { existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = resolve(__dirname, '..');
const buildDir = resolve(rootDir, 'build');

const requiredFiles = [
	'index.html',
	'404.html'
];

let errors = 0;

for (const file of requiredFiles) {
	const p = resolve(buildDir, file);
	if (!existsSync(p)) {
		console.error(`❌ Missing build artifact: ${file}`);
		errors++;
	} else {
		console.log(`✓ Validated build file: ${file}`);
	}
}

if (errors > 0) {
	console.error(`Build check failed with ${errors} errors.`);
	process.exit(1);
} else {
	console.log('✓ All build output files verified successfully.');
	process.exit(0);
}

