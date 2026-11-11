import { existsSync, readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = resolve(__dirname, '..');
const buildDir = resolve(rootDir, 'build');
const pkgPath = resolve(rootDir, 'package.json');

const requiredFiles = ['index.html', '404.html', 'app-version.json'];

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

// Validate build/app-version.json consistency with package.json (VERSIONING-v10 § 6)
const versionFile = resolve(buildDir, 'app-version.json');
if (existsSync(versionFile) && existsSync(pkgPath)) {
	try {
		const pkg = JSON.parse(readFileSync(pkgPath, 'utf8'));
		const built = JSON.parse(readFileSync(versionFile, 'utf8'));

		if (built.version !== pkg.version) {
			console.error(
				`❌ Version mismatch in build: ${built.version} in app-version.json vs ${pkg.version} in package.json`
			);
			errors++;
		} else {
			console.log(`✓ Validated app-version.json matches package.json: ${pkg.version}`);
		}
	} catch (e) {
		console.error(`❌ Failed parsing app-version.json or package.json: ${e}`);
		errors++;
	}
}

if (errors > 0) {
	console.error(`Build check failed with ${errors} errors.`);
	process.exit(1);
} else {
	console.log('✓ All build output files verified successfully.');
	process.exit(0);
}
