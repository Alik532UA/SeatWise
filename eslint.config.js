import svelteParser from 'svelte-eslint-parser';
import sveltePlugin from 'eslint-plugin-svelte';
import tsPlugin from '@typescript-eslint/eslint-plugin';
import tsParser from '@typescript-eslint/parser';
import prettierConfig from 'eslint-config-prettier';

export default [
	{
		ignores: [
			'build/',
			'.svelte-kit/',
			'dist/',
			'node_modules/',
			'static/',
			'src/lib/paraglide/'
		]
	},
	{
		files: ['*.js', '*.mjs', 'scripts/**/*.mjs'],
		languageOptions: {
			parser: tsParser,
			parserOptions: {
				project: null
			}
		},
		rules: {
			'no-undef': 'off'
		}
	},
	{
		files: ['src/**/*.ts', 'tests/**/*.ts'],
		languageOptions: {
			parser: tsParser,
			parserOptions: {
				project: null
			}
		},
		plugins: {
			'@typescript-eslint': tsPlugin
		},
		rules: {
			...tsPlugin.configs.recommended.rules,
			'@typescript-eslint/no-explicit-any': 'warn',
			'@typescript-eslint/no-unused-vars': [
				'warn',
				{ argsIgnorePattern: '^_', varsIgnorePattern: '^_' }
			]
		}
	},
	{
		files: ['src/**/*.svelte'],
		languageOptions: {
			parser: svelteParser,
			parserOptions: {
				parser: tsParser,
				extraFileExtensions: ['.svelte']
			}
		},
		plugins: {
			svelte: sveltePlugin
		},
		rules: {
			...sveltePlugin.configs.recommended.rules
		}
	},
	prettierConfig
];

