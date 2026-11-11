<script lang="ts">
	import { getContext } from 'svelte';
	import type { SeatingController } from '$lib/controllers/SeatingController.svelte';
	import * as m from '$lib/paraglide/messages';
	import { Sparkle, ArrowsCounterClockwise, Copy, Check, Target } from 'phosphor-svelte';
	import NumberStepper from '$lib/components/ui/NumberStepper.svelte';
	import NamingControls from '$lib/components/ui/NamingControls.svelte';

	const seating = getContext<SeatingController>('seating');
</script>

<div class="skin-classic skin-professional">
	<section class="config-panel">
		<div class="input-group">
			<label for="totalPeople">{m.total_people()}:</label>
			<NumberStepper
				bind:value={seating.totalPeople}
				min={2}
				max={200}
				id="totalPeople"
				ariaLabel={m.total_people()}
			/>
		</div>

		<div class="input-group">
			<label for="tableCount">{m.table_count()}:</label>
			<NumberStepper
				bind:value={seating.tableCount}
				min={1}
				max={50}
				id="tableCount"
				ariaLabel={m.table_count()}
			/>
		</div>

		<div class="input-group">
			<label for="tableCapacity">{m.table_capacity()}:</label>
			<NumberStepper
				bind:value={seating.tableCapacity}
				min={2}
				max={30}
				id="tableCapacity"
				ariaLabel={m.table_capacity()}
			/>
		</div>

		<div class="actions">
			<button
				class="btn-primary touch-target"
				onclick={() => seating.calculate()}
				disabled={seating.isCalculating}
			>
				<Sparkle size={17} weight="bold" />
				<span>{seating.isCalculating ? m.calculating() : m.calculate_button()}</span>
			</button>
			<button class="btn-secondary touch-target" onclick={() => seating.reset()}>
				<ArrowsCounterClockwise size={16} weight="bold" />
				<span>{m.reset()}</span>
			</button>
		</div>
	</section>

	<NamingControls />

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
				<div class="goal-message">
					<Target size={18} weight="duotone" class="goal-icon" />
					<p>{m.perfect_goal({ count: seating.totalPeople - 1 })}</p>
				</div>
			</div>
			<button
				class="btn-copy"
				class:copied={seating.isCopied}
				onclick={() => seating.copyToClipboard()}
			>
				{#if seating.isCopied}
					<Check size={16} weight="bold" />
					<span>{m.copied()}</span>
				{:else}
					<Copy size={16} weight="bold" />
					<span>{m.copy_button()}</span>
				{/if}
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
									<span class="table-label">{m.table()} {seating.getTableLabel(tIndex)}</span>
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
		gap: 1.25rem;
		background: var(--bg-card);
		padding: clamp(1rem, 3vw, 2rem);
		border-radius: 12px;
		box-shadow:
			0 4px 6px -1px rgba(0, 0, 0, 0.1),
			0 2px 4px -1px rgba(0, 0, 0, 0.06);
		border: 1px solid var(--border-color);
		align-items: flex-end;
		width: 100%;
		max-width: 100%;
		box-sizing: border-box;
	}

	.names-panel {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
		background: var(--bg-card);
		padding: clamp(1rem, 2vw, 1.5rem) clamp(1rem, 2vw, 2rem);
		border-radius: 12px;
		box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
		border: 1px solid var(--border-color);
		width: 100%;
		max-width: 1200px;
		box-sizing: border-box;
	}

	textarea {
		width: 100%;
		max-width: 100%;
		box-sizing: border-box;
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
		flex: 1 1 200px;
		min-width: min(200px, 100%);
	}

	label {
		font-size: 0.9rem;
		font-weight: 600;
		color: var(--text-secondary);
	}

	.actions {
		display: flex;
		gap: 0.75rem;
		flex: 1 1 280px;
		min-width: min(280px, 100%);
		flex-wrap: wrap;
	}

	.btn-primary,
	.btn-secondary {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		gap: 0.5rem;
		height: 44px;
		padding: 0 1.25rem;
		font-size: 0.92rem;
		font-weight: 600;
		border-radius: 8px;
		cursor: pointer;
		transition: all 0.15s ease;
		box-sizing: border-box;
		white-space: nowrap;
		flex: 1 1 auto;
		min-width: 130px;
	}

	@media (max-width: 500px) {
		.actions {
			flex-direction: column;
			width: 100%;
		}

		.btn-primary,
		.btn-secondary {
			width: 100%;
		}
	}

	.btn-primary {
		background-color: var(--accent-primary);
		color: #ffffff;
		border: 1px solid transparent;
		box-shadow: 0 1px 3px rgba(37, 99, 235, 0.2);
	}

	.btn-primary:hover:not(:disabled) {
		background-color: var(--accent-hover);
		transform: translateY(-1px);
		box-shadow: 0 4px 8px rgba(37, 99, 235, 0.3);
	}

	.btn-secondary {
		background-color: var(--bg-card);
		color: var(--text-primary);
		border: 1px solid var(--border-color);
	}

	.btn-secondary:hover:not(:disabled) {
		border-color: var(--accent-primary);
		color: var(--accent-primary);
		transform: translateY(-1px);
	}

	.btn-primary:active,
	.btn-secondary:active,
	.btn-copy:active {
		transform: translateY(0);
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
		flex-wrap: wrap;
		gap: 1.5rem;
	}

	.results-summary {
		flex: 1;
		background: var(--success-bg);
		padding: 1.5rem;
		border-radius: 8px;
		border-left: 6px solid var(--success-border);
	}

	.goal-message {
		display: flex;
		align-items: flex-start;
		gap: 0.5rem;
		margin-top: 0.35rem;
	}

	.goal-message :global(.goal-icon) {
		flex-shrink: 0;
		color: var(--accent-primary);
		margin-top: 2px;
	}

	.goal-message p {
		margin: 0;
		font-size: 0.9rem;
		line-height: 1.4;
	}

	.btn-copy {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		gap: 0.45rem;
		height: 38px;
		padding: 0 1.15rem;
		background-color: var(--accent-primary);
		color: #ffffff;
		border: none;
		border-radius: 8px;
		font-size: 0.85rem;
		font-weight: 600;
		cursor: pointer;
		transition: all 0.15s ease;
		white-space: nowrap;
	}

	.btn-copy:hover {
		background-color: var(--accent-hover);
		transform: translateY(-1px);
		box-shadow: 0 2px 6px rgba(37, 99, 235, 0.25);
	}

	.btn-copy.copied {
		background-color: #16a34a;
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
		grid-template-columns: repeat(auto-fill, minmax(min(360px, 100%), 1fr));
		gap: clamp(1rem, 1.5vw, 2rem);
		width: 100%;
		box-sizing: border-box;
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
