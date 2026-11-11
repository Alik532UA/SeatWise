<script lang="ts">
	import { browser } from '$app/environment';
	import { page } from '$app/state';
	import { onDestroy } from 'svelte';
	import { Check, Copy } from 'phosphor-svelte';
	import { debugMode } from '$lib/services/debugMode.svelte';
	import { errorLogger } from '$lib/services/errorLogger';
	import { buildLogReport } from '$lib/services/errorReport';

	let copied = $state(false);
	let fallbackReport = $state<string | null>(null);
	let copyTimer: ReturnType<typeof setTimeout> | undefined;

	let errorCount = $state(errorLogger.errorCount);

	$effect(() => errorLogger.subscribe(() => (errorCount = errorLogger.errorCount)));

	const urlDebug = $derived(browser && page.url.searchParams.get('debug') === '1');
	const isVisible = $derived(urlDebug || debugMode.enabled);

	onDestroy(() => {
		if (copyTimer) clearTimeout(copyTimer);
	});

	async function copyReport() {
		const report = buildLogReport();
		try {
			await navigator.clipboard.writeText(report);
			fallbackReport = null;
			copied = true;
			copyTimer = setTimeout(() => (copied = false), 1500);
		} catch (error) {
			errorLogger.logWarning(
				'Не вдалося скопіювати звіт у буфер обміну',
				{ component: 'ServiceBadge' },
				error
			);
			fallbackReport = report;
		}
	}
</script>

{#if fallbackReport}
	<textarea
		class="log-fallback"
		readonly
		value={fallbackReport}
		aria-label="Debug report fallback"
		data-testid="service-badge-report-textarea"
	></textarea>
{/if}

{#if isVisible}
	<button
		type="button"
		class="badge"
		class:badge--has-errors={errorCount > 0}
		class:badge--copied={copied}
		onclick={copyReport}
		aria-label={`Копіювати звіт / Copy report — ${errorLogger.appVersion}`}
		data-testid="app-version-value"
		title={`SeatWise v${errorLogger.appVersion} — Клікніть для копіювання діагностичного логу`}
	>
		{#if copied}
			<Check size={14} weight="bold" class="badge__hint" />
		{:else if errorCount > 0}
			<span class="badge__count">{errorCount > 99 ? '99+' : errorCount}</span>
		{:else}
			<Copy size={12} weight="bold" class="badge__hint" />
		{/if}
		<span class="badge__version">{errorLogger.appVersion}</span>
	</button>
{/if}

<style>
	.log-fallback {
		position: fixed;
		bottom: 60px;
		left: 16px;
		right: 16px;
		height: 40dvh;
		z-index: 9999;
		padding: 10px;
		font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
		font-size: 0.75rem;
		background: #18181b;
		color: #ffffff;
		border: 2px solid #ef4444;
		border-radius: 8px;
		resize: vertical;
		box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4);
	}

	.badge {
		position: fixed;
		bottom: 16px;
		left: 16px;
		z-index: 9999;

		display: inline-flex;
		align-items: center;
		justify-content: center;
		gap: 6px;

		min-height: 32px;
		padding: 0 10px;
		border-radius: 16px;

		background: rgba(24, 24, 27, 0.85);
		backdrop-filter: blur(8px);
		color: #f4f4f5;
		border: 1px solid rgba(255, 255, 255, 0.15);
		cursor: pointer;
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.35);
		transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
		user-select: none;
	}

	.badge:hover {
		transform: scale(1.05);
		border-color: rgba(255, 255, 255, 0.3);
		box-shadow: 0 6px 16px rgba(0, 0, 0, 0.45);
	}

	.badge:active {
		transform: scale(0.98);
	}

	.badge__version {
		font-size: 11px;
		font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
		font-weight: 600;
		line-height: 1;
		white-space: nowrap;
		letter-spacing: 0.02em;
	}

	:global(.badge__hint) {
		opacity: 0.8;
		flex-shrink: 0;
	}

	.badge--has-errors {
		background: #c92a2a;
		color: #ffffff;
		border-color: #7f1d1d;
	}

	.badge--copied {
		background: #15803d;
		color: #ffffff;
		border-color: #166534;
	}

	.badge__count {
		font-weight: 700;
		font-size: 0.75rem;
		line-height: 1;
		padding: 2px 6px;
		border-radius: 8px;
		background: #7f1d1d;
		color: #ffffff;
	}

	@media (hover: none) {
		.badge {
			min-height: 44px;
			padding: 0 14px;
			border-radius: 22px;
		}

		.badge__version {
			font-size: 13px;
		}
	}

	@media print {
		.badge,
		.log-fallback {
			display: none !important;
		}
	}
</style>
