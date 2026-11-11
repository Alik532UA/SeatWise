<script lang="ts">
	import { getContext } from 'svelte';
	import type { SeatingController } from '$lib/controllers/SeatingController.svelte';
	import * as m from '$lib/paraglide/messages';
	import NumberStepper from '$lib/components/ui/NumberStepper.svelte';
	import {
		Sparkle,
		ArrowsCounterClockwise,
		Copy,
		Check,
		WarningCircle,
		Users
	} from 'phosphor-svelte';

	const seating = getContext<SeatingController>('seating');
</script>

<div class="skin-compact" class:has-active-participant={seating.activeParticipantId !== null}>
	<section class="config-bar">
		<div class="field">
			<span class="label">N:</span>
			<div class="stepper-wrap">
				<NumberStepper
					bind:value={seating.totalPeople}
					min={2}
					max={200}
					id="compact-n"
					ariaLabel="N"
				/>
			</div>
		</div>
		<div class="field">
			<span class="label">T:</span>
			<div class="stepper-wrap">
				<NumberStepper
					bind:value={seating.tableCount}
					min={1}
					max={50}
					id="compact-t"
					ariaLabel="T"
				/>
			</div>
		</div>
		<div class="field">
			<span class="label">C:</span>
			<div class="stepper-wrap">
				<NumberStepper
					bind:value={seating.tableCapacity}
					min={2}
					max={30}
					id="compact-c"
					ariaLabel="C"
				/>
			</div>
		</div>
		<div class="actions">
			<button
				class="primary btn-primary touch-target"
				onclick={() => seating.calculate()}
				disabled={seating.isCalculating}
			>
				<Sparkle size={15} weight="bold" />
				<span>{seating.isCalculating ? m.calculating() : m.calculate_button()}</span>
			</button>
			<button class="secondary btn-secondary touch-target" onclick={() => seating.reset()}>
				<ArrowsCounterClockwise size={15} weight="bold" />
				<span>{m.reset()}</span>
			</button>
		</div>
	</section>

	<details class="names-details" open={seating.namesInput.trim().length > 0}>
		<summary class="names-summary">
			<div class="summary-left">
				<Users size={15} weight="bold" />
				<span>{m.participants_list()} ({seating.participantNames.length})</span>
			</div>
			<span class="names-status-pill">
				{seating.namesInput.trim().length > 0
					? `${seating.participantNames.length} / ${seating.totalPeople}`
					: `1..${seating.totalPeople}`}
			</span>
		</summary>
		<div class="names-body">
			<textarea
				id="namesInput"
				bind:value={seating.namesInput}
				placeholder={m.participants_placeholder()}
				rows="3"
				class="compact-textarea"
			></textarea>
		</div>
	</details>

	{#if seating.errorMessage}
		<div class="alert-compact error" role="alert">
			<WarningCircle size={18} weight="bold" />
			<span>{seating.errorMessage}</span>
		</div>
	{/if}

	{#if seating.rounds.length > 0}
		<div class="results-toolbar">
			<div class="results-meta">
				<span class="meta-tag">{m.rounds_needed()}: <strong>{seating.rounds.length}</strong></span>
				<span class="meta-tag">{m.total_people()}: <strong>{seating.totalPeople}</strong></span>
			</div>
			<button
				type="button"
				class="copy-btn touch-target"
				class:copied={seating.isCopied}
				onclick={() => seating.copyToClipboard()}
				title={m.copy_button()}
			>
				{#if seating.isCopied}
					<Check size={15} weight="bold" />
					<span>{m.copied()}</span>
				{:else}
					<Copy size={15} weight="bold" />
					<span>{m.copy_button()}</span>
				{/if}
			</button>
		</div>

		<div class="compact-grid">
			{#each seating.rounds as round, rIndex}
				<div class="mini-round">
					<div class="header">R{rIndex + 1}</div>
					<div class="tables">
						{#each round as table, tIndex}
							{#if table.length > 0}
								<div
									class="mini-table"
									class:table-active={seating.activeParticipantId !== null &&
										table.includes(seating.activeParticipantId)}
								>
									<span class="t-id">T{seating.getTableLabel(tIndex)}:</span>
									<span class="t-p">
										{#each table as person, pIndex}
											{#if pIndex > 0},
											{/if}
											<button
												type="button"
												class="compact-person-btn"
												class:is-active={seating.activeParticipantId === person}
												title="{seating.getParticipantName(person)} ({m.click_to_inspect()})"
												onmouseenter={() => seating.setHoveredParticipant(person)}
												onmouseleave={() => seating.setHoveredParticipant(null)}
												onclick={() => seating.toggleSelectedParticipant(person)}
												ondblclick={() => seating.openParticipantModal(person)}
											>
												{seating.getParticipantName(person)}
											</button>
										{/each}
									</span>
								</div>
							{/if}
						{/each}
					</div>
				</div>
			{/each}
		</div>
	{:else if !seating.errorMessage}
		<div class="empty-state">
			<Sparkle size={26} weight="duotone" class="empty-icon" />
			<p class="empty-title">{m.app_title()}</p>
			<p class="empty-desc">{m.app_subtitle()}</p>
			<button
				type="button"
				class="primary btn-primary touch-target empty-calc-btn"
				onclick={() => seating.calculate()}
				disabled={seating.isCalculating}
			>
				<Sparkle size={15} weight="bold" />
				<span>{seating.isCalculating ? m.calculating() : m.calculate_button()}</span>
			</button>
		</div>
	{/if}
</div>

<style>
	.skin-compact {
		font-family: 'Consolas', 'Monaco', monospace;
		font-size: 0.85rem;
		display: flex;
		flex-direction: column;
		gap: 0.65rem;
	}

	.config-bar {
		display: flex;
		flex-wrap: wrap;
		gap: 0.85rem;
		padding: 0.6rem 0.9rem;
		background: var(--bg-card);
		border: 1px solid var(--border-color);
		border-radius: 8px;
		align-items: center;
	}

	.field {
		display: flex;
		gap: 0.45rem;
		align-items: center;
	}

	.field .label {
		font-weight: 700;
		color: var(--text-secondary);
	}

	.stepper-wrap {
		width: 140px;
		max-width: 100%;
	}

	.names-details {
		background: var(--bg-card);
		border: 1px solid var(--border-color);
		border-radius: 8px;
		overflow: hidden;
		transition: border-color 0.15s ease;
		max-width: 1200px;
		width: 100%;
		box-sizing: border-box;
	}

	.names-summary {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 0.5rem;
		padding: 0.45rem 0.85rem;
		cursor: pointer;
		user-select: none;
		font-weight: 600;
		color: var(--text-secondary);
		background: var(--bg-secondary);
		transition: color 0.15s ease;
	}

	.summary-left {
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}

	.names-status-pill {
		font-size: 0.75rem;
		font-weight: 600;
		color: var(--accent-primary);
		background: rgba(37, 99, 235, 0.1);
		padding: 2px 8px;
		border-radius: 6px;
	}

	.names-summary:hover {
		color: var(--accent-primary);
	}

	.names-body {
		padding: 0.75rem;
		background: var(--bg-card);
	}

	.compact-textarea {
		width: 100%;
		box-sizing: border-box;
		padding: 0.5rem;
		background: var(--bg-primary);
		color: var(--text-primary);
		border: 1px solid var(--border-color);
		border-radius: 6px;
		font-family: inherit;
		font-size: 0.85rem;
		resize: vertical;
		outline: none;
	}

	.compact-textarea:focus {
		border-color: var(--accent-primary);
	}

	.alert-compact {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.75rem 1rem;
		background: rgba(239, 68, 68, 0.1);
		border: 1px solid rgba(239, 68, 68, 0.3);
		border-radius: 8px;
		color: #ef4444;
		font-weight: 600;
	}

	.results-toolbar {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 0.6rem 1rem;
		background: var(--bg-card);
		border: 1px solid var(--border-color);
		border-radius: 8px;
		flex-wrap: wrap;
		gap: 0.75rem;
	}

	.results-meta {
		display: flex;
		gap: 0.75rem;
		flex-wrap: wrap;
	}

	.meta-tag {
		background: var(--bg-secondary);
		padding: 0.25rem 0.6rem;
		border-radius: 4px;
		color: var(--text-secondary);
		border: 1px solid var(--border-color);
	}

	.meta-tag strong {
		color: var(--text-primary);
	}

	.copy-btn {
		display: inline-flex;
		align-items: center;
		gap: 0.4rem;
		padding: 0.4rem 0.85rem;
		background: var(--bg-secondary);
		color: var(--text-primary);
		border: 1px solid var(--border-color);
		border-radius: 6px;
		cursor: pointer;
		font-family: inherit;
		font-size: 0.82rem;
		font-weight: 600;
		transition: all 0.15s ease;
	}

	.copy-btn:hover {
		border-color: var(--accent-primary);
		color: var(--accent-primary);
	}

	.copy-btn.copied {
		background: #10b981;
		color: #ffffff;
		border-color: #10b981;
	}

	.empty-state {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		text-align: center;
		padding: 2.5rem 1.5rem;
		background: var(--bg-card);
		border: 1px dashed var(--border-color);
		border-radius: 12px;
		gap: 0.6rem;
	}

	.empty-state :global(.empty-icon) {
		color: var(--accent-primary);
	}

	.empty-title {
		font-size: 1.05rem;
		font-weight: 700;
		color: var(--text-primary);
		margin: 0;
	}

	.empty-desc {
		font-size: 0.85rem;
		color: var(--text-secondary);
		max-width: 500px;
		margin: 0 0 0.5rem 0;
		line-height: 1.4;
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
		grid-template-columns: repeat(auto-fill, minmax(min(260px, 100%), 1fr));
		gap: 0.75rem;
		width: 100%;
		box-sizing: border-box;
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
		transition: opacity 0.2s ease;
	}

	.skin-compact.has-active-participant .mini-table:not(.table-active) {
		opacity: 0.35;
	}

	.skin-compact.has-active-participant .mini-table.table-active {
		opacity: 1;
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

	.compact-person-btn {
		background: transparent;
		border: none;
		padding: 1px 4px;
		border-radius: 4px;
		color: inherit;
		font: inherit;
		cursor: pointer;
		transition: all 0.15s ease;
	}

	.compact-person-btn:hover {
		background: rgba(37, 99, 235, 0.15);
		color: var(--accent-primary);
	}

	.skin-compact.has-active-participant .compact-person-btn:not(.is-active) {
		opacity: 0.35;
	}

	.skin-compact.has-active-participant .compact-person-btn.is-active {
		background: #fef3c7;
		color: #b45309;
		font-weight: 700;
		outline: 2px solid #f59e0b;
		opacity: 1 !important;
	}
</style>
