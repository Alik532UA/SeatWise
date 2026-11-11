<script lang="ts">
	import { getContext } from 'svelte';
	import type { UIController } from '$lib/controllers/UIController.svelte';
	import type { SeatingController } from '$lib/controllers/SeatingController.svelte';
	import ProfessionalSkin from '$lib/components/skins/ProfessionalSkin.svelte';
	import CompactSkin from '$lib/components/skins/CompactSkin.svelte';
	import VisualSkin from '$lib/components/skins/VisualSkin.svelte';
	import OnboardingWizard from '$lib/components/ui/OnboardingWizard.svelte';
	import ParticipantFloatingBar from '$lib/components/ui/ParticipantFloatingBar.svelte';

	const ui = getContext<UIController>('ui');
	const seating = getContext<SeatingController>('seating');

	function handleWindowClick(event: MouseEvent) {
		if (seating.selectedParticipantId === null) return;
		const target = event.target as HTMLElement | null;
		if (!target) return;

		// Якщо клік був по аватару учасника, плашці інспектора, модальному вікну чи системних кнопках — не скидаємо
		if (
			target.closest(
				'.person-avatar, .compact-person-btn, .avatar, .floating-participant-bar, [role="dialog"], button, input, textarea, a, select, label'
			)
		) {
			return;
		}

		// Клік у вільну зону (повз елементи) — скидаємо виділення людини
		seating.clearSelection();
	}

	function handleKeyDown(event: KeyboardEvent) {
		if (
			event.key === 'Escape' &&
			seating.selectedParticipantId !== null &&
			!seating.isParticipantModalOpen
		) {
			seating.clearSelection();
		}
	}
</script>

<svelte:window onclick={handleWindowClick} onkeydown={handleKeyDown} />

<div class="page-container">
	<OnboardingWizard />

	{#if ui.skin === 'classic' || (ui.skin as string) === 'professional'}
		<ProfessionalSkin />
	{:else if ui.skin === 'compact'}
		<CompactSkin />
	{:else if ui.skin === 'visual'}
		<VisualSkin />
	{/if}

	<ParticipantFloatingBar />
</div>

<style>
	.page-container {
		width: 100%;
		max-width: 100%;
		box-sizing: border-box;
	}
</style>
