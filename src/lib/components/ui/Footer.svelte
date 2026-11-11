<script lang="ts">
	import * as m from '$lib/paraglide/messages';
	import { Sparkle, ArrowSquareOut } from 'phosphor-svelte';
</script>

<footer class="main-footer" data-testid="main-footer">
	<div class="footer-container">
		<div class="footer-left">
			<span class="copyright">SeatWise © {new Date().getFullYear()}</span>
			<span class="divider">•</span>
			<span class="engine-note">Galois Field GF(8) Networking Seating</span>
		</div>

		<div class="footer-right">
			<a
				href="https://alik532ua.github.io/DigitalWorkshop/"
				target="_blank"
				rel="noopener noreferrer"
				class="footer-order-btn touch-target"
				data-testid="footer-order-cta-btn"
				title={m.order_cta()}
			>
				<Sparkle size={16} weight="bold" aria-hidden="true" />
				<span>{m.order_cta()}</span>
				<ArrowSquareOut size={14} weight="bold" aria-hidden="true" />
			</a>
		</div>
	</div>
</footer>

<style>
	.main-footer {
		margin-top: auto;
		background-color: var(--bg-secondary);
		border-top: 1px solid var(--border-color);
		padding: 1.25rem 2rem;
		transition:
			background-color 0.2s,
			border-color 0.2s;
	}

	.footer-container {
		max-width: 1400px;
		margin: 0 auto;
		display: flex;
		justify-content: space-between;
		align-items: center;
		flex-wrap: wrap;
		gap: 1rem;
	}

	.footer-left {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		font-size: 0.85rem;
		color: var(--text-secondary);
		flex-wrap: wrap;
	}

	.divider {
		opacity: 0.5;
	}

	.footer-right {
		display: flex;
		align-items: center;
	}

	.footer-order-btn {
		display: inline-flex;
		align-items: center;
		gap: 0.45rem;
		height: 38px;
		padding: 0 1rem;
		box-sizing: border-box;
		background-color: var(--bg-card);
		color: var(--text-primary);
		border: 1px solid var(--border-color);
		font-weight: 600;
		font-size: 0.82rem;
		border-radius: 8px;
		text-decoration: none;
		transition:
			border-color 0.15s ease,
			color 0.15s ease,
			box-shadow 0.15s ease,
			transform 0.15s ease;
		white-space: nowrap;
	}

	.footer-order-btn:hover {
		color: var(--accent-primary);
		border-color: var(--accent-primary);
		transform: translateY(-1px);
		box-shadow: 0 2px 6px rgba(0, 0, 0, 0.08);
	}

	.footer-order-btn:active {
		transform: translateY(0);
	}

	@media (max-width: 768px) {
		.footer-container {
			flex-direction: column;
			text-align: center;
			justify-content: center;
		}

		.footer-left {
			justify-content: center;
		}
	}
</style>
