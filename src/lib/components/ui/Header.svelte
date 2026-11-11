<script lang="ts">
	import { getContext } from 'svelte';
	import type { ThemeController } from '$lib/controllers/ThemeController.svelte';
	import type { UIController } from '$lib/controllers/UIController.svelte';
	import type { SeatingController } from '$lib/controllers/SeatingController.svelte';
	import * as m from '$lib/paraglide/messages';
	import { setLocale, getLocale, locales } from '$lib/paraglide/runtime';
	import { RocketLaunch, ArrowSquareOut, Sun, Moon, Compass, Gear } from 'phosphor-svelte';

	const theme = getContext<ThemeController>('theme');
	const ui = getContext<UIController>('ui');
	const seating = getContext<SeatingController>('seating');

	const handleLocaleChange = (newLocale: string) => {
		if (seating) {
			seating.saveState();
		}
		setLocale(newLocale as any);
	};
</script>

<header class="main-header">
	<div class="logo">
		<h1>{m.app_title()}</h1>
		<p class="subtitle">{m.app_subtitle()}</p>
	</div>

	<div class="controls">
		<button
			type="button"
			class="wizard-open-btn touch-target"
			onclick={() => ui.startOnboarding()}
			title={m.step_restart_wizard()}
			aria-label={m.step_restart_wizard()}
			data-testid="restart-wizard-btn"
		>
			<Compass size={16} weight="bold" />
			<span>{m.onboarding_title()}</span>
		</button>

		<a
			href="https://alik532ua.github.io/DigitalWorkshop/"
			target="_blank"
			rel="noopener noreferrer"
			class="order-cta-btn touch-target"
			data-testid="order-cta-btn"
			title={m.order_cta()}
		>
			<RocketLaunch size={16} weight="bold" />
			<span class="cta-full-text">{m.order_cta()}</span>
			<span class="cta-short-text">{m.order_cta_short?.() || 'Замовити сайт ↗'}</span>
			<span class="cta-arrow"><ArrowSquareOut size={14} weight="bold" /></span>
		</a>

		<div
			class="skin-select-box"
			role="radiogroup"
			aria-label={m.ui_variant?.() || 'Варіант UI'}
			data-testid="skin-select-group"
		>
			<button
				type="button"
				class="skin-tab-btn"
				class:active={ui.skin === 'classic' || (ui.skin as string) === 'professional'}
				onclick={() => ui.setSkin('classic')}
				aria-checked={ui.skin === 'classic' || (ui.skin as string) === 'professional'}
				role="radio"
				data-testid="skin-btn-classic"
			>
				{m.skin_classic?.() || 'Classic'}
			</button>
			<button
				type="button"
				class="skin-tab-btn"
				class:active={ui.skin === 'compact'}
				onclick={() => ui.setSkin('compact')}
				aria-checked={ui.skin === 'compact'}
				role="radio"
				data-testid="skin-btn-compact"
			>
				{m.skin_compact?.() || 'Compact'}
			</button>
			<button
				type="button"
				class="skin-tab-btn"
				class:active={ui.skin === 'visual'}
				onclick={() => ui.setSkin('visual')}
				aria-checked={ui.skin === 'visual'}
				role="radio"
				data-testid="skin-btn-visual"
			>
				{m.skin_visual?.() || 'Visual'}
			</button>
		</div>

		<button
			type="button"
			class="settings-btn touch-target"
			onclick={() => ui.toggleSettings()}
			title={m.settings?.() || 'Налаштування'}
			aria-label={m.settings?.() || 'Налаштування'}
			data-testid="settings-open-btn"
		>
			<Gear size={18} weight="bold" />
		</button>

		<button
			type="button"
			class="theme-toggle touch-target"
			onclick={() => theme.toggle()}
			title="Toggle Theme"
			aria-label="Toggle Theme"
		>
			{#if theme.theme === 'light'}
				<Moon size={18} weight="bold" />
			{:else}
				<Sun size={18} weight="bold" />
			{/if}
		</button>

		<div class="lang-switcher" role="group" aria-label="Language selection">
			{#each locales as l}
				<button
					type="button"
					class="lang-btn"
					class:active={getLocale() === l}
					onclick={() => handleLocaleChange(l)}
					aria-pressed={getLocale() === l}
					data-testid="lang-btn-{l}"
				>
					{l.toUpperCase()}
				</button>
			{/each}
		</div>
	</div>
</header>

<style>
	.main-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 0.65rem clamp(0.75rem, 2.5vw, 1.75rem);
		background-color: var(--bg-secondary);
		border-bottom: 1px solid var(--border-color);
		flex-wrap: nowrap;
		gap: 0.75rem 1.25rem;
		transition:
			background-color 0.2s,
			border-color 0.2s;
	}

	.logo {
		flex: 0 1 auto;
		min-width: 0;
	}

	.logo h1 {
		margin: 0;
		font-size: clamp(1.05rem, 1.35vw, 1.25rem);
		font-weight: 700;
		color: var(--text-primary);
		line-height: 1.2;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.subtitle {
		margin: 0.2rem 0 0;
		font-size: 0.78rem;
		color: var(--text-secondary);
		line-height: 1.25;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
		max-width: 440px;
	}

	@media (max-width: 1240px) {
		.subtitle {
			display: none;
		}
	}

	.controls {
		display: flex;
		align-items: center;
		flex-shrink: 0;
		gap: 0.5rem;
	}

	/* Wizard launcher button */
	.wizard-open-btn {
		display: inline-flex;
		align-items: center;
		gap: 0.45rem;
		height: 38px;
		padding: 0 0.85rem;
		box-sizing: border-box;
		background-color: var(--bg-card);
		color: var(--accent-primary);
		border: 1px solid var(--border-color);
		font-weight: 600;
		font-size: 0.82rem;
		border-radius: 8px;
		cursor: pointer;
		transition: all 0.15s ease;
		white-space: nowrap;
	}

	.wizard-open-btn:hover {
		border-color: var(--accent-primary);
		background: rgba(37, 99, 235, 0.08);
		transform: translateY(-1px);
	}

	/* CTA Button */
	.order-cta-btn {
		display: inline-flex;
		align-items: center;
		gap: 0.45rem;
		height: 38px;
		padding: 0 0.85rem;
		box-sizing: border-box;
		background: linear-gradient(135deg, #2563eb, #3b82f6);
		color: #ffffff !important;
		font-weight: 600;
		font-size: 0.82rem;
		border-radius: 8px;
		text-decoration: none;
		box-shadow: 0 2px 6px rgba(37, 99, 235, 0.25);
		transition:
			transform 0.15s ease,
			box-shadow 0.15s ease,
			opacity 0.15s ease;
		white-space: nowrap;
	}

	.order-cta-btn:hover {
		transform: translateY(-1px);
		box-shadow: 0 4px 10px rgba(37, 99, 235, 0.35);
		color: #ffffff !important;
		opacity: 0.95;
	}

	.order-cta-btn:active {
		transform: translateY(0);
	}

	.cta-full-text {
		display: inline;
	}

	.cta-short-text {
		display: none;
	}

	@media (max-width: 1400px) {
		.cta-full-text {
			display: none;
		}
		.cta-short-text {
			display: inline;
		}
		.cta-arrow {
			display: none;
		}
	}

	/* 2. Skin Selector as Checkbox/Segmented Buttons */
	.skin-select-box {
		display: inline-flex;
		align-items: center;
		height: 38px;
		box-sizing: border-box;
		padding: 2px;
		background-color: var(--bg-card);
		border: 1px solid var(--border-color);
		border-radius: 8px;
		gap: 2px;
	}

	.skin-tab-btn {
		background: transparent;
		border: none;
		height: 100%;
		padding: 0 0.65rem;
		border-radius: 6px;
		font-size: 0.8rem;
		font-weight: 600;
		color: var(--text-secondary);
		cursor: pointer;
		transition: all 0.15s ease;
		user-select: none;
		white-space: nowrap;
	}

	.skin-tab-btn:hover:not(.active) {
		color: var(--text-primary);
		background-color: var(--bg-secondary);
	}

	.skin-tab-btn.active {
		background-color: var(--accent-primary);
		color: #ffffff;
		box-shadow: 0 1px 3px rgba(37, 99, 235, 0.25);
	}

	/* Settings Button */
	.settings-btn {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 38px;
		height: 38px;
		box-sizing: border-box;
		background-color: var(--bg-card);
		border: 1px solid var(--border-color);
		color: var(--text-primary);
		border-radius: 8px;
		cursor: pointer;
		transition:
			border-color 0.15s ease,
			color 0.15s ease,
			transform 0.15s ease;
	}

	.settings-btn:hover {
		border-color: var(--accent-primary);
		color: var(--accent-primary);
		transform: translateY(-1px);
	}

	.settings-btn:active {
		transform: translateY(0);
	}

	/* 3. Theme Toggle */
	.theme-toggle {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 38px;
		height: 38px;
		box-sizing: border-box;
		background-color: var(--bg-card);
		border: 1px solid var(--border-color);
		color: var(--text-primary);
		border-radius: 8px;
		cursor: pointer;
		transition:
			border-color 0.15s ease,
			color 0.15s ease,
			transform 0.15s ease;
	}

	.theme-toggle:hover {
		border-color: var(--accent-primary);
		color: var(--accent-primary);
		transform: translateY(-1px);
	}

	.theme-toggle:active {
		transform: translateY(0);
	}

	/* 4. Language Switcher */
	.lang-switcher {
		display: inline-flex;
		height: 38px;
		box-sizing: border-box;
		background-color: var(--bg-card);
		border: 1px solid var(--border-color);
		border-radius: 8px;
		padding: 2px;
		gap: 2px;
	}

	.lang-btn {
		background: transparent;
		border: none;
		color: var(--text-secondary);
		font-size: 0.75rem;
		font-weight: 700;
		padding: 0 0.55rem;
		border-radius: 6px;
		cursor: pointer;
		transition:
			background-color 0.15s ease,
			color 0.15s ease;
		display: inline-flex;
		align-items: center;
		justify-content: center;
	}

	.lang-btn:hover:not(.active) {
		color: var(--text-primary);
	}

	.lang-btn.active {
		background-color: var(--accent-primary);
		color: #ffffff;
	}

	@media (max-width: 960px) {
		.main-header {
			flex-direction: column;
			align-items: flex-start;
			gap: 0.75rem;
			flex-wrap: wrap;
		}

		.controls {
			width: 100%;
			justify-content: flex-start;
			flex-wrap: wrap;
		}
	}
</style>
