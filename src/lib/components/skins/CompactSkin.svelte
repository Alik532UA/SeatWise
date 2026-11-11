<script lang="ts">
	import { getContext } from 'svelte';
	import type { SeatingController } from '$lib/controllers/SeatingController.svelte';
	import * as m from '$lib/paraglide/messages';

	const seating = getContext<SeatingController>('seating');
</script>

<div class="skin-compact">
	<section class="config-bar">
		<div class="field">
			<span>N:</span>
			<input type="number" bind:value={seating.totalPeople} />
		</div>
		<div class="field">
			<span>T:</span>
			<input type="number" bind:value={seating.tableCount} />
		</div>
		<div class="field">
			<span>C:</span>
			<input type="number" bind:value={seating.tableCapacity} />
		</div>
		<button class="primary" onclick={() => seating.calculate()}>
			{seating.isCalculating ? m.calculating() : m.calculate_button()}
		</button>
		<button class="secondary" onclick={() => seating.reset()}>{m.reset()}</button>
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
		gap: 1rem;
		padding: 0.5rem;
		background: var(--bg-secondary);
		border: 1px solid var(--border-color);
		margin-bottom: 1rem;
		align-items: center;
	}

	.field {
		display: flex;
		gap: 0.25rem;
		align-items: center;
	}

	input {
		width: 50px;
		background: var(--bg-primary);
		color: var(--text-primary);
		border: 1px solid var(--border-color);
		padding: 0.1rem;
	}

	button {
		padding: 0.2rem 0.5rem;
		cursor: pointer;
	}

	.primary {
		background: var(--accent-primary);
		color: white;
		border: none;
	}

	.compact-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
		gap: 0.5rem;
	}

	.mini-round {
		border: 1px solid var(--border-color);
		background: var(--bg-card);
	}

	.mini-round .header {
		background: var(--bg-secondary);
		padding: 0.25rem;
		font-weight: bold;
		text-align: center;
		border-bottom: 1px solid var(--border-color);
	}

	.tables {
		padding: 0.25rem;
	}

	.mini-table {
		display: flex;
		gap: 0.5rem;
		border-bottom: 1px dashed var(--border-color);
		padding: 0.1rem 0;
	}

	.mini-table:last-child {
		border-bottom: none;
	}

	.t-id {
		font-weight: bold;
		color: var(--accent-primary);
		min-width: 25px;
	}

	.t-p {
		color: var(--text-primary);
	}
</style>