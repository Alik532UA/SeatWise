<script lang="ts">
	import { onDestroy } from 'svelte';
	import { createKeySequence } from '$lib/services/keySequence';
	import { debugMode } from '$lib/services/debugMode.svelte';
	import ServiceBadge from './ServiceBadge.svelte';

	const versionSequence = createKeySequence({
		code: 'KeyV',
		threshold: () => debugMode.pressesToToggle,
		onComplete: () => {
			debugMode.toggle();
		}
	});

	onDestroy(() => {
		versionSequence.reset();
	});

	function handleKeydown(event: KeyboardEvent) {
		versionSequence.handle(event);
	}
</script>

<svelte:window onkeydown={handleKeydown} />

<ServiceBadge />
