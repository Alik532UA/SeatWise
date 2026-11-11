<script lang="ts">
	import { getContext } from 'svelte';
	import type { ThemeController } from '$lib/controllers/ThemeController.svelte';
	import type { UIController, UISkin } from '$lib/controllers/UIController.svelte';
	import * as m from '$lib/paraglide/messages';
	import { setLocale, getLocale, locales } from '$lib/paraglide/runtime';
	import { Sparkles, ExternalLink } from '@lucide/svelte';

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
			<Sparkles size={16} aria-hidden="true" />
			<span>{m.order_cta()}</span>
			<ExternalLink size={14} aria-hidden="true" />
		</a>

		<div class="control-group">
			<label for="skin-select">{m.ui_variant?.() || 'Варіант UI'}:</label>
			<select
				id="skin-select"
				value={ui.skin}
				onchange={(e) => ui.setSkin(e.currentTarget.value as UISkin)}
			>
				<option value="professional">Professional</option>
				<option value="compact">Compact</option>
				<option value="visual">Visual</option>
			</select>
		</div>

		<div class="control-group">
			<button class="theme-toggle" onclick={() => theme.toggle()} title="Toggle Theme">
				{#if theme.theme === 'light'}
					🌙
				{:else}
					☀️
				{/if}
			</button>
		</div>

		<div class="control-group lang-switcher">
			{#each locales as l}
				<button
					class="lang-btn"
					class:active={getLocale() === l}
					onclick={() => handleLocaleChange(l)}
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
		padding: 1rem 2rem;
		background-color: var(--bg-secondary);
		border-bottom: 1px solid var(--border-color);
		flex-wrap: wrap;
		gap: 1rem;
	}

	.logo h1 {
		margin: 0;
		font-size: 1.5rem;
		color: var(--text-primary);
	}

	.subtitle {
		margin: 0;
		font-size: 0.85rem;
		color: var(--text-secondary);
	}

	.controls {
		display: flex;
		align-items: center;
		gap: 1.5rem;
		flex-wrap: wrap;
	}

	.control-group {
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}

	.control-group label {
		font-size: 0.85rem;
		color: var(--text-secondary);
	}

	select {
		padding: 0.4rem;
		border-radius: 4px;
		border: 1px solid var(--border-color);
		background-color: var(--bg-primary);
		color: var(--text-primary);
	}

	.theme-toggle {
		background: none;
		border: 1px solid var(--border-color);
		border-radius: 4px;
		padding: 0.4rem;
		cursor: pointer;
		font-size: 1.2rem;
		line-height: 1;
		background-color: var(--bg-primary);
	}

	.lang-switcher {
		display: flex;
		gap: 0.25rem;
	}

	.lang-btn {
		background: none;
		border: 1px solid var(--border-color);
		padding: 0.2rem 0.5rem;
		border-radius: 4px;
		cursor: pointer;
		font-size: 0.8rem;
		color: var(--text-secondary);
		background-color: var(--bg-primary);
	}

	.lang-btn.active {
		background-color: var(--accent-primary);
		color: white;
		border-color: var(--accent-primary);
	}

	.order-cta-btn {
		display: inline-flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.4rem 0.85rem;
		min-height: 40px;
		box-sizing: border-box;
		background: linear-gradient(135deg, var(--accent-primary) 0%, #7c3aed 100%);
		color: #ffffff !important;
		font-weight: 600;
		font-size: 0.85rem;
		border-radius: 6px;
		text-decoration: none;
		box-shadow: 0 2px 4px rgba(37, 99, 235, 0.2);
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

	@media (max-width: 640px) {
		.order-cta-btn span {
			font-size: 0.8rem;
		}
	}
</style>
