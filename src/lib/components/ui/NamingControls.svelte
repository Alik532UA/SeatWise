<script lang="ts">
	import { getContext } from 'svelte';
	import type { SeatingController } from '$lib/controllers/SeatingController.svelte';
	import * as m from '$lib/paraglide/messages';

	const seating = getContext<SeatingController>('seating');
</script>

<div class="naming-controls-panel" data-testid="naming-controls">
	<span class="naming-title">{m.naming_settings()}:</span>

	<div class="naming-groups">
		<!-- Table Naming -->
		<div class="naming-group">
			<span class="group-label">{m.table_format()}:</span>
			<div class="segmented-control" role="radiogroup" aria-label={m.table_format()}>
				<button
					type="button"
					class="segment-btn"
					class:active={seating.tableNaming === 'letters'}
					onclick={() => seating.setTableNaming('letters')}
					aria-checked={seating.tableNaming === 'letters'}
					role="radio"
					data-testid="table-naming-letters"
				>
					{m.format_letters()}
				</button>
				<button
					type="button"
					class="segment-btn"
					class:active={seating.tableNaming === 'numbers'}
					onclick={() => seating.setTableNaming('numbers')}
					aria-checked={seating.tableNaming === 'numbers'}
					role="radio"
					data-testid="table-naming-numbers"
				>
					{m.format_numbers()}
				</button>
			</div>
		</div>

		<!-- Participant Naming -->
		<div class="naming-group">
			<span class="group-label">{m.participant_format()}:</span>
			<div class="segmented-control" role="radiogroup" aria-label={m.participant_format()}>
				<button
					type="button"
					class="segment-btn"
					class:active={seating.participantNaming === 'numbers'}
					onclick={() => seating.setParticipantNaming('numbers')}
					aria-checked={seating.participantNaming === 'numbers'}
					role="radio"
					data-testid="participant-naming-numbers"
				>
					{m.format_numbers()}
				</button>
				<button
					type="button"
					class="segment-btn"
					class:active={seating.participantNaming === 'letters'}
					onclick={() => seating.setParticipantNaming('letters')}
					aria-checked={seating.participantNaming === 'letters'}
					role="radio"
					data-testid="participant-naming-letters"
				>
					{m.format_letters()}
				</button>
			</div>
		</div>
	</div>
</div>

<style>
	.naming-controls-panel {
		display: flex;
		align-items: center;
		flex-wrap: wrap;
		gap: 0.75rem 1.25rem;
		background: var(--bg-card);
		border: 1px solid var(--border-color);
		border-radius: 10px;
		padding: 0.65rem 1rem;
		width: 100%;
		max-width: 100%;
		box-sizing: border-box;
	}

	.naming-title {
		font-size: 0.82rem;
		font-weight: 700;
		color: var(--text-secondary);
		text-transform: uppercase;
		letter-spacing: 0.03em;
		white-space: nowrap;
	}

	.naming-groups {
		display: flex;
		align-items: center;
		flex-wrap: wrap;
		gap: 1rem;
		flex: 1;
	}

	.naming-group {
		display: inline-flex;
		align-items: center;
		gap: 0.5rem;
		flex-wrap: wrap;
	}

	.group-label {
		font-size: 0.85rem;
		font-weight: 600;
		color: var(--text-primary);
		white-space: nowrap;
	}

	.segmented-control {
		display: inline-flex;
		align-items: center;
		height: 32px;
		background: var(--bg-secondary);
		border: 1px solid var(--border-color);
		border-radius: 8px;
		padding: 2px;
		gap: 2px;
		box-sizing: border-box;
	}

	.segment-btn {
		background: transparent;
		border: none;
		height: 100%;
		padding: 0 0.65rem;
		border-radius: 6px;
		font-size: 0.78rem;
		font-weight: 600;
		color: var(--text-secondary);
		cursor: pointer;
		transition: all 0.15s ease;
		user-select: none;
		white-space: nowrap;
	}

	.segment-btn:hover:not(.active) {
		color: var(--text-primary);
	}

	.segment-btn.active {
		background: var(--accent-primary);
		color: #ffffff;
		box-shadow: 0 1px 3px rgba(37, 99, 235, 0.25);
	}

	@media (max-width: 640px) {
		.naming-controls-panel {
			flex-direction: column;
			align-items: flex-start;
			padding: 0.75rem;
		}

		.naming-groups {
			width: 100%;
			flex-direction: column;
			align-items: flex-start;
			gap: 0.65rem;
		}

		.naming-group {
			width: 100%;
			justify-content: space-between;
		}
	}
</style>
