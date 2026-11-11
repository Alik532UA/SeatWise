<script lang="ts">
	import { onMount, setContext } from 'svelte';
	import { ThemeController } from '$lib/controllers/ThemeController.svelte';
	import { UIController } from '$lib/controllers/UIController.svelte';
	import { SeatingController } from '$lib/controllers/SeatingController.svelte';
	import { errorLogger } from '$lib/services/errorLogger';
	import Header from '$lib/components/ui/Header.svelte';
	import ServiceLayer from '$lib/components/ui/ServiceLayer.svelte';
	import '../app.css';

	let { children } = $props();

	const theme = new ThemeController();
	const ui = new UIController();
	const seating = new SeatingController();

	setContext('theme', theme);
	setContext('ui', ui);
	setContext('seating', seating);

	onMount(() => {
		const onRejection = (e: PromiseRejectionEvent) => {
			errorLogger.logError(e.reason instanceof Error ? e.reason : new Error(String(e.reason)), {
				component: 'unhandledRejection'
			});
		};
		const onWindowError = (e: ErrorEvent) => {
			if (e.message && e.message.includes('ResizeObserver loop')) return;
			errorLogger.logError(e.error || e.message, { component: 'windowError' });
		};
		window.addEventListener('unhandledrejection', onRejection);
		window.addEventListener('error', onWindowError);

		return () => {
			window.removeEventListener('unhandledrejection', onRejection);
			window.removeEventListener('error', onWindowError);
		};
	});

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
	<ServiceLayer />
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
