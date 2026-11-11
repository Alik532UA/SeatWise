<script lang="ts">
	import { getContext } from 'svelte';
	import type { UIController } from '$lib/controllers/UIController.svelte';
	import {
		SeatingController,
		TABLE_PALETTE,
		type TableColorMode
	} from '$lib/controllers/SeatingController.svelte';
	import * as m from '$lib/paraglide/messages';
	import { X, Gear, Palette, TextAa } from 'phosphor-svelte';

	const ui = getContext<UIController>('ui');
	const seating = getContext<SeatingController>('seating');

	function handleKeydown(e: KeyboardEvent) {
		if (e.key === 'Escape' && ui.isSettingsOpen) {
			ui.closeSettings();
		}
	}
</script>

<svelte:window onkeydown={handleKeydown} />

{#if ui.isSettingsOpen}
	<div
		class="modal-backdrop"
		role="presentation"
		onclick={(e) => {
			if (e.target === e.currentTarget) ui.closeSettings();
		}}
	>
		<div
			class="settings-dialog"
			role="dialog"
			aria-modal="true"
			aria-labelledby="settings-dialog-title"
			data-testid="settings-dialog"
		>
			<div class="dialog-header">
				<div class="dialog-title-wrap">
					<div class="icon-box">
						<Gear size={20} weight="bold" />
					</div>
					<h2 id="settings-dialog-title" class="dialog-title">{m.settings()}</h2>
				</div>
				<button
					type="button"
					class="close-btn touch-target"
					onclick={() => ui.closeSettings()}
					aria-label={m.close()}
					title={m.close()}
					data-testid="close-settings-btn"
				>
					<X size={18} weight="bold" />
				</button>
			</div>

			<div class="dialog-content">
				<!-- 1. Labeling format -->
				<section class="settings-section">
					<div class="section-title-wrap">
						<TextAa size={18} weight="bold" class="section-icon" />
						<h3 class="section-title">{m.naming_settings()}</h3>
					</div>

					<div class="options-grid">
						<!-- Table format -->
						<div class="option-row">
							<span class="option-label">{m.table_format()}:</span>
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

						<!-- Participant format -->
						<div class="option-row">
							<span class="option-label">{m.participant_format()}:</span>
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
				</section>

				<!-- 2. Table Colors -->
				<section class="settings-section">
					<div class="section-title-wrap">
						<Palette size={18} weight="bold" class="section-icon" />
						<h3 class="section-title">{m.table_colors()}</h3>
					</div>

					<div class="option-row">
						<span class="option-label">{m.table_colors()}:</span>
						<div class="segmented-control" role="radiogroup" aria-label={m.table_colors()}>
							<button
								type="button"
								class="segment-btn"
								class:active={seating.tableColorMode === 'monochrome'}
								onclick={() => seating.setTableColorMode('monochrome')}
								aria-checked={seating.tableColorMode === 'monochrome'}
								role="radio"
								data-testid="color-mode-monochrome"
							>
								{m.color_monochrome()}
							</button>
							<button
								type="button"
								class="segment-btn"
								class:active={seating.tableColorMode === 'palette'}
								onclick={() => seating.setTableColorMode('palette')}
								aria-checked={seating.tableColorMode === 'palette'}
								role="radio"
								data-testid="color-mode-palette"
							>
								{m.color_palette()}
							</button>
						</div>
					</div>

					{#if seating.tableColorMode === 'palette'}
						<div class="palette-preview" aria-label="Palette preview">
							{#each TABLE_PALETTE.slice(0, 16) as col}
								<span class="palette-dot" style="background-color: {col};" title={col}></span>
							{/each}
						</div>
					{/if}
				</section>
			</div>

			<div class="dialog-footer">
				<button type="button" class="btn-done touch-target" onclick={() => ui.closeSettings()}>
					{m.close()}
				</button>
			</div>
		</div>
	</div>
{/if}

<style>
	.modal-backdrop {
		position: fixed;
		inset: 0;
		background: rgba(0, 0, 0, 0.6);
		backdrop-filter: blur(6px);
		-webkit-backdrop-filter: blur(6px);
		z-index: 1000;
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 1rem;
		animation: fadeIn 0.18s ease-out;
	}

	@keyframes fadeIn {
		from {
			opacity: 0;
		}
		to {
			opacity: 1;
		}
	}

	.settings-dialog {
		background: var(--bg-card);
		border: 1px solid var(--border-color);
		border-radius: 20px;
		width: 100%;
		max-width: 480px;
		box-shadow: 0 20px 40px rgba(0, 0, 0, 0.25);
		display: flex;
		flex-direction: column;
		overflow: hidden;
		animation: slideUp 0.2s cubic-bezier(0.16, 1, 0.3, 1);
	}

	@keyframes slideUp {
		from {
			transform: translateY(16px) scale(0.98);
			opacity: 0;
		}
		to {
			transform: translateY(0) scale(1);
			opacity: 1;
		}
	}

	.dialog-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 1rem 1.25rem;
		border-bottom: 1px solid var(--border-color);
		background: var(--bg-secondary);
	}

	.dialog-title-wrap {
		display: flex;
		align-items: center;
		gap: 0.6rem;
	}

	.icon-box {
		width: 32px;
		height: 32px;
		border-radius: 8px;
		background: rgba(37, 99, 235, 0.12);
		color: var(--accent-primary);
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.dialog-title {
		margin: 0;
		font-size: 1.1rem;
		font-weight: 700;
		color: var(--text-primary);
	}

	.close-btn {
		width: 34px;
		height: 34px;
		border-radius: 8px;
		border: 1px solid var(--border-color);
		background: transparent;
		color: var(--text-secondary);
		display: inline-flex;
		align-items: center;
		justify-content: center;
		cursor: pointer;
		transition: all 0.15s ease;
	}

	.close-btn:hover {
		background: var(--bg-secondary);
		color: var(--text-primary);
		border-color: var(--accent-primary);
	}

	.dialog-content {
		padding: 1.25rem;
		display: flex;
		flex-direction: column;
		gap: 1.25rem;
	}

	.settings-section {
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
		background: var(--bg-secondary);
		border: 1px solid var(--border-color);
		border-radius: 12px;
		padding: 1rem;
	}

	.section-title-wrap {
		display: flex;
		align-items: center;
		gap: 0.45rem;
		color: var(--text-secondary);
	}

	.section-title {
		margin: 0;
		font-size: 0.85rem;
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 0.04em;
	}

	.options-grid {
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
	}

	.option-row {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 1rem;
		flex-wrap: wrap;
	}

	.option-label {
		font-size: 0.9rem;
		font-weight: 600;
		color: var(--text-primary);
	}

	.segmented-control {
		display: inline-flex;
		align-items: center;
		height: 36px;
		background: var(--bg-card);
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
		padding: 0 0.8rem;
		border-radius: 6px;
		font-size: 0.8rem;
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
		background-color: var(--accent-primary);
		color: #ffffff;
		box-shadow: 0 1px 3px rgba(37, 99, 235, 0.25);
	}

	.palette-preview {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 8px;
		padding-top: 0.35rem;
		max-width: 100%;
	}

	.palette-dot {
		width: 18px;
		height: 18px;
		border-radius: 50%;
		box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
	}

	.dialog-footer {
		padding: 0.85rem 1.25rem;
		border-top: 1px solid var(--border-color);
		display: flex;
		justify-content: flex-end;
		background: var(--bg-secondary);
	}

	.btn-done {
		height: 38px;
		padding: 0 1.25rem;
		border-radius: 8px;
		background: var(--accent-primary);
		color: #ffffff;
		border: none;
		font-weight: 600;
		font-size: 0.85rem;
		cursor: pointer;
		transition: all 0.15s ease;
	}

	.btn-done:hover {
		background: var(--accent-hover);
		transform: translateY(-1px);
	}
</style>
