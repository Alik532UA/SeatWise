<script lang="ts">
	import { getContext } from 'svelte';
	import type { SeatingController } from '$lib/controllers/SeatingController.svelte';
	import * as m from '$lib/paraglide/messages';
	import NumberStepper from '$lib/components/ui/NumberStepper.svelte';
	import {
		Users,
		Armchair,
		UsersFour,
		Sparkle,
		ArrowsCounterClockwise,
		Copy,
		Check,
		CaretDown,
		Trash,
		MagnifyingGlass,
		User,
		X
	} from 'phosphor-svelte';

	const seating = getContext<SeatingController>('seating');

	let galleryWidth = $state(1200);

	interface TableEntry {
		table: number[];
		tIndex: number;
	}

	const maxTablesPerRow = $derived.by(() => {
		const tableRadius = Math.max(86, seating.tableCapacity * 8.2);
		const tableSlotWidth = tableRadius * 2 + 96 + 44;
		const fitCount = Math.floor((galleryWidth + 44) / tableSlotWidth);
		return Math.max(1, fitCount);
	});

	function getBalancedRows(round: number[][]): TableEntry[][] {
		const entries: TableEntry[] = round
			.map((table, tIndex) => ({ table, tIndex }))
			.filter((entry) => entry.table.length > 0);

		const total = entries.length;
		if (total <= maxTablesPerRow) {
			return [entries];
		}

		// Кількість рядків, що знадобиться при поточному розмірі контейнера
		const rowCount = Math.ceil(total / maxTablesPerRow);
		// Рівномірний розподіл (попалам/симетрично): кожен рядок має різницю щонайбільше в 1 стіл
		const baseSize = Math.floor(total / rowCount);
		const remainder = total % rowCount;

		const rows: TableEntry[][] = [];
		let startIndex = 0;
		for (let r = 0; r < rowCount; r++) {
			const size = baseSize + (r < remainder ? 1 : 0);
			rows.push(entries.slice(startIndex, startIndex + size));
			startIndex += size;
		}
		return rows;
	}

	const rawNamesCount = $derived(
		seating.namesInput
			.split('\n')
			.map((n) => n.trim())
			.filter((n) => n.length > 0).length
	);
</script>

<div class="skin-visual" class:has-active-participant={seating.activeParticipantId !== null}>
	<div class="control-center">
		<div class="parameters-row">
			<div class="stat-card">
				<span class="icon"><Users size={24} weight="duotone" /></span>
				<div class="info">
					<span class="label">{m.total_people()}</span>
					<NumberStepper
						bind:value={seating.totalPeople}
						min={2}
						max={200}
						id="visual-people"
						ariaLabel={m.total_people()}
					/>
				</div>
			</div>
			<div class="stat-card">
				<span class="icon"><Armchair size={24} weight="duotone" /></span>
				<div class="info">
					<span class="label">{m.table_count()}</span>
					<NumberStepper
						bind:value={seating.tableCount}
						min={1}
						max={50}
						id="visual-tables"
						ariaLabel={m.table_count()}
					/>
				</div>
			</div>
			<div class="stat-card">
				<span class="icon"><UsersFour size={24} weight="duotone" /></span>
				<div class="info">
					<span class="label">{m.table_capacity()}</span>
					<NumberStepper
						bind:value={seating.tableCapacity}
						min={2}
						max={30}
						id="visual-capacity"
						ariaLabel={m.table_capacity()}
					/>
				</div>
			</div>

			<div class="main-actions">
				<button
					class="glow-button touch-target"
					onclick={() => seating.calculate()}
					disabled={seating.isCalculating}
				>
					<Sparkle size={18} weight="bold" />
					<span>{seating.isCalculating ? m.calculating() : m.calculate_button()}</span>
				</button>
				<button class="btn-reset touch-target" onclick={() => seating.reset()}>
					<ArrowsCounterClockwise size={16} weight="bold" />
					<span>{m.reset()}</span>
				</button>
			</div>
		</div>

		<details class="names-panel-visual" open={rawNamesCount > 0}>
			<summary class="names-visual-summary">
				<div class="summary-left">
					<div class="icon-wrap">
						<Users size={16} weight="duotone" />
					</div>
					<span class="summary-title">{m.participants_list()}</span>
					{#if rawNamesCount === 0}
						<span class="names-pill default">
							{m.format_numbers()}: 1..{seating.totalPeople}
						</span>
					{:else}
						<span
							class="names-pill"
							class:match={rawNamesCount === seating.totalPeople}
							class:over={rawNamesCount > seating.totalPeople}
						>
							{rawNamesCount} / {seating.totalPeople}
						</span>
					{/if}
				</div>

				<div class="summary-right">
					<span class="toggle-text">{rawNamesCount > 0 ? 'Редагувати' : 'Ввести імена'}</span>
					<CaretDown size={14} weight="bold" class="toggle-chevron" />
				</div>
			</summary>

			<div class="names-visual-body">
				<div class="names-body-toolbar">
					<p class="names-hint">
						{m.participants_placeholder()}
					</p>
					{#if rawNamesCount > 0}
						<button
							type="button"
							class="btn-clear-names"
							onclick={() => (seating.namesInput = '')}
							title="Очистити список імен"
						>
							<Trash size={14} weight="bold" />
							<span>{m.reset()}</span>
						</button>
					{/if}
				</div>

				<textarea
					id="namesInput"
					bind:value={seating.namesInput}
					placeholder={m.participants_placeholder()}
					rows="4"
					class="visual-textarea"
				></textarea>
			</div>
		</details>
	</div>

	{#if seating.errorMessage}
		<div class="alert error">{seating.errorMessage}</div>
	{/if}

	{#if seating.rounds.length > 0}
		<div class="visual-header">
			<div class="summary-badge">
				<span class="count">{seating.rounds.length}</span>
				<span class="desc">{m.rounds_needed()}</span>
			</div>

			<div class="search-box" role="search">
				<span class="search-icon"><MagnifyingGlass size={16} weight="bold" /></span>
				<input
					type="text"
					class="search-input"
					placeholder={m.search_participant()}
					bind:value={seating.searchQuery}
					oninput={() => {
						if (seating.filteredParticipants.length > 0) {
							seating.selectedParticipantId = seating.filteredParticipants[0].id;
						} else if (!seating.searchQuery.trim()) {
							seating.clearSelection();
						}
					}}
					data-testid="participant-search-input"
				/>
				{#if seating.searchQuery}
					<button
						type="button"
						class="clear-search-btn"
						onclick={() => seating.clearSelection()}
						aria-label={m.clear_selection()}
					>
						<X size={14} weight="bold" />
					</button>
				{/if}
			</div>

			<button
				class="btn-copy-visual"
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

		<div class="visual-rounds" bind:clientWidth={galleryWidth}>
			{#each seating.rounds as round, rIndex}
				<div class="round-section">
					<div class="round-title">
						<span class="sparkle"><Sparkle size={18} weight="fill" /></span>
						<h3>{m.round()} {rIndex + 1}</h3>
						<span class="sparkle"><Sparkle size={18} weight="fill" /></span>
					</div>

					<div class="table-gallery">
						{#each getBalancedRows(round) as tableRow}
							<div class="table-gallery-row">
								{#each tableRow as { table, tIndex }}
									{@const tableColor = seating.getTableColor(tIndex)}
									{@const isTableActive =
										seating.activeParticipantId !== null &&
										table.includes(seating.activeParticipantId)}
									{@const radius = Math.max(86, table.length * 8.2)}
									{@const containerSize = radius * 2 + 96}
									<div
										class="visual-table-container"
										style="--radius: {radius}px; --table-size: {containerSize}px; --table-color: {tableColor};"
									>
										<div class="visual-table" class:table-active={isTableActive}>
											<div class="table-surface" style="border-color: {tableColor};">
												<span class="table-number" style="color: {tableColor};"
													>#{seating.getTableLabel(tIndex)}</span
												>
												<span class="table-text">{m.table()}</span>
											</div>

											<div class="table-participants">
												{#each table as person, pIndex}
													{@const isPersonActive = seating.activeParticipantId === person}
													{@const isPersonSelected = seating.selectedParticipantId === person}
													<div
														class="avatar-wrapper"
														style="--angle: {(360 / table.length) * pIndex}deg;"
													>
														<button
															type="button"
															class="avatar touch-target"
															class:is-active={isPersonActive}
															class:is-selected={isPersonSelected}
															style="border-color: {isPersonActive
																? '#f59e0b'
																: tableColor}; color: {isPersonActive ? '#f59e0b' : tableColor};"
															title="{seating.getParticipantName(person)} ({m.click_to_inspect()})"
															aria-label={seating.getParticipantName(person)}
															onmouseenter={() => seating.setHoveredParticipant(person)}
															onmouseleave={() => seating.setHoveredParticipant(null)}
															onclick={() => seating.toggleSelectedParticipant(person)}
															ondblclick={() => seating.openParticipantModal(person)}
															data-testid="participant-avatar-{person}"
														>
															{seating.getInitials(person)}
														</button>
													</div>
												{/each}
											</div>
										</div>
									</div>
								{/each}
							</div>
						{/each}
					</div>
				</div>
			{/each}
		</div>
	{/if}
</div>

<style>
	.skin-visual {
		display: flex;
		flex-direction: column;
		gap: 1.15rem;
		padding-bottom: 5rem;
	}

	.control-center {
		display: flex;
		flex-direction: column;
		background: var(--bg-card);
		border-radius: 20px;
		border: 1px solid var(--border-color);
		box-shadow: 0 4px 16px rgba(0, 0, 0, 0.06);
		overflow: hidden;
		width: 100%;
		box-sizing: border-box;
	}

	.parameters-row {
		display: flex;
		justify-content: center;
		align-items: stretch;
		gap: 0.85rem;
		flex-wrap: wrap;
		padding: 1.15rem;
	}

	.names-panel-visual {
		background: rgba(0, 0, 0, 0.08);
		border: none;
		border-top: 1px solid var(--border-color);
		border-radius: 0;
		box-shadow: none;
		max-width: none;
		margin: 0;
		width: 100%;
		box-sizing: border-box;
		overflow: hidden;
		transition: all 0.2s ease;
	}

	:global([data-theme='light']) .names-panel-visual {
		background: rgba(0, 0, 0, 0.02);
	}

	.names-panel-visual:hover {
		border-color: var(--border-color);
	}

	.names-visual-summary {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 0.55rem 1.25rem;
		cursor: pointer;
		user-select: none;
		list-style: none;
		transition: background 0.15s ease;
	}

	.names-visual-summary::-webkit-details-marker {
		display: none;
	}

	.names-visual-summary:hover {
		background: rgba(59, 130, 246, 0.06);
	}

	.summary-left {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		flex-wrap: wrap;
	}

	.icon-wrap {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 32px;
		height: 32px;
		border-radius: 10px;
		background: rgba(59, 130, 246, 0.15);
		color: var(--accent-primary);
	}

	.summary-title {
		font-size: 0.95rem;
		font-weight: 700;
		color: var(--text-primary);
		letter-spacing: 0.01em;
	}

	.names-pill {
		font-size: 0.75rem;
		font-weight: 600;
		padding: 3px 8px;
		border-radius: 12px;
		font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
		transition: all 0.2s ease;
	}

	.names-pill.default {
		background: var(--bg-secondary);
		color: var(--text-secondary);
		border: 1px solid var(--border-color);
	}

	.names-pill:not(.default) {
		background: rgba(59, 130, 246, 0.15);
		color: var(--accent-primary);
		border: 1px solid rgba(59, 130, 246, 0.3);
	}

	.names-pill.match {
		background: rgba(34, 197, 94, 0.15);
		color: #22c55e;
		border-color: rgba(34, 197, 94, 0.35);
	}

	.names-pill.over {
		background: rgba(245, 158, 11, 0.15);
		color: #f59e0b;
		border-color: rgba(245, 158, 11, 0.35);
	}

	.summary-right {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		color: var(--text-secondary);
		font-size: 0.85rem;
		font-weight: 600;
	}

	.toggle-text {
		font-size: 0.8rem;
		opacity: 0.85;
	}

	:global(.toggle-chevron) {
		transition: transform 0.25s cubic-bezier(0.16, 1, 0.3, 1);
		opacity: 0.8;
	}

	.names-panel-visual[open] :global(.toggle-chevron) {
		transform: rotate(180deg);
	}

	.names-visual-body {
		padding: 0 1.25rem 1.25rem 1.25rem;
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
	}

	.names-body-toolbar {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 1rem;
		flex-wrap: wrap;
	}

	.names-hint {
		margin: 0;
		font-size: 0.8rem;
		color: var(--text-secondary);
	}

	.btn-clear-names {
		display: inline-flex;
		align-items: center;
		gap: 4px;
		padding: 4px 10px;
		font-size: 0.75rem;
		font-weight: 600;
		border-radius: 8px;
		background: transparent;
		border: 1px solid var(--border-color);
		color: var(--text-secondary);
		cursor: pointer;
		transition: all 0.15s ease;
	}

	.btn-clear-names:hover {
		background: rgba(239, 68, 68, 0.12);
		color: #ef4444;
		border-color: rgba(239, 68, 68, 0.3);
	}

	.visual-textarea {
		width: 100%;
		box-sizing: border-box;
		padding: 0.85rem 1rem;
		border: 1px solid var(--border-color);
		border-radius: 14px;
		font-size: 0.95rem;
		line-height: 1.5;
		font-family: inherit;
		background-color: var(--bg-primary);
		color: var(--text-primary);
		resize: vertical;
		min-height: 90px;
		transition: all 0.2s ease;
	}

	.visual-textarea:focus {
		outline: none;
		border-color: var(--accent-primary);
		box-shadow:
			0 0 0 3px rgba(59, 130, 246, 0.25),
			0 0 16px rgba(59, 130, 246, 0.15);
	}

	.stat-card {
		background: var(--bg-secondary);
		padding: 0.65rem 1rem;
		border-radius: 14px;
		display: flex;
		align-items: center;
		gap: 0.75rem;
		border: 1px solid var(--border-color);
		flex: 1 1 180px;
		min-width: 160px;
		box-sizing: border-box;
	}

	.stat-card .icon {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 36px;
		height: 36px;
		border-radius: 10px;
		background: rgba(37, 99, 235, 0.1);
		color: var(--accent-primary);
		flex-shrink: 0;
	}
	.stat-card .info {
		display: flex;
		flex-direction: column;
		gap: 0.35rem;
		flex: 1;
		min-width: 0;
	}
	.stat-card .label {
		font-size: 0.68rem;
		text-transform: uppercase;
		font-weight: 800;
		color: var(--text-secondary);
		letter-spacing: 0.03em;
	}

	.main-actions {
		display: flex;
		gap: 0.65rem;
		align-items: stretch;
		flex-wrap: nowrap;
	}

	.glow-button {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		gap: 0.5rem;
		height: auto;
		min-height: 44px;
		background: linear-gradient(135deg, var(--accent-primary), #8b5cf6);
		color: white;
		border: none;
		padding: 0 1.4rem;
		border-radius: 12px;
		font-weight: 700;
		font-size: 0.92rem;
		cursor: pointer;
		box-shadow: 0 4px 14px rgba(37, 99, 235, 0.3);
		transition: all 0.2s ease;
		box-sizing: border-box;
		white-space: nowrap;
	}

	.glow-button:hover:not(:disabled) {
		transform: translateY(-2px);
		box-shadow: 0 6px 20px rgba(37, 99, 235, 0.4);
	}

	.glow-button:disabled {
		opacity: 0.6;
		cursor: not-allowed;
	}

	.btn-reset {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		gap: 0.45rem;
		height: auto;
		min-height: 44px;
		background: var(--bg-secondary);
		border: 1px solid var(--border-color);
		color: var(--text-primary);
		padding: 0 1.15rem;
		border-radius: 12px;
		font-weight: 600;
		font-size: 0.88rem;
		cursor: pointer;
		transition: all 0.2s ease;
		box-sizing: border-box;
		white-space: nowrap;
	}

	.btn-reset:hover {
		border-color: var(--accent-primary);
		color: var(--accent-primary);
		transform: translateY(-2px);
	}

	.alert.error {
		background: #fee2e2;
		color: #dc2626;
		padding: 1rem;
		border-radius: 15px;
		text-align: center;
		font-weight: 600;
		border: 2px solid #fecaca;
	}

	.visual-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		background: var(--bg-card);
		padding: 0.65rem 1.25rem;
		border-radius: 16px;
		border: 2px solid var(--accent-primary);
		box-shadow: 0 6px 20px rgba(37, 99, 235, 0.1);
		flex-wrap: wrap;
		gap: 0.85rem;
	}

	.summary-badge {
		display: flex;
		align-items: center;
		gap: 0.75rem;
	}

	.summary-badge .count {
		font-size: 1.65rem;
		font-weight: 900;
		color: var(--accent-primary);
		line-height: 1;
	}

	.summary-badge .desc {
		font-size: 0.85rem;
		font-weight: 700;
		color: var(--text-primary);
		max-width: 220px;
	}

	.search-box {
		display: inline-flex;
		align-items: center;
		gap: 0.45rem;
		height: 38px;
		background: var(--bg-secondary);
		border: 1px solid var(--border-color);
		border-radius: 10px;
		padding: 0 0.75rem;
		flex: 0 1 240px;
		min-width: 140px;
		transition:
			border-color 0.15s ease,
			box-shadow 0.15s ease;
	}

	.search-box:focus-within {
		border-color: var(--accent-primary);
		box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.18);
	}

	.search-icon {
		color: var(--text-secondary);
		flex-shrink: 0;
	}

	.search-input {
		border: none;
		background: transparent;
		color: var(--text-primary);
		font-size: 0.85rem;
		font-family: inherit;
		width: 100%;
		outline: none;
	}

	.clear-search-btn {
		background: transparent;
		border: none;
		color: var(--text-secondary);
		cursor: pointer;
		display: inline-flex;
		align-items: center;
		justify-content: center;
		padding: 2px;
		border-radius: 4px;
	}

	.clear-search-btn:hover {
		color: var(--text-primary);
	}

	.btn-copy-visual {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		gap: 0.45rem;
		height: 38px;
		background: var(--accent-primary);
		color: #ffffff;
		padding: 0 1.25rem;
		border-radius: 10px;
		font-weight: 600;
		font-size: 0.88rem;
		transition: all 0.2s ease;
		border: none;
		cursor: pointer;
		white-space: nowrap;
	}

	.btn-copy-visual:hover {
		background: var(--accent-hover);
		transform: translateY(-1px);
	}

	.btn-copy-visual.copied {
		background: #16a34a;
	}

	.round-section {
		margin-top: 1.5rem;
	}

	.round-section:first-child {
		margin-top: 0.25rem;
	}

	.round-title {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 1.5rem;
		margin-bottom: 1.25rem;
	}

	.round-title h3 {
		font-size: 1.8rem;
		font-weight: 900;
		margin: 0;
		background: linear-gradient(to right, var(--text-primary), var(--accent-primary));
		background-clip: text;
		-webkit-background-clip: text;
		-webkit-text-fill-color: transparent;
	}

	.sparkle {
		font-size: 1.5rem;
		animation: pulse 2s infinite;
	}

	@keyframes pulse {
		0%,
		100% {
			transform: scale(1);
			opacity: 1;
		}
		50% {
			transform: scale(1.3);
			opacity: 0.5;
		}
	}

	.table-gallery {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 2.75rem;
		width: 100%;
	}

	.table-gallery-row {
		display: flex;
		flex-wrap: wrap;
		justify-content: center;
		align-items: center;
		gap: 2.75rem;
		width: 100%;
	}

	.visual-table-container {
		display: flex;
		justify-content: center;
		align-items: center;
		perspective: 1000px;
		width: var(--table-size);
		height: var(--table-size);
	}

	.visual-table {
		position: relative;
		width: var(--table-size);
		height: var(--table-size);
		display: flex;
		justify-content: center;
		align-items: center;
		transition: all 0.3s ease;
	}

	.table-surface {
		width: 104px;
		height: 104px;
		background: radial-gradient(circle at 30% 30%, #ffffff, #e2e8f0);
		border-radius: 50%;
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		box-shadow:
			0 8px 20px rgba(0, 0, 0, 0.12),
			inset 0 -4px 8px rgba(0, 0, 0, 0.05);
		border: 4px solid var(--table-color, var(--accent-primary));
		z-index: 2;
		transition:
			transform 0.3s,
			border-color 0.2s;
		position: absolute;
	}

	.visual-table:hover .table-surface {
		transform: translateZ(20px);
		box-shadow: 0 12px 28px rgba(0, 0, 0, 0.18);
	}

	.table-number {
		font-size: 1.35rem;
		font-weight: 900;
		color: var(--table-color, var(--accent-primary));
		line-height: 1;
	}

	.table-text {
		font-size: 0.58rem;
		font-weight: 800;
		text-transform: uppercase;
		letter-spacing: 0.05em;
		color: var(--text-secondary);
	}

	.table-participants {
		position: absolute;
		width: 100%;
		height: 100%;
		display: flex;
		justify-content: center;
		align-items: center;
	}

	.avatar-wrapper {
		position: absolute;
		width: 46px;
		height: 46px;
		transform: rotate(var(--angle)) translateY(calc(-1 * var(--radius)))
			rotate(calc(-1 * var(--angle)));
		transition: all 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275);
	}

	.avatar {
		width: 100%;
		height: 100%;
		background: white;
		border: 2px solid var(--table-color, var(--accent-primary));
		border-radius: 50%;
		display: flex;
		justify-content: center;
		align-items: center;
		font-weight: 900;
		font-size: 0.9rem;
		color: var(--table-color, var(--accent-primary));
		box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
		transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
		cursor: pointer;
		padding: 0;
		outline: none;
		user-select: none;
	}

	.avatar:hover {
		transform: scale(1.22);
		background: var(--table-color, var(--accent-primary));
		color: #ffffff !important;
		z-index: 10;
		box-shadow: 0 8px 20px rgba(0, 0, 0, 0.25);
	}

	/* Spotlight effects */
	.skin-visual.has-active-participant .avatar:not(.is-active) {
		opacity: 0.35;
		filter: grayscale(40%);
		transform: scale(0.92);
	}

	.skin-visual.has-active-participant .avatar.is-active {
		opacity: 1 !important;
		filter: none !important;
		transform: scale(1.32) !important;
		background: #ffffff !important;
		border: 3px solid #f59e0b !important;
		color: #b45309 !important;
		z-index: 30 !important;
		box-shadow:
			0 0 0 4px rgba(245, 158, 11, 0.35),
			0 8px 24px rgba(245, 158, 11, 0.45) !important;
		animation: avatarPulse 1.6s infinite ease-in-out;
	}

	.avatar.is-selected {
		box-shadow:
			0 0 0 4px rgba(245, 158, 11, 0.5),
			0 8px 25px rgba(245, 158, 11, 0.45) !important;
	}

	@keyframes avatarPulse {
		0%,
		100% {
			transform: scale(1.32);
		}
		50% {
			transform: scale(1.42);
		}
	}

	/* Інші столи стають напів-вимкненими, щоб не відволікати увагу */
	.skin-visual.has-active-participant .visual-table:not(.table-active) .table-surface {
		opacity: 0.35;
		filter: grayscale(40%);
		transform: scale(0.96);
		transition: all 0.25s ease;
	}

	/* Стіл з вибраною людиною зберігає свій власний колір (НЕ перефарбовується в помаранчевий) */
	.visual-table.table-active .table-surface {
		opacity: 1 !important;
		filter: none !important;
		transform: translateZ(10px) scale(1.03);
		box-shadow:
			0 0 0 4px color-mix(in srgb, var(--table-color, var(--accent-primary)) 45%, transparent),
			0 14px 32px rgba(0, 0, 0, 0.25) !important;
	}
</style>
