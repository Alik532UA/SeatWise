<script lang="ts">
	import { setContext } from 'svelte';
	import { ThemeController } from '$lib/controllers/ThemeController.svelte';
	import { UIController } from '$lib/controllers/UIController.svelte';
	import { SeatingController } from '$lib/controllers/SeatingController.svelte';
	import Header from '$lib/components/ui/Header.svelte';
	import '../app.css';

	let { children } = $props();

	const theme = new ThemeController();
	const ui = new UIController();
	const seating = new SeatingController();

	setContext('theme', theme);
	setContext('ui', ui);
	setContext('seating', seating);

	$effect(() => {
		theme.sync();
	});

	$effect(() => {
		seating.saveState();
	});
</script>

<div class="app-layout" data-theme={theme.theme}>
	<Header />
	<main>
		{@render children()}
	</main>
</div>

<style>
	.app-layout {
		min-height: 100vh;
		display: flex;
		flex-direction: column;
		background-color: var(--bg-primary);
		color: var(--text-primary);
		transition:
			background-color 0.2s,
			color 0.2s;
	}

	main {
		flex: 1;
		padding: 1rem clamp(0.75rem, 2vw, 2.5rem);
		width: 100%;
		max-width: 100%;
		box-sizing: border-box;
	}
</style>
