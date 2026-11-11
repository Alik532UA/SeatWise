<script lang="ts">
	import { getContext } from 'svelte';
	import type { SeatingController } from '$lib/controllers/SeatingController.svelte';
	import * as m from '$lib/paraglide/messages';
	import { User, X } from 'phosphor-svelte';

	const seating = getContext<SeatingController>('seating');
</script>

{#if seating.selectedParticipantId}
	<div
		class="floating-participant-bar"
		data-testid="floating-participant-bar"
		role="status"
		aria-live="polite"
	>
		<div class="bar-info">
			<div class="bar-avatar">
				{seating.getInitials(seating.selectedParticipantId)}
			</div>
			<div class="bar-text">
				<span class="bar-label">{m.participant_card()} #{seating.selectedParticipantId}</span>
				<span class="bar-name">{seating.getParticipantName(seating.selectedParticipantId)}</span>
			</div>
		</div>

		<div class="bar-actions">
			<button
				type="button"
				class="btn-view-schedule touch-target"
				onclick={() => seating.openParticipantModal(seating.selectedParticipantId!)}
				data-testid="btn-open-participant-schedule"
			>
				<User size={16} weight="bold" />
				<span>{m.view_schedule()}</span>
			</button>
			<button
				type="button"
				class="btn-clear-selection touch-target"
				onclick={() => seating.clearSelection()}
				title={m.clear_selection()}
				aria-label={m.clear_selection()}
				data-testid="btn-clear-participant-selection"
			>
				<X size={16} weight="bold" />
			</button>
		</div>
	</div>
{/if}

<style>
	.floating-participant-bar {
		position: fixed;
		bottom: 1.5rem;
		left: 50%;
		transform: translateX(-50%);
		z-index: 950;
		background: var(--bg-card);
		border: 2px solid var(--accent-primary);
		border-radius: 50px;
		padding: 0.45rem 0.65rem 0.45rem 1rem;
		box-shadow: 0 16px 40px rgba(0, 0, 0, 0.3);
		display: flex;
		align-items: center;
		gap: 1.25rem;
		animation: slideUpFloating 0.25s cubic-bezier(0.16, 1, 0.3, 1);
		max-width: 90vw;
		box-sizing: border-box;
	}

	@keyframes slideUpFloating {
		from {
			opacity: 0;
			transform: translate(-50%, 20px) scale(0.95);
		}
		to {
			opacity: 1;
			transform: translate(-50%, 0) scale(1);
		}
	}

	.bar-info {
		display: flex;
		align-items: center;
		gap: 0.65rem;
		min-width: 0;
	}

	.bar-avatar {
		width: 34px;
		height: 34px;
		border-radius: 50%;
		background: linear-gradient(135deg, var(--accent-primary), #8b5cf6);
		color: #ffffff;
		display: flex;
		align-items: center;
		justify-content: center;
		font-weight: 800;
		font-size: 0.85rem;
		flex-shrink: 0;
	}

	.bar-text {
		display: flex;
		flex-direction: column;
		min-width: 0;
	}

	.bar-label {
		font-size: 0.65rem;
		text-transform: uppercase;
		font-weight: 700;
		color: var(--text-secondary);
		line-height: 1.1;
	}

	.bar-name {
		font-size: 0.92rem;
		font-weight: 800;
		color: var(--text-primary);
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
		max-width: 220px;
		line-height: 1.2;
	}

	.bar-actions {
		display: flex;
		align-items: center;
		gap: 0.45rem;
	}

	.btn-view-schedule {
		display: inline-flex;
		align-items: center;
		gap: 0.4rem;
		height: 34px;
		padding: 0 1rem;
		border-radius: 20px;
		background: var(--accent-primary);
		color: #ffffff;
		border: none;
		font-size: 0.8rem;
		font-weight: 700;
		cursor: pointer;
		transition: all 0.15s ease;
		white-space: nowrap;
	}

	.btn-view-schedule:hover {
		background: var(--accent-hover);
		transform: translateY(-1px);
	}

	.btn-clear-selection {
		width: 32px;
		height: 32px;
		border-radius: 50%;
		border: 1px solid var(--border-color);
		background: var(--bg-secondary);
		color: var(--text-secondary);
		display: inline-flex;
		align-items: center;
		justify-content: center;
		cursor: pointer;
		transition: all 0.15s ease;
	}

	.btn-clear-selection:hover {
		color: var(--text-primary);
		border-color: var(--accent-primary);
		transform: scale(1.08);
	}

	@media (max-width: 600px) {
		.floating-participant-bar {
			width: calc(100% - 2rem);
			left: 1rem;
			transform: none;
			border-radius: 18px;
			gap: 0.75rem;
			justify-content: space-between;
			padding: 0.45rem 0.65rem;
		}

		.bar-name {
			max-width: 110px;
		}

		.btn-view-schedule span {
			display: none;
		}

		.btn-view-schedule {
			padding: 0 0.6rem;
		}
	}
</style>
