<script lang="ts">
	import { getContext } from 'svelte';
	import type { SeatingController } from '$lib/controllers/SeatingController.svelte';
	import * as m from '$lib/paraglide/messages';

	const seating = getContext<SeatingController>('seating');
</script>

<div class="skin-professional">
	<section class="config-panel">
		<div class="input-group">
			<label for="totalPeople">{m.total_people()}:</label>
			<input type="number" id="totalPeople" bind:value={seating.totalPeople} min="2" />
		</div>

		<div class="input-group">
			<label for="tableCount">{m.table_count()}:</label>
			<input type="number" id="tableCount" bind:value={seating.tableCount} min="1" />
		</div>

		<div class="input-group">
			<label for="tableCapacity">{m.table_capacity()}:</label>
			<input type="number" id="tableCapacity" bind:value={seating.tableCapacity} min="2" />
		</div>

		<div class="actions">
			<button
				class="btn-primary"
				onclick={() => seating.calculate()}
				disabled={seating.isCalculating}
			>
				{seating.isCalculating ? m.calculating() : m.calculate_button()}
			</button>
			<button class="btn-secondary" onclick={() => seating.reset()}>
				{m.reset()}
			</button>
		</div>
	</section>

	<section class="names-panel">
		<label for="namesInput">{m.participants_list()}:</label>
		<textarea
			id="namesInput"
			bind:value={seating.namesInput}
			placeholder={m.participants_placeholder()}
			rows="5"
		></textarea>
	</section>

	{#if seating.errorMessage}
		<div class="alert error">{seating.errorMessage}</div>
	{/if}

	{#if seating.rounds.length > 0}
		<div class="results-header">
			<div class="results-summary">
				<h2>{m.rounds_needed()}: <span class="highlight">{seating.rounds.length}</span></h2>
				<p>{m.perfect_goal({ count: seating.totalPeople - 1 })}</p>
			</div>
			<button
				class="btn-copy"
				class:copied={seating.isCopied}
				onclick={() => seating.copyToClipboard()}
			>
				{seating.isCopied ? m.copied() : m.copy_button()}
			</button>
		</div>

		<div class="rounds-grid">
			{#each seating.rounds as round, rIndex}
				<div class="round-card">
					<h3>{m.round()} {rIndex + 1}</h3>
					<div class="tables-list">
						{#each round as table, tIndex}
							{#if table.length > 0}
								<div class="table-row">
									<span class="table-label">{m.table()} {tIndex + 1}</span>
									<div class="participants-grid">
										{#each table as person}
											<div class="person-avatar" title={seating.getParticipantName(person)}>
												{seating.getInitials(person)}
											</div>
										{/each}
									</div>
								</div>
							{/if}
						{/each}
					</div>
				</div>
			{/each}
		</div>
	{/if}
</div>

<style>
	.skin-professional {
		display: flex;
		flex-direction: column;
		gap: 2rem;
	}

	.config-panel {
		display: flex;
		flex-wrap: wrap;
		gap: 1.5rem;
		background: var(--bg-card);
		padding: 2rem;
		border-radius: 12px;
		box-shadow:
			0 4px 6px -1px rgba(0, 0, 0, 0.1),
			0 2px 4px -1px rgba(0, 0, 0, 0.06);
		border: 1px solid var(--border-color);
		align-items: flex-end;
	}

	.names-panel {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
		background: var(--bg-card);
		padding: 1.5rem 2rem;
		border-radius: 12px;
		box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
		border: 1px solid var(--border-color);
	}

	textarea {
		width: 100%;
		padding: 0.75rem;
		border: 1px solid var(--border-color);
		border-radius: 8px;
		font-size: 0.95rem;
		background-color: var(--bg-primary);
		color: var(--text-primary);
		resize: vertical;
		font-family: inherit;
	}

	.input-group {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
		flex: 1;
		min-width: 200px;
	}

	label {
		font-size: 0.9rem;
		font-weight: 600;
		color: var(--text-secondary);
	}

	input {
		padding: 0.75rem;
		border: 1px solid var(--border-color);
		border-radius: 8px;
		font-size: 1rem;
		background-color: var(--bg-primary);
		color: var(--text-primary);
	}

	.actions {
		display: flex;
		gap: 0.75rem;
	}

	button {
		padding: 0.75rem 1.5rem;
		font-size: 1rem;
		font-weight: 600;
		border-radius: 8px;
		cursor: pointer;
		transition: all 0.2s;
		border: none;
		height: 48px;
	}

	.btn-primary {
		background-color: var(--accent-primary);
		color: white;
	}

	.btn-primary:hover:not(:disabled) {
		background-color: var(--accent-hover);
	}

	.btn-secondary {
		background-color: var(--bg-secondary);
		color: var(--text-primary);
		border: 1px solid var(--border-color);
	}

	button:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	.alert {
		padding: 1rem 1.5rem;
		border-radius: 8px;
		font-weight: 500;
	}

	.alert.error {
		background: var(--error-bg);
		color: var(--error-text);
		border: 1px solid var(--error-border);
	}

	.results-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		gap: 1rem;
	}

	.results-summary {
		flex: 1;
		background: var(--success-bg);
		padding: 1.5rem;
		border-radius: 8px;
		border-left: 6px solid var(--success-border);
	}

	.btn-copy {
		background-color: var(--accent-primary);
		color: white;
		padding: 0.75rem 1.5rem;
		border-radius: 8px;
		font-weight: 600;
		transition: all 0.3s ease;
		white-space: nowrap;
	}

	.btn-copy:hover {
		background-color: var(--accent-hover);
		transform: translateY(-2px);
	}

	.btn-copy.copied {
		background-color: var(--success-border);
	}

	.results-summary h2 {
		margin: 0 0 0.5rem 0;
		font-size: 1.5rem;
	}

	.highlight {
		color: var(--accent-primary);
	}

	.rounds-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
		gap: 2rem;
	}

	.round-card {
		background: var(--bg-card);
		border-radius: 12px;
		padding: 1.5rem;
		box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
		border: 1px solid var(--border-color);
	}

	.round-card h3 {
		margin: 0 0 1.25rem 0;
		font-size: 1.25rem;
		border-bottom: 2px solid var(--bg-secondary);
		padding-bottom: 0.75rem;
	}

	.tables-list {
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	.table-row {
		display: flex;
		align-items: flex-start;
		gap: 1rem;
		padding-bottom: 0.75rem;
		border-bottom: 1px solid var(--bg-secondary);
	}

	.table-row:last-child {
		border-bottom: none;
	}

	.table-label {
		font-size: 0.85rem;
		font-weight: 700;
		min-width: 60px;
		color: var(--text-secondary);
		padding-top: 0.75rem;
	}

	.participants-grid {
		display: flex;
		flex-wrap: wrap;
		gap: 0.75rem;
		padding: 0.5rem;
	}

	.person-avatar {
		width: 40px;
		height: 40px;
		background: var(--bg-secondary);
		border: 2px solid var(--accent-primary);
		color: var(--text-primary);
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 0.9rem;
		font-weight: 700;
		transition: all 0.2s ease;
		box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
	}

	.person-avatar:hover {
		transform: scale(1.15);
		background: var(--accent-primary);
		color: white;
		box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
		cursor: default;
	}
</style>
