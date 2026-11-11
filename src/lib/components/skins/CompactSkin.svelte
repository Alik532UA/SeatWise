<script lang="ts">
	import { getContext } from 'svelte';
	import type { SeatingController } from '$lib/controllers/SeatingController.svelte';
	import * as m from '$lib/paraglide/messages';
	import NumberStepper from '$lib/components/ui/NumberStepper.svelte';
	import { Sparkle, ArrowsCounterClockwise } from 'phosphor-svelte';

	const seating = getContext<SeatingController>('seating');
</script>

<div class="skin-compact">
	<section class="config-bar">
		<div class="field">
			<span class="label">N:</span>
			<NumberStepper
				bind:value={seating.totalPeople}
				min={2}
				max={200}
				id="compact-n"
				ariaLabel="N"
			/>
		</div>
		<div class="field">
			<span class="label">T:</span>
			<NumberStepper
				bind:value={seating.tableCount}
				min={1}
				max={50}
				id="compact-t"
				ariaLabel="T"
			/>
		</div>
		<div class="field">
			<span class="label">C:</span>
			<NumberStepper
				bind:value={seating.tableCapacity}
				min={2}
				max={30}
				id="compact-c"
				ariaLabel="C"
			/>
		</div>
		<div class="actions">
			<button
				class="primary touch-target"
				onclick={() => seating.calculate()}
				disabled={seating.isCalculating}
			>
				<Sparkle size={15} weight="bold" />
				<span>{seating.isCalculating ? m.calculating() : m.calculate_button()}</span>
			</button>
			<button class="secondary touch-target" onclick={() => seating.reset()}>
				<ArrowsCounterClockwise size={15} weight="bold" />
				<span>{m.reset()}</span>
			</button>
		</div>
	</section>

	{#if seating.rounds.length > 0}
		<div class="compact-grid">
			{#each seating.rounds as round, rIndex}
				<div class="mini-round">
					<div class="header">R{rIndex + 1}</div>
					<div class="tables">
						{#each round as table, tIndex}
							<div class="mini-table">
								<span class="t-id">T{tIndex + 1}:</span>
								<span class="t-p">{table.join(', ')}</span>
							</div>
						{/each}
					</div>
				</div>
			{/each}
		</div>
	{/if}
</div>

<style>
	.skin-compact {
		font-family: 'Consolas', 'Monaco', monospace;
		font-size: 0.85rem;
	}

	.config-bar {
		display: flex;
		flex-wrap: wrap;
		gap: 0.85rem;
		padding: 0.75rem 1rem;
		background: var(--bg-card);
		border: 1px solid var(--border-color);
		border-radius: 8px;
		margin-bottom: 1.25rem;
		align-items: center;
	}

	.field {
		display: flex;
		gap: 0.35rem;
		align-items: center;
	}

	.field .label {
		font-weight: 700;
		color: var(--text-secondary);
	}

	.actions {
		display: flex;
		gap: 0.5rem;
		margin-left: auto;
	}

	button {
		display: inline-flex;
		align-items: center;
		gap: 0.35rem;
		height: 34px;
		padding: 0 0.85rem;
		box-sizing: border-box;
		cursor: pointer;
		font-family: inherit;
		font-size: 0.82rem;
		font-weight: 600;
		border-radius: 6px;
		transition: all 0.15s ease;
		white-space: nowrap;
	}

	button:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	.primary {
		background: var(--accent-primary);
		color: #ffffff;
		border: none;
	}

	.primary:hover:not(:disabled) {
		background: var(--accent-hover);
		transform: translateY(-1px);
	}

	.secondary {
		background: var(--bg-primary);
		color: var(--text-primary);
		border: 1px solid var(--border-color);
	}

	.secondary:hover:not(:disabled) {
		border-color: var(--accent-primary);
		color: var(--accent-primary);
		transform: translateY(-1px);
	}

	.primary:active,
	.secondary:active {
		transform: translateY(0);
	}

	.compact-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
		gap: 0.75rem;
	}

	.mini-round {
		border: 1px solid var(--border-color);
		border-radius: 6px;
		background: var(--bg-card);
		overflow: hidden;
	}

	.mini-round .header {
		background: var(--bg-secondary);
		padding: 0.35rem 0.5rem;
		font-weight: bold;
		border-bottom: 1px solid var(--border-color);
		color: var(--accent-primary);
	}

	.tables {
		padding: 0.5rem;
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
	}

	.mini-table {
		display: flex;
		gap: 0.5rem;
	}

	.t-id {
		color: var(--text-secondary);
		font-weight: bold;
		width: 30px;
	}

	.t-p {
		color: var(--text-primary);
		word-break: break-all;
	}
</style>
