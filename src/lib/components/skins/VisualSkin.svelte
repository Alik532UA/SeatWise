<script lang="ts">
	import { getContext } from 'svelte';
	import type { SeatingController } from '$lib/controllers/SeatingController.svelte';
	import * as m from '$lib/paraglide/messages';

	const seating = getContext<SeatingController>('seating');
</script>

<div class="skin-visual">
	<div class="control-center">
		<div class="stat-card">
			<span class="icon">👥</span>
			<div class="info">
				<span class="label">{m.total_people()}</span>
				<input type="number" bind:value={seating.totalPeople} min="2" />
			</div>
		</div>
		<div class="stat-card">
			<span class="icon">🪑</span>
			<div class="info">
				<span class="label">{m.table_count()}</span>
				<input type="number" bind:value={seating.tableCount} min="1" />
			</div>
		</div>
		<div class="stat-card">
			<span class="icon">🍱</span>
			<div class="info">
				<span class="label">{m.table_capacity()}</span>
				<input type="number" bind:value={seating.tableCapacity} min="2" />
			</div>
		</div>

		<div class="main-actions">
			<button
				class="glow-button"
				onclick={() => seating.calculate()}
				disabled={seating.isCalculating}
			>
				{seating.isCalculating ? m.calculating() : m.calculate_button()}
			</button>
			<button class="btn-reset" onclick={() => seating.reset()}>{m.reset()}</button>
		</div>
	</div>

	<section class="names-panel-visual">
		<label for="namesInput">{m.participants_list()}:</label>
		<textarea
			id="namesInput"
			bind:value={seating.namesInput}
			placeholder={m.participants_placeholder()}
			rows="3"
		></textarea>
	</section>

	{#if seating.errorMessage}
		<div class="alert error">{seating.errorMessage}</div>
	{/if}

	{#if seating.rounds.length > 0}
		<div class="visual-header">
			<div class="summary-badge">
				<span class="count">{seating.rounds.length}</span>
				<span class="desc">{m.rounds_needed()}</span>
			</div>
			<button
				class="btn-copy-visual"
				class:copied={seating.isCopied}
				onclick={() => seating.copyToClipboard()}
			>
				{seating.isCopied ? m.copied() : m.copy_button()}
			</button>
		</div>

		<div class="visual-rounds">
			{#each seating.rounds as round, rIndex}
				<div class="round-section">
					<div class="round-title">
						<span class="sparkle">✨</span>
						<h3>{m.round()} {rIndex + 1}</h3>
						<span class="sparkle">✨</span>
					</div>

					<div class="table-gallery">
						{#each round as table, tIndex}
							{#if table.length > 0}
								{@const radius = Math.max(90, table.length * 7.5)}
								{@const containerSize = radius * 2 + 80}
								<div
									class="visual-table-container"
									style="--radius: {radius}px; --table-size: {containerSize}px;"
								>
									<div class="visual-table">
										<div class="table-surface">
											<span class="table-number">#{tIndex + 1}</span>
											<span class="table-text">{m.table()}</span>
										</div>

										<div class="table-participants">
											{#each table as person, pIndex}
												<div
													class="avatar-wrapper"
													style="--angle: {(360 / table.length) * pIndex}deg;"
												>
													<div class="avatar" title={seating.getParticipantName(person)}>
														{seating.getInitials(person)}
													</div>
												</div>
											{/each}
										</div>
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
	.skin-visual {
		display: flex;
		flex-direction: column;
		gap: 2rem;
		padding-bottom: 5rem;
	}

	.control-center {
		display: flex;
		justify-content: center;
		gap: 1rem;
		flex-wrap: wrap;
		background: rgba(255, 255, 255, 0.05);
		padding: 1.5rem;
		border-radius: 30px;
		backdrop-filter: blur(10px);
	}

	.names-panel-visual {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
		background: var(--bg-card);
		padding: 1rem 1.5rem;
		border-radius: 20px;
		box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
		border: 1px solid var(--border-color);
		max-width: 800px;
		margin: 0 auto;
		width: 100%;
	}

	.names-panel-visual label {
		font-size: 0.8rem;
		font-weight: 700;
		color: var(--text-secondary);
		text-transform: uppercase;
	}

	textarea {
		width: 100%;
		padding: 0.75rem;
		border: 1px solid var(--border-color);
		border-radius: 12px;
		font-size: 0.9rem;
		background-color: var(--bg-primary);
		color: var(--text-primary);
		resize: vertical;
		font-family: inherit;
	}

	.stat-card {
		background: var(--bg-card);
		padding: 0.75rem 1.25rem;
		border-radius: 20px;
		display: flex;
		align-items: center;
		gap: 0.75rem;
		box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
		border: 1px solid var(--border-color);
		flex: 1;
		min-width: 150px;
	}

	.stat-card .icon {
		font-size: 1.5rem;
	}
	.stat-card .info {
		display: flex;
		flex-direction: column;
	}
	.stat-card .label {
		font-size: 0.65rem;
		text-transform: uppercase;
		font-weight: 800;
		color: var(--text-secondary);
	}

	.stat-card input {
		border: none;
		background: transparent;
		font-size: 1.2rem;
		font-weight: 900;
		color: var(--accent-primary);
		width: 50px;
	}

	.main-actions {
		display: flex;
		gap: 0.75rem;
		align-items: center;
	}

	.glow-button {
		background: linear-gradient(135deg, var(--accent-primary), #8b5cf6);
		color: white;
		border: none;
		padding: 0.75rem 1.5rem;
		border-radius: 50px;
		font-weight: 900;
		font-size: 1rem;
		cursor: pointer;
		box-shadow: 0 10px 20px -5px rgba(37, 99, 235, 0.5);
		transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
	}

	.glow-button:hover:not(:disabled) {
		transform: translateY(-4px) scale(1.05);
		box-shadow: 0 15px 25px -5px rgba(37, 99, 235, 0.6);
	}

	.glow-button:disabled {
		opacity: 0.6;
		cursor: not-allowed;
	}

	.btn-reset {
		background: transparent;
		border: 2px solid var(--border-color);
		color: var(--text-secondary);
		padding: 0.5rem 1.25rem;
		border-radius: 50px;
		font-weight: 700;
		cursor: pointer;
		transition: all 0.2s;
	}

	.btn-reset:hover {
		border-color: var(--accent-primary);
		color: var(--accent-primary);
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
		padding: 1rem 2rem;
		border-radius: 25px;
		border: 2px solid var(--accent-primary);
		box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
	}

	.summary-badge {
		display: flex;
		align-items: center;
		gap: 1rem;
	}

	.summary-badge .count {
		font-size: 2rem;
		font-weight: 900;
		color: var(--accent-primary);
		line-height: 1;
	}

	.summary-badge .desc {
		font-size: 0.9rem;
		font-weight: 700;
		color: var(--text-primary);
		max-width: 200px;
	}

	.btn-copy-visual {
		background: var(--accent-primary);
		color: white;
		padding: 0.75rem 1.5rem;
		border-radius: 15px;
		font-weight: 800;
		transition: all 0.3s;
		border: none;
		cursor: pointer;
	}

	.btn-copy-visual.copied {
		background: #10b981;
	}

	.round-section {
		margin-top: 3rem;
	}

	.round-title {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 1.5rem;
		margin-bottom: 2rem;
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
		flex-wrap: wrap;
		justify-content: center;
		gap: 4rem;
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
		width: 120px;
		height: 120px;
		background: radial-gradient(circle at 30% 30%, #ffffff, #e2e8f0);
		border-radius: 50%;
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		box-shadow:
			0 10px 25px rgba(0, 0, 0, 0.1),
			inset 0 -5px 10px rgba(0, 0, 0, 0.05);
		border: 4px solid var(--accent-primary);
		z-index: 2;
		transition: transform 0.3s;
		position: absolute;
	}

	.visual-table:hover .table-surface {
		transform: translateZ(20px);
		box-shadow: 0 15px 35px rgba(0, 0, 0, 0.15);
	}

	.table-number {
		font-size: 1.5rem;
		font-weight: 900;
		color: var(--accent-primary);
		line-height: 1;
	}

	.table-text {
		font-size: 0.6rem;
		font-weight: 800;
		text-transform: uppercase;
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
		width: 40px;
		height: 40px;
		transform: rotate(var(--angle)) translateY(calc(-1 * var(--radius)))
			rotate(calc(-1 * var(--angle)));
		transition: all 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275);
	}

	.avatar {
		width: 100%;
		height: 100%;
		background: white;
		border: 2px solid var(--accent-primary);
		border-radius: 50%;
		display: flex;
		justify-content: center;
		align-items: center;
		font-weight: 900;
		font-size: 0.8rem;
		color: var(--accent-primary);
		box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
		transition: all 0.3s;
	}

	.avatar:hover {
		transform: scale(1.3);
		background: var(--accent-primary);
		color: white;
		z-index: 10;
		box-shadow: 0 8px 20px rgba(37, 99, 235, 0.4);
	}
</style>
