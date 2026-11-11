<script lang="ts">
	import { getContext } from 'svelte';
	import type { UIController } from '$lib/controllers/UIController.svelte';
	import ProfessionalSkin from '$lib/components/skins/ProfessionalSkin.svelte';
	import CompactSkin from '$lib/components/skins/CompactSkin.svelte';
	import VisualSkin from '$lib/components/skins/VisualSkin.svelte';
	import OnboardingWizard from '$lib/components/ui/OnboardingWizard.svelte';

	const ui = getContext<UIController>('ui');
</script>

<div class="page-container">
	<OnboardingWizard />

	{#if ui.skin === 'classic' || (ui.skin as string) === 'professional'}
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
		max-width: 100%;
		box-sizing: border-box;
	}
</style>
