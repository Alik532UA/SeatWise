<script lang="ts">
	import { Minus, Plus } from 'phosphor-svelte';

	interface Props {
		value: number;
		min?: number;
		max?: number;
		step?: number;
		id?: string;
		ariaLabel?: string;
		disabled?: boolean;
	}

	let {
		value = $bindable(0),
		min = 1,
		max = 1000,
		step = 1,
		id = '',
		ariaLabel = '',
		disabled = false
	}: Props = $props();

	function decrement() {
		if (disabled || value <= min) return;
		const next = Math.max(min, value - step);
		value = next;
	}

	function increment() {
		if (disabled || value >= max) return;
		const next = Math.min(max, value + step);
		value = next;
	}

	function handleInput(e: Event & { currentTarget: HTMLInputElement }) {
		const parsed = parseInt(e.currentTarget.value, 10);
		if (!isNaN(parsed)) {
			value = parsed;
		}
	}

	function handleBlur() {
		if (value < min) value = min;
		if (value > max) value = max;
	}
</script>

<div class="number-stepper" class:disabled>
	<button
		type="button"
		class="stepper-btn btn-minus touch-target"
		onclick={decrement}
		disabled={disabled || value <= min}
		aria-label="Зменшити {ariaLabel}"
		title="Зменшити"
	>
		<Minus size={16} weight="bold" />
	</button>

	<input
		type="number"
		{id}
		{min}
		{max}
		{step}
		{disabled}
		aria-label={ariaLabel}
		{value}
		oninput={handleInput}
		onblur={handleBlur}
		class="stepper-input"
	/>

	<button
		type="button"
		class="stepper-btn btn-plus touch-target"
		onclick={increment}
		disabled={disabled || value >= max}
		aria-label="Збільшити {ariaLabel}"
		title="Збільшити"
	>
		<Plus size={16} weight="bold" />
	</button>
</div>

<style>
	.number-stepper {
		display: inline-flex;
		align-items: stretch;
		border: 1px solid var(--border-color);
		border-radius: 10px;
		background: var(--bg-primary);
		overflow: hidden;
		width: 100%;
		max-width: 100%;
		box-sizing: border-box;
		transition:
			border-color 0.15s ease,
			box-shadow 0.15s ease;
	}

	.number-stepper:focus-within {
		border-color: var(--accent-primary);
		box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.18);
	}

	.stepper-btn {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 44px;
		min-width: 44px;
		height: 44px;
		background: var(--bg-secondary);
		color: var(--text-primary);
		border: none;
		cursor: pointer;
		user-select: none;
		transition:
			background-color 0.15s ease,
			color 0.15s ease;
		padding: 0;
	}

	.stepper-btn:hover:not(:disabled) {
		background-color: var(--accent-primary);
		color: #ffffff;
	}

	.stepper-btn:active:not(:disabled) {
		transform: scale(0.95);
	}

	.stepper-btn:disabled {
		opacity: 0.35;
		cursor: not-allowed;
	}

	.stepper-input {
		flex: 1;
		min-width: 0;
		text-align: center;
		border: none;
		border-left: 1px solid var(--border-color);
		border-right: 1px solid var(--border-color);
		background: transparent;
		color: var(--text-primary);
		font-size: 1.05rem;
		font-weight: 600;
		padding: 0.5rem;
		margin: 0;
		border-radius: 0;
		box-sizing: border-box;
		-moz-appearance: textfield;
		appearance: textfield;
	}

	.stepper-input::-webkit-outer-spin-button,
	.stepper-input::-webkit-inner-spin-button {
		-webkit-appearance: none;
		margin: 0;
	}

	.stepper-input:focus {
		outline: none;
	}

	.number-stepper.disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}
</style>
