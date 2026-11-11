<script lang="ts">
	import { getContext } from 'svelte';
	import type { UIController } from '$lib/controllers/UIController.svelte';
	import ProfessionalSkin from '$lib/components/skins/ProfessionalSkin.svelte';
	import CompactSkin from '$lib/components/skins/CompactSkin.svelte';
	import VisualSkin from '$lib/components/skins/VisualSkin.svelte';

	const ui = getContext<UIController>('ui');
</script>

<div class="page-container">
	{#if ui.skin === 'professional'}
		<ProfessionalSkin />
	{:else if ui.skin === 'compact'}
		<CompactSkin />
	{:else if ui.skin === 'visual'}
		<VisualSkin />
	{/if}
</div>

<style>
	.page-container {
		width: 100%;
	}
</style>
