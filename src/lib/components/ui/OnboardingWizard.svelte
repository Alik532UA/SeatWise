<script lang="ts">
	import { getContext } from 'svelte';
	import type { SeatingController } from '$lib/controllers/SeatingController.svelte';
	import type { UIController } from '$lib/controllers/UIController.svelte';
	import * as m from '$lib/paraglide/messages';
	import NumberStepper from './NumberStepper.svelte';
	import {
		Users,
		Armchair,
		UsersFour,
		Sparkle,
		ArrowRight,
		ArrowLeft,
		CheckCircle,
		WarningCircle,
		X
	} from 'phosphor-svelte';

	const seating = getContext<SeatingController>('seating');
	const ui = getContext<UIController>('ui');

	let step = $state(1);

	const minSeatsNeeded = $derived(
		Math.max(2, Math.ceil(seating.totalPeople / Math.max(1, seating.tableCount)))
	);
	const totalCapacity = $derived(seating.tableCount * seating.tableCapacity);
	const isCapacitySufficient = $derived(totalCapacity >= seating.totalPeople);

	function setQuickPeople(val: number) {
		seating.totalPeople = val;
		// Розумний дефолт столів і місць
		if (val <= 16) {
			seating.tableCount = 4;
			seating.tableCapacity = 4;
		} else if (val <= 25) {
			seating.tableCount = 5;
			seating.tableCapacity = 5;
		} else if (val <= 49) {
			seating.tableCount = 7;
			seating.tableCapacity = 7;
		} else {
			seating.tableCount = 8;
			seating.tableCapacity = 8;
		}
	}

	function fixCapacity() {
		seating.tableCapacity = minSeatsNeeded;
	}

	function nextStep() {
		if (step < 3) {
			step += 1;
		} else {
			finish();
		}
	}

	function prevStep() {
		if (step > 1) {
			step -= 1;
		}
	}

	function finish() {
		if (!isCapacitySufficient) {
			seating.tableCapacity = minSeatsNeeded;
		}
		seating.calculate();
		ui.completeOnboarding();
	}

	function skip() {
		ui.completeOnboarding();
	}
</script>

{#if ui.isOnboardingOpen}
	<div class="wizard-overlay" role="dialog" aria-modal="true" aria-labelledby="wizard-title">
		<div class="wizard-card">
			<header class="wizard-header">
				<div class="header-badge">
					<Sparkle size={16} weight="fill" />
					<span>{m.onboarding_title()}</span>
				</div>
				<button
					type="button"
					class="close-btn touch-target"
					onclick={skip}
					aria-label="Закрити майстер"
				>
					<X size={18} weight="bold" />
				</button>
			</header>

			<!-- Progress steps -->
			<div class="step-indicator" aria-label="Покроковий процес">
				<div class="step-pill" class:active={step === 1} class:done={step > 1}>
					<span class="step-num">1</span>
					<span class="step-text">Люди</span>
				</div>
				<div class="step-line" class:done={step > 1}></div>
				<div class="step-pill" class:active={step === 2} class:done={step > 2}>
					<span class="step-num">2</span>
					<span class="step-text">Столи</span>
				</div>
				<div class="step-line" class:done={step > 2}></div>
				<div class="step-pill" class:active={step === 3}>
					<span class="step-num">3</span>
					<span class="step-text">Місця</span>
				</div>
			</div>

			<!-- Step 1: People -->
			{#if step === 1}
				<div class="step-content">
					<div class="step-icon-badge">
						<Users size={32} weight="duotone" />
					</div>
					<h2 id="wizard-title" class="step-title">{m.step_people_title()}</h2>
					<p class="step-desc">{m.step_people_desc()}</p>

					<div class="stepper-wrapper">
						<NumberStepper
							bind:value={seating.totalPeople}
							min={2}
							max={200}
							id="wizard-people"
							ariaLabel="Кількість людей"
						/>
					</div>

					<div class="quick-chips">
						<span class="chips-label">Популярні формати:</span>
						<div class="chips-list">
							{#each [16, 20, 25, 36, 49, 64] as num}
								<button
									type="button"
									class="chip-btn"
									class:selected={seating.totalPeople === num}
									onclick={() => setQuickPeople(num)}
								>
									{num} осіб
								</button>
							{/each}
						</div>
					</div>
				</div>
			{:else if step === 2}
				<!-- Step 2: Tables -->
				<div class="step-content">
					<div class="step-icon-badge">
						<Armchair size={32} weight="duotone" />
					</div>
					<h2 id="wizard-title" class="step-title">{m.step_tables_title()}</h2>
					<p class="step-desc">{m.step_tables_desc()}</p>

					<div class="stepper-wrapper">
						<NumberStepper
							bind:value={seating.tableCount}
							min={1}
							max={50}
							id="wizard-tables"
							ariaLabel="Кількість столів"
						/>
					</div>

					<div class="hint-box">
						<span class="hint-title">Порада для нетворкінгу:</span>
						<p>
							Для <strong>{seating.totalPeople} учасників</strong> зазвичай чудово підходить
							<strong>{Math.ceil(Math.sqrt(seating.totalPeople))}</strong> або
							<strong>{Math.max(4, Math.round(seating.totalPeople / 5))}</strong> столів.
						</p>
					</div>
				</div>
			{:else if step === 3}
				<!-- Step 3: Capacity -->
				<div class="step-content">
					<div class="step-icon-badge">
						<UsersFour size={32} weight="duotone" />
					</div>
					<h2 id="wizard-title" class="step-title">{m.step_capacity_title()}</h2>
					<p class="step-desc">{m.step_capacity_desc()}</p>

					<div class="stepper-wrapper">
						<NumberStepper
							bind:value={seating.tableCapacity}
							min={2}
							max={30}
							id="wizard-capacity"
							ariaLabel="Місць за столом"
						/>
					</div>

					<div
						class="capacity-status"
						class:valid={isCapacitySufficient}
						class:invalid={!isCapacitySufficient}
					>
						{#if isCapacitySufficient}
							<div class="status-msg success">
								<CheckCircle size={20} weight="fill" />
								<span>{m.capacity_ok({ total: totalCapacity, people: seating.totalPeople })}</span>
							</div>
						{:else}
							<div class="status-msg warning">
								<WarningCircle size={20} weight="fill" />
								<span>
									{m.capacity_warning({
										total: totalCapacity,
										people: seating.totalPeople,
										min: minSeatsNeeded
									})}
								</span>
							</div>
							<button type="button" class="fix-btn" onclick={fixCapacity}>
								Встановити {minSeatsNeeded} місць
							</button>
						{/if}
					</div>
				</div>
			{/if}

			<!-- Wizard footer actions -->
			<footer class="wizard-footer">
				<div class="nav-actions">
					{#if step > 1}
						<button type="button" class="btn-prev" onclick={prevStep}>
							<ArrowLeft size={16} weight="bold" />
							<span>{m.step_prev()}</span>
						</button>
					{:else}
						<button type="button" class="btn-skip" onclick={skip}>
							{m.step_skip()}
						</button>
					{/if}

					<button type="button" class="btn-next" onclick={nextStep}>
						<span>{step === 3 ? m.step_finish() : m.step_next()}</span>
						{#if step === 3}
							<Sparkle size={18} weight="bold" />
						{:else}
							<ArrowRight size={18} weight="bold" />
						{/if}
					</button>
				</div>
			</footer>
		</div>
	</div>
{/if}

<style>
	.wizard-overlay {
		position: fixed;
		inset: 0;
		background: rgba(0, 0, 0, 0.65);
		backdrop-filter: blur(4px);
		z-index: 1000;
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 1rem;
		box-sizing: border-box;
	}

	.wizard-card {
		background: var(--bg-card);
		border: 1px solid var(--border-color);
		border-radius: 16px;
		width: 100%;
		max-width: 520px;
		max-height: calc(100dvh - 2rem);
		display: flex;
		flex-direction: column;
		box-shadow: 0 20px 40px rgba(0, 0, 0, 0.25);
		box-sizing: border-box;
		overflow: hidden;
	}

	.wizard-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 1.25rem 1.5rem;
		border-bottom: 1px solid var(--border-color);
	}

	.header-badge {
		display: inline-flex;
		align-items: center;
		gap: 0.5rem;
		font-weight: 700;
		font-size: 0.95rem;
		color: var(--accent-primary);
	}

	.close-btn {
		background: transparent;
		border: none;
		color: var(--text-secondary);
		cursor: pointer;
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 36px;
		height: 36px;
		border-radius: 8px;
		transition:
			background-color 0.15s,
			color 0.15s;
	}

	.close-btn:hover {
		background: var(--bg-secondary);
		color: var(--text-primary);
	}

	.step-indicator {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 0.5rem;
		padding: 1rem 1.5rem 0.5rem;
	}

	.step-pill {
		display: flex;
		align-items: center;
		gap: 0.4rem;
		font-size: 0.85rem;
		font-weight: 600;
		color: var(--text-secondary);
		padding: 0.3rem 0.75rem;
		border-radius: 20px;
		background: var(--bg-secondary);
		transition: all 0.2s ease;
	}

	.step-pill.active {
		background: var(--accent-primary);
		color: #ffffff;
	}

	.step-pill.done {
		color: var(--accent-primary);
		background: rgba(37, 99, 235, 0.1);
	}

	.step-num {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 18px;
		height: 18px;
		border-radius: 50%;
		font-size: 0.75rem;
		font-weight: 700;
	}

	.step-line {
		flex: 1;
		max-width: 30px;
		height: 2px;
		background: var(--border-color);
		transition: background-color 0.2s ease;
	}

	.step-line.done {
		background: var(--accent-primary);
	}

	.step-content {
		padding: 1.5rem;
		display: flex;
		flex-direction: column;
		align-items: center;
		text-align: center;
		overflow-y: auto;
		min-height: 0;
	}

	.step-icon-badge {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 64px;
		height: 64px;
		border-radius: 16px;
		background: rgba(37, 99, 235, 0.1);
		color: var(--accent-primary);
		margin-bottom: 1rem;
	}

	.step-title {
		margin: 0 0 0.5rem;
		font-size: 1.25rem;
		font-weight: 700;
		color: var(--text-primary);
	}

	.step-desc {
		margin: 0 0 1.5rem;
		font-size: 0.9rem;
		color: var(--text-secondary);
		max-width: 380px;
	}

	.stepper-wrapper {
		width: 100%;
		max-width: 280px;
		margin-bottom: 1.5rem;
	}

	.quick-chips {
		display: flex;
		flex-direction: column;
		gap: 0.6rem;
		width: 100%;
		max-width: 400px;
	}

	.chips-label {
		font-size: 0.8rem;
		font-weight: 600;
		color: var(--text-secondary);
	}

	.chips-list {
		display: flex;
		flex-wrap: wrap;
		gap: 0.5rem;
		justify-content: center;
	}

	.chip-btn {
		background: var(--bg-secondary);
		color: var(--text-primary);
		border: 1px solid var(--border-color);
		padding: 0.45rem 0.85rem;
		border-radius: 8px;
		font-size: 0.85rem;
		font-weight: 600;
		cursor: pointer;
		transition: all 0.15s ease;
	}

	.chip-btn:hover {
		border-color: var(--accent-primary);
		color: var(--accent-primary);
	}

	.chip-btn.selected {
		background: var(--accent-primary);
		color: #ffffff;
		border-color: var(--accent-primary);
	}

	.hint-box {
		background: var(--bg-secondary);
		border: 1px solid var(--border-color);
		border-radius: 10px;
		padding: 0.85rem 1.15rem;
		font-size: 0.85rem;
		color: var(--text-secondary);
		max-width: 380px;
		text-align: left;
	}

	.hint-title {
		font-weight: 700;
		color: var(--text-primary);
		display: block;
		margin-bottom: 0.25rem;
	}

	.hint-box p {
		margin: 0;
	}

	.capacity-status {
		width: 100%;
		max-width: 400px;
		padding: 0.85rem;
		border-radius: 10px;
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
		align-items: center;
		box-sizing: border-box;
	}

	.capacity-status.valid {
		background: rgba(37, 99, 235, 0.08);
		border: 1px solid rgba(37, 99, 235, 0.25);
	}

	.capacity-status.invalid {
		background: var(--error-bg);
		border: 1px solid var(--error-border);
	}

	.status-msg {
		display: inline-flex;
		align-items: center;
		gap: 0.5rem;
		font-size: 0.85rem;
		font-weight: 600;
	}

	.status-msg.success {
		color: var(--accent-primary);
	}

	.status-msg.warning {
		color: var(--error-text);
	}

	.fix-btn {
		background: var(--accent-primary);
		color: #ffffff;
		border: none;
		padding: 0.4rem 0.85rem;
		border-radius: 6px;
		font-size: 0.8rem;
		font-weight: 600;
		cursor: pointer;
	}

	.wizard-footer {
		padding: 1.25rem 1.5rem;
		border-top: 1px solid var(--border-color);
		background: var(--bg-secondary);
	}

	.nav-actions {
		display: flex;
		justify-content: space-between;
		align-items: center;
		gap: 1rem;
		flex-wrap: wrap;
	}

	.btn-prev,
	.btn-skip {
		display: inline-flex;
		align-items: center;
		gap: 0.4rem;
		background: transparent;
		border: 1px solid var(--border-color);
		color: var(--text-primary);
		font-size: 0.9rem;
		font-weight: 600;
		padding: 0.6rem 1.1rem;
		border-radius: 8px;
		cursor: pointer;
		transition: all 0.15s ease;
	}

	.btn-prev:hover,
	.btn-skip:hover {
		border-color: var(--accent-primary);
		color: var(--accent-primary);
	}

	.btn-next {
		display: inline-flex;
		align-items: center;
		gap: 0.5rem;
		background: var(--accent-primary);
		color: #ffffff;
		border: 1px solid transparent;
		font-size: 0.92rem;
		font-weight: 700;
		padding: 0.65rem 1.35rem;
		border-radius: 8px;
		cursor: pointer;
		transition: all 0.15s ease;
		margin-left: auto;
	}

	.btn-next:hover {
		background: var(--accent-hover);
		transform: translateY(-1px);
	}

	@media (max-width: 480px) {
		.wizard-card {
			max-height: 95dvh;
		}

		.step-pill .step-text {
			display: none;
		}

		.nav-actions {
			flex-direction: column-reverse;
		}

		.btn-next,
		.btn-prev,
		.btn-skip {
			width: 100%;
			justify-content: center;
		}
	}
</style>
