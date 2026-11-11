<script lang="ts">
	import { getContext } from 'svelte';
	import type { ThemeController } from '$lib/controllers/ThemeController.svelte';
	import type { UIController, UISkin } from '$lib/controllers/UIController.svelte';
	import * as m from '$lib/paraglide/messages';
	import { setLocale, getLocale, locales } from '$lib/paraglide/runtime';
	import { Sparkle, ArrowSquareOut, Sun, Moon, SlidersHorizontal } from 'phosphor-svelte';

	const theme = getContext<ThemeController>('theme');
	const ui = getContext<UIController>('ui');

	const handleLocaleChange = (newLocale: string) => {
		setLocale(newLocale as any);
	};
</script>

<header class="main-header">
	<div class="logo">
		<h1>{m.app_title()}</h1>
		<p class="subtitle">{m.app_subtitle()}</p>
	</div>

	<div class="controls">
		<a
			href="https://alik532ua.github.io/DigitalWorkshop/"
			target="_blank"
			rel="noopener noreferrer"
			class="order-cta-btn touch-target"
			data-testid="order-cta-btn"
			title={m.order_cta()}
		>
			<Sparkle size={16} weight="bold" />
			<span>{m.order_cta()}</span>
			<ArrowSquareOut size={14} weight="bold" />
		</a>

		<div class="skin-select-box">
			<SlidersHorizontal size={15} class="control-icon" weight="bold" />
			<label for="skin-select" class="sr-only">{m.ui_variant?.() || 'Варіант UI'}</label>
			<select
				id="skin-select"
				value={ui.skin}
				onchange={(e) => ui.setSkin(e.currentTarget.value as UISkin)}
				aria-label={m.ui_variant?.() || 'Варіант UI'}
			>
				<option value="professional">Professional</option>
				<option value="compact">Compact</option>
				<option value="visual">Visual</option>
			</select>
		</div>

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
		padding: 0.85rem 2rem;
		background-color: var(--bg-secondary);
		border-bottom: 1px solid var(--border-color);
		flex-wrap: wrap;
		gap: 1rem;
		transition:
			background-color 0.2s,
			border-color 0.2s;
	}

	.logo h1 {
		margin: 0;
		font-size: 1.35rem;
		font-weight: 700;
		color: var(--text-primary);
		letter-spacing: -0.02em;
	}

	.subtitle {
		margin: 0.2rem 0 0;
		font-size: 0.82rem;
		color: var(--text-secondary);
	}

	.controls {
		display: flex;
		align-items: center;
		gap: 0.6rem;
		flex-wrap: wrap;
	}

	.sr-only {
		position: absolute;
		width: 1px;
		height: 1px;
		padding: 0;
		margin: -1px;
		overflow: hidden;
		clip: rect(0, 0, 0, 0);
		white-space: nowrap;
		border: 0;
	}

	/* 1. Order CTA Button */
	.order-cta-btn {
		display: inline-flex;
		align-items: center;
		gap: 0.45rem;
		height: 38px;
		padding: 0 0.95rem;
		box-sizing: border-box;
		background: linear-gradient(135deg, var(--accent-primary) 0%, #6366f1 100%);
		color: #ffffff !important;
		font-weight: 600;
		font-size: 0.82rem;
		border-radius: 8px;
		text-decoration: none;
		border: 1px solid rgba(255, 255, 255, 0.15);
		box-shadow: 0 1px 3px rgba(37, 99, 235, 0.2);
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

	/* 2. Skin Selector */
	.skin-select-box {
		display: inline-flex;
		align-items: center;
		height: 38px;
		box-sizing: border-box;
		padding: 0 0.5rem 0 0.65rem;
		background-color: var(--bg-card);
		border: 1px solid var(--border-color);
		border-radius: 8px;
		gap: 0.4rem;
		color: var(--text-secondary);
		transition:
			border-color 0.15s ease,
			background-color 0.2s;
	}

	.skin-select-box:focus-within {
		border-color: var(--accent-primary);
	}

	select {
		height: 100%;
		border: none;
		background: transparent;
		color: var(--text-primary);
		font-size: 0.82rem;
		font-weight: 500;
		cursor: pointer;
		outline: none;
		padding: 0 0.25rem;
	}

	select option {
		background-color: var(--bg-card);
		color: var(--text-primary);
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
		border-radius: 8px;
		cursor: pointer;
		color: var(--text-primary);
		transition:
			border-color 0.15s ease,
			background-color 0.2s,
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
		align-items: center;
		height: 38px;
		box-sizing: border-box;
		padding: 3px;
		gap: 2px;
		background-color: var(--bg-card);
		border: 1px solid var(--border-color);
		border-radius: 8px;
		transition:
			border-color 0.15s ease,
			background-color 0.2s;
	}

	.lang-btn {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		height: 30px;
		padding: 0 0.65rem;
		border: none;
		border-radius: 6px;
		background: transparent;
		cursor: pointer;
		font-size: 0.78rem;
		font-weight: 600;
		color: var(--text-secondary);
		transition: all 0.15s ease;
	}

	.lang-btn:hover:not(.active) {
		color: var(--text-primary);
		background-color: var(--bg-secondary);
	}

	.lang-btn.active {
		background-color: var(--accent-primary);
		color: #ffffff;
	}

	@media (max-width: 768px) {
		.main-header {
			padding: 0.75rem 1rem;
		}

		.order-cta-btn span {
			font-size: 0.78rem;
		}
	}
</style>
