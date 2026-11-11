<script lang="ts">
	import { getContext } from 'svelte';
	import type { ThemeController } from '$lib/controllers/ThemeController.svelte';
	import type { UIController, UISkin } from '$lib/controllers/UIController.svelte';
	import * as m from '$lib/paraglide/messages';
	import { setLocale, getLocale, locales } from '$lib/paraglide/runtime';

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
</style>
