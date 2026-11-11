<script lang="ts">
	import { getContext } from 'svelte';
	import type { SeatingController } from '$lib/controllers/SeatingController.svelte';
	import * as m from '$lib/paraglide/messages';
	import { X, Copy, Check, Armchair, List, Sparkle, Users } from 'phosphor-svelte';

	const seating = getContext<SeatingController>('seating');

	const participantId = $derived(seating.modalParticipantId);
	const participantName = $derived(participantId ? seating.getParticipantName(participantId) : '');
	const schedule = $derived(participantId ? seating.getParticipantSchedule(participantId) : []);

	let viewMode = $state<'tables' | 'list'>('tables');

	function hasCustomName(id: number): boolean {
		const rawNames = seating.namesInput
			.split('\n')
			.map((n) => n.trim())
			.filter((n) => n.length > 0);
		return (
			!!rawNames[id - 1] && seating.getParticipantName(id) !== seating.getParticipantDefaultName(id)
		);
	}

	function handleKeydown(e: KeyboardEvent) {
		if (e.key === 'Escape' && seating.isParticipantModalOpen) {
			seating.closeParticipantModal();
		}
	}
</script>

<svelte:window onkeydown={handleKeydown} />

{#if seating.isParticipantModalOpen && participantId}
	{@const isCustom = hasCustomName(participantId)}
	<div
		class="modal-backdrop"
		role="presentation"
		onclick={(e) => {
			if (e.target === e.currentTarget) seating.closeParticipantModal();
		}}
	>
		<div
			class="schedule-dialog"
			role="dialog"
			aria-modal="true"
			aria-labelledby="participant-modal-title"
			data-testid="participant-schedule-modal"
		>
			<!-- Dialog Header -->
			<div class="dialog-header">
				<div class="participant-badge-row">
					<div class="participant-avatar">
						{#if isCustom}
							{seating.getInitials(participantId)}
						{:else}
							#{participantId}
						{/if}
					</div>
					<div class="participant-info">
						<span class="sub-label">{m.participant_card()} #{participantId}</span>
						<h2 id="participant-modal-title" class="dialog-title">
							{#if isCustom}
								{participantName}
							{:else}
								{m.participant_card()} #{participantId}
							{/if}
						</h2>
					</div>
				</div>

				<!-- View Mode Toggle (Tables vs List) -->
				<div class="view-mode-toggle" role="group" aria-label="Режим перегляду">
					<button
						type="button"
						class="view-mode-btn"
						class:active={viewMode === 'tables'}
						onclick={() => (viewMode = 'tables')}
						data-testid="view-mode-tables-btn"
					>
						<Armchair size={15} weight="duotone" />
						<span>{m.view_tables()}</span>
					</button>
					<button
						type="button"
						class="view-mode-btn"
						class:active={viewMode === 'list'}
						onclick={() => (viewMode = 'list')}
						data-testid="view-mode-list-btn"
					>
						<List size={15} weight="bold" />
						<span>{m.view_list()}</span>
					</button>
				</div>

				<button
					type="button"
					class="close-btn touch-target"
					onclick={() => seating.closeParticipantModal()}
					aria-label={m.close()}
					title={m.close()}
					data-testid="close-participant-modal-btn"
				>
					<X size={18} weight="bold" />
				</button>
			</div>

			<!-- Dialog Content -->
			<div class="dialog-content">
				<div class="timeline-header">
					<div class="header-left">
						<span class="timeline-title">{m.participant_schedule()}</span>
						<span class="rounds-count">{schedule.length} {m.round().toLowerCase()}</span>
					</div>
					<span class="view-hint">
						{#if viewMode === 'tables'}
							{m.click_to_inspect()}
						{/if}
					</span>
				</div>

				<div class="rounds-container" data-testid="participant-rounds-list">
					{#if viewMode === 'tables'}
						<!-- Tables View (Default) -->
						<div class="rounds-grid-tables">
							{#each schedule as item}
								{@const totalSeats = item.companions.length + 1}
								<div class="mini-table-card" style="--tbl-col: {item.tableColor};">
									<div class="mini-card-header">
										<span class="mini-round-num">{m.round()} {item.roundNumber}</span>
										<div class="mini-table-pill" style="--col: {item.tableColor};">
											<Armchair size={13} weight="duotone" />
											<span>#{item.tableLabel} {m.table()}</span>
										</div>
									</div>

									<div class="mini-table-scene">
										<!-- Center table surface -->
										<div class="mini-table-surface" style="--tbl-col: {item.tableColor};">
											<span class="mini-surface-label">#{item.tableLabel}</span>
										</div>

										<!-- Seats around table -->
										<!-- Main participant seat at angle -90deg (top) -->
										<div
											class="mini-seat-wrapper"
											style="--seat-angle: -90deg; --seat-radius: 46px;"
										>
											<div class="mini-seat is-me" title="{m.you()}: {participantName}">
												<span class="mini-seat-text">
													{#if isCustom}
														{seating.getInitials(participantId)}
													{:else}
														{participantId}
													{/if}
												</span>
												<span class="me-indicator" title={m.you()}>★</span>
											</div>
										</div>

										<!-- Companion seats -->
										{#each item.companions as companionId, cIdx}
											{@const angle = -90 + ((cIdx + 1) * 360) / totalSeats}
											{@const companionCustom = hasCustomName(companionId)}
											<div
												class="mini-seat-wrapper"
												style="--seat-angle: {angle}deg; --seat-radius: 46px;"
											>
												<button
													type="button"
													class="mini-seat companion"
													onclick={() => seating.openParticipantModal(companionId)}
													title="{seating.getParticipantName(companionId)} (#{companionId})"
												>
													<span class="mini-seat-text">
														{#if companionCustom}
															{seating.getInitials(companionId)}
														{:else}
															{companionId}
														{/if}
													</span>
												</button>
											</div>
										{/each}
									</div>

									<div class="mini-card-footer">
										<div class="companions-preview">
											<span class="preview-label">{m.companions()}:</span>
											<span class="preview-names">
												{item.companions
													.map((cId) =>
														hasCustomName(cId) ? seating.getParticipantName(cId) : `#${cId}`
													)
													.join(', ')}
											</span>
										</div>
									</div>
								</div>
							{/each}
						</div>
					{:else}
						<!-- List View (Single-column, 1-row-per-item) -->
						<div class="rounds-list-linear">
							{#each schedule as item}
								<div class="linear-round-row">
									<div class="linear-round-meta">
										<span class="linear-round-number">{m.round()} {item.roundNumber}</span>
										<div class="linear-table-pill" style="--tbl-col: {item.tableColor};">
											<Armchair size={14} weight="duotone" />
											<span>#{item.tableLabel} {m.table()}</span>
										</div>
									</div>

									<div class="linear-companions-wrapper">
										<span class="linear-companions-icon" title={m.companions()}>
											<Users size={15} weight="bold" />
										</span>
										<div class="linear-chips-row">
											{#each item.companions as companionId}
												{@const companionCustom = hasCustomName(companionId)}
												<button
													type="button"
													class="companion-chip"
													onclick={() => seating.openParticipantModal(companionId)}
													title="{seating.getParticipantName(companionId)} (#{companionId})"
												>
													{#if companionCustom}
														<span class="chip-avatar">{seating.getInitials(companionId)}</span>
														<span class="chip-name">{seating.getParticipantName(companionId)}</span>
													{:else}
														<span class="chip-num">#{companionId}</span>
													{/if}
												</button>
											{/each}
										</div>
									</div>
								</div>
							{/each}
						</div>
					{/if}
				</div>
			</div>

			<!-- Dialog Footer -->
			<div class="dialog-footer">
				<button
					type="button"
					class="btn-copy-schedule touch-target"
					class:copied={seating.isParticipantCopied}
					onclick={() => seating.copyParticipantSchedule(participantId)}
					data-testid="copy-participant-schedule-btn"
				>
					{#if seating.isParticipantCopied}
						<Check size={16} weight="bold" />
						<span>{m.guest_schedule_copied()}</span>
					{:else}
						<Copy size={16} weight="bold" />
						<span>{m.copy_guest_schedule()}</span>
					{/if}
				</button>

				<button
					type="button"
					class="btn-close-text touch-target"
					onclick={() => seating.closeParticipantModal()}
				>
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
		background: rgba(0, 0, 0, 0.72);
		backdrop-filter: blur(8px);
		-webkit-backdrop-filter: blur(8px);
		z-index: 1100;
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

	.schedule-dialog {
		background: var(--bg-card);
		border: 1px solid var(--border-color);
		border-radius: 20px;
		width: 95vw;
		max-width: 1320px;
		max-height: 92vh;
		box-shadow: 0 24px 50px rgba(0, 0, 0, 0.4);
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
		padding: 0.85rem 1.25rem;
		border-bottom: 1px solid var(--border-color);
		background: var(--bg-secondary);
		gap: 1rem;
		flex-wrap: wrap;
	}

	.participant-badge-row {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		min-width: 0;
	}

	.participant-avatar {
		width: 40px;
		height: 40px;
		border-radius: 50%;
		background: linear-gradient(135deg, var(--accent-primary), #8b5cf6);
		color: #ffffff;
		display: flex;
		align-items: center;
		justify-content: center;
		font-weight: 800;
		font-size: 0.95rem;
		box-shadow: 0 4px 10px rgba(37, 99, 235, 0.3);
		flex-shrink: 0;
	}

	.participant-info {
		display: flex;
		flex-direction: column;
		min-width: 0;
	}

	.sub-label {
		font-size: 0.7rem;
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 0.05em;
		color: var(--text-secondary);
	}

	.dialog-title {
		margin: 0;
		font-size: 1.15rem;
		font-weight: 800;
		color: var(--text-primary);
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	/* View mode toggle (Tables vs List) */
	.view-mode-toggle {
		display: inline-flex;
		align-items: center;
		background: var(--bg-card);
		padding: 3px;
		border-radius: 10px;
		border: 1px solid var(--border-color);
		gap: 2px;
	}

	.view-mode-btn {
		display: inline-flex;
		align-items: center;
		gap: 0.35rem;
		padding: 4px 10px;
		font-size: 0.78rem;
		font-weight: 700;
		border-radius: 7px;
		border: none;
		background: transparent;
		color: var(--text-secondary);
		cursor: pointer;
		transition: all 0.15s ease;
	}

	.view-mode-btn:hover {
		color: var(--text-primary);
	}

	.view-mode-btn.active {
		background: var(--accent-primary);
		color: #ffffff;
		box-shadow: 0 2px 6px rgba(37, 99, 235, 0.3);
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
		flex-shrink: 0;
	}

	.close-btn:hover {
		background: var(--bg-card);
		color: var(--text-primary);
		border-color: var(--accent-primary);
	}

	.dialog-content {
		padding: 1rem 1.25rem;
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
		overflow-y: auto;
		flex: 1;
	}

	.timeline-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding-bottom: 0.35rem;
		border-bottom: 1px dashed var(--border-color);
	}

	.header-left {
		display: flex;
		align-items: center;
		gap: 0.65rem;
	}

	.timeline-title {
		font-size: 0.82rem;
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 0.04em;
		color: var(--text-secondary);
	}

	.rounds-count {
		font-size: 0.78rem;
		font-weight: 600;
		color: var(--accent-primary);
		background: rgba(37, 99, 235, 0.1);
		padding: 2px 8px;
		border-radius: 10px;
	}

	.view-hint {
		font-size: 0.75rem;
		color: var(--text-secondary);
	}

	.rounds-container {
		width: 100%;
	}

	/* Tables Grid View */
	.rounds-grid-tables {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(215px, 1fr));
		gap: 0.85rem;
		justify-content: center;
	}

	.mini-table-card {
		background: var(--bg-secondary);
		border: 1px solid var(--border-color);
		border-radius: 14px;
		padding: 0.75rem;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.65rem;
		transition: all 0.2s ease;
		position: relative;
		overflow: hidden;
	}

	.mini-table-card:hover {
		border-color: var(--tbl-col, var(--accent-primary));
		box-shadow: 0 6px 18px rgba(0, 0, 0, 0.12);
		transform: translateY(-2px);
	}

	.mini-card-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		width: 100%;
		gap: 0.5rem;
	}

	.mini-round-num {
		font-size: 0.88rem;
		font-weight: 800;
		color: var(--text-primary);
	}

	.mini-table-pill {
		display: inline-flex;
		align-items: center;
		gap: 0.25rem;
		padding: 2px 7px;
		border-radius: 6px;
		background: var(--bg-card);
		border: 1.5px solid var(--col, var(--accent-primary));
		color: var(--col, var(--accent-primary));
		font-size: 0.75rem;
		font-weight: 700;
	}

	/* Mini table visual scene */
	.mini-table-scene {
		position: relative;
		width: 136px;
		height: 136px;
		display: flex;
		align-items: center;
		justify-content: center;
		margin: 0.25rem 0;
	}

	.mini-table-surface {
		width: 46px;
		height: 46px;
		border-radius: 50%;
		background: var(--bg-card);
		border: 2px solid var(--tbl-col, var(--accent-primary));
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
		display: flex;
		align-items: center;
		justify-content: center;
		z-index: 5;
	}

	.mini-surface-label {
		font-size: 0.78rem;
		font-weight: 900;
		color: var(--tbl-col, var(--accent-primary));
		line-height: 1;
	}

	.mini-seat-wrapper {
		position: absolute;
		width: 26px;
		height: 26px;
		transform: rotate(var(--seat-angle)) translateY(calc(-1 * var(--seat-radius)))
			rotate(calc(-1 * var(--seat-angle)));
		transition: all 0.25s ease;
	}

	.mini-seat {
		width: 100%;
		height: 100%;
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 0.72rem;
		font-weight: 800;
		border: 1.5px solid var(--border-color);
		background: var(--bg-card);
		color: var(--text-primary);
		padding: 0;
		cursor: default;
		transition: all 0.15s ease;
		position: relative;
		user-select: none;
	}

	.mini-seat.is-me {
		background: #ffffff !important;
		border: 2px solid #f59e0b !important;
		color: #b45309 !important;
		box-shadow:
			0 0 0 2px rgba(245, 158, 11, 0.35),
			0 4px 10px rgba(245, 158, 11, 0.4) !important;
		transform: scale(1.15);
		z-index: 8;
	}

	.me-indicator {
		position: absolute;
		top: -8px;
		right: -4px;
		font-size: 9px;
		color: #f59e0b;
		text-shadow: 0 0 4px rgba(245, 158, 11, 0.8);
	}

	.mini-seat.companion {
		cursor: pointer;
	}

	.mini-seat.companion:hover {
		transform: scale(1.22);
		border-color: var(--accent-primary);
		color: var(--accent-primary);
		z-index: 9;
		box-shadow: 0 2px 8px rgba(37, 99, 235, 0.3);
	}

	.mini-card-footer {
		width: 100%;
		border-top: 1px dashed var(--border-color);
		padding-top: 0.4rem;
	}

	.companions-preview {
		display: flex;
		flex-direction: column;
		gap: 2px;
		width: 100%;
	}

	.preview-label {
		font-size: 0.65rem;
		text-transform: uppercase;
		font-weight: 700;
		color: var(--text-secondary);
	}

	.preview-names {
		font-size: 0.74rem;
		color: var(--text-primary);
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
		font-weight: 600;
	}

	/* Linear List View (Single column, 1 row per round) */
	.rounds-list-linear {
		display: flex;
		flex-direction: column;
		gap: 0.45rem;
		width: 100%;
		max-width: 900px;
		margin: 0 auto;
	}

	.linear-round-row {
		display: flex;
		align-items: center;
		justify-content: flex-start;
		gap: 0.85rem;
		background: var(--bg-secondary);
		border: 1px solid var(--border-color);
		border-radius: 10px;
		padding: 0.4rem 0.85rem;
		transition: all 0.15s ease;
		min-height: 40px;
		box-sizing: border-box;
	}

	.linear-round-row:hover {
		background: rgba(59, 130, 246, 0.05);
		border-color: var(--accent-primary);
		transform: translateX(2px);
	}

	.linear-round-meta {
		display: flex;
		align-items: center;
		gap: 0.65rem;
		flex-shrink: 0;
	}

	.linear-round-number {
		font-size: 0.88rem;
		font-weight: 800;
		color: var(--text-primary);
		min-width: 75px;
	}

	.linear-table-pill {
		display: inline-flex;
		align-items: center;
		gap: 0.3rem;
		padding: 2px 8px;
		border-radius: 6px;
		background: var(--bg-card);
		border: 1.5px solid var(--tbl-col, var(--accent-primary));
		color: var(--tbl-col, var(--accent-primary));
		font-size: 0.76rem;
		font-weight: 700;
		min-width: 80px;
		justify-content: center;
		white-space: nowrap;
	}

	.linear-companions-wrapper {
		display: flex;
		align-items: center;
		gap: 0.65rem;
		flex: 1;
		min-width: 0;
		overflow-x: auto;
	}

	.linear-companions-icon {
		color: var(--text-secondary);
		display: inline-flex;
		align-items: center;
		flex-shrink: 0;
		opacity: 0.8;
	}

	.linear-chips-row {
		display: flex;
		align-items: center;
		flex-wrap: wrap;
		gap: 0.35rem;
	}

	@media (max-width: 640px) {
		.linear-round-row {
			flex-direction: column;
			align-items: flex-start;
			gap: 0.4rem;
			padding: 0.6rem 0.75rem;
		}

		.linear-round-meta {
			width: 100%;
			justify-content: space-between;
		}
	}

	.companion-chip {
		display: inline-flex;
		align-items: center;
		gap: 0.3rem;
		padding: 2px 7px;
		border-radius: 16px;
		background: var(--bg-card);
		border: 1px solid var(--border-color);
		color: var(--text-primary);
		font-size: 0.75rem;
		font-weight: 600;
		cursor: pointer;
		transition: all 0.15s ease;
	}

	.companion-chip:hover {
		border-color: var(--accent-primary);
		color: var(--accent-primary);
		transform: translateY(-1px);
	}

	.chip-num {
		font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
		font-weight: 700;
		color: var(--text-primary);
	}

	.chip-avatar {
		width: 17px;
		height: 17px;
		border-radius: 50%;
		background: rgba(37, 99, 235, 0.15);
		color: var(--accent-primary);
		display: inline-flex;
		align-items: center;
		justify-content: center;
		font-size: 0.62rem;
		font-weight: 800;
	}

	.chip-name {
		max-width: 120px;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.dialog-footer {
		padding: 0.75rem 1.25rem;
		border-top: 1px solid var(--border-color);
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 0.75rem;
		background: var(--bg-secondary);
	}

	.btn-copy-schedule {
		display: inline-flex;
		align-items: center;
		gap: 0.45rem;
		height: 38px;
		padding: 0 1.15rem;
		border-radius: 10px;
		background: var(--accent-primary);
		color: #ffffff;
		border: none;
		font-weight: 700;
		font-size: 0.84rem;
		cursor: pointer;
		transition: all 0.15s ease;
		box-shadow: 0 2px 8px rgba(37, 99, 235, 0.3);
	}

	.btn-copy-schedule:hover {
		background: var(--accent-hover);
		transform: translateY(-1px);
	}

	.btn-copy-schedule.copied {
		background: #16a34a;
	}

	.btn-close-text {
		height: 38px;
		padding: 0 1.1rem;
		border-radius: 10px;
		background: var(--bg-card);
		border: 1px solid var(--border-color);
		color: var(--text-primary);
		font-weight: 600;
		font-size: 0.84rem;
		cursor: pointer;
		transition: all 0.15s ease;
	}

	.btn-close-text:hover {
		border-color: var(--accent-primary);
		color: var(--accent-primary);
	}
</style>
