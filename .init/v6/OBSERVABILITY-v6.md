---
Назва: Спостережуваність (Observability) — Sentry, Web Vitals, RUM, Health checks
Версія: 6.0
Фреймворк: SvelteKit 2 + Svelte 5 (Runes)
Опис: Production-моніторинг — error tracking, RUM, Core Web Vitals, uptime, health endpoints, alerting. Локальний дебагінг — див. DEBUGGING-v6.md
---

# Спостережуваність (Observability)

Цей документ покриває **production-моніторинг**: як ми бачимо помилки, продуктивність та доступність сервісу **після релізу**.

Розмежування:

- **Локальний дебагінг та `logService`** (in-app, dev-tooling) — див. [DEBUGGING-v6.md](DEBUGGING-v6.md).
- **Доменні класи помилок та обробка** — див. [ERROR-HANDLING-v6.md](ERROR-HANDLING-v6.md).
- **PII у логах** (що **не можна** надсилати у Sentry) — див. [SECURITY-v6.md § 10](SECURITY-v6.md).

---

## 🚫 ЖОРСТКІ ОБМЕЖЕННЯ (ANTI-PATTERNS)

| Рівень       | Заборона                                                          | Правильна альтернатива                                                            |
| ------------ | ----------------------------------------------------------------- | --------------------------------------------------------------------------------- |
| **CRITICAL** | Production без error tracking (нікуди не падають exceptions)      | Sentry / GlitchTip / Bugsnag з обов'язковим DSN у env                             |
| **CRITICAL** | Надсилання PII у телеметрію (паролі, токени, повні email)         | `beforeSend` хук, що маскує/відкидає поля (див. [SECURITY-v6.md](SECURITY-v6.md)) |
| **CRITICAL** | Sentry DSN у `$env/static/public` без rate limiting / sample rate | `tracesSampleRate < 1.0`, `replaysSessionSampleRate < 0.1`                        |
| **HIGH**     | Відсутність health endpoint для uptime monitoring                 | `+server.ts` `/api/health` з `{ status: 'ok', version, uptime }`                  |
| **HIGH**     | Релізи без source maps на сервері моніторингу                     | Завантажити source maps у Sentry/аналог; **не публікувати** їх на CDN             |
| **HIGH**     | Жодних alerts на критичні метрики (error rate, p95 latency)       | Налаштовані алерти у Sentry / Grafana / PagerDuty                                 |

---

## 1. Error Tracking (Sentry / GlitchTip)

### 1.1 Інтеграція з SvelteKit

- [ ] Встановлено `@sentry/sveltekit` (або `@glitchtip/sveltekit` — opensource альтернатива).
- [ ] Ініціалізація у `hooks.client.ts` та `hooks.server.ts`:

```typescript
// hooks.client.ts
import * as Sentry from '@sentry/sveltekit';
import { handleErrorWithSentry } from '@sentry/sveltekit';
import { PUBLIC_SENTRY_DSN } from '$env/static/public';
import { dev } from '$app/environment';

Sentry.init({
	dsn: PUBLIC_SENTRY_DSN,
	enabled: !dev,
	tracesSampleRate: 0.1, // 10% транзакцій
	replaysSessionSampleRate: 0.0, // session replay вимкнено за замовчуванням
	replaysOnErrorSampleRate: 1.0, // 100% replay коли є помилка
	release: __APP_VERSION__, // build-time injection (див. VERSIONING-v6.md)
	environment: import.meta.env.MODE,
	beforeSend(event, hint) {
		return scrubPII(event); // власна функція маскування
	}
});

export const handleError = handleErrorWithSentry();
```

### 1.2 Source Maps

- [ ] У CI генеруються source maps (`build` із `sourcemap: true` у Vite).
- [ ] Source maps **завантажуються в Sentry** через CLI у CI-кроці після `build`, **не публікуються** на CDN:

```yaml
- run: npx @sentry/cli sourcemaps upload --release=$VERSION ./build
```

- [ ] Заголовок `SourceMap` НЕ виставляється для прод-бандлів.

### 1.3 Releases та deploy tracking

- [ ] Кожен deploy реєструється як новий **release** у Sentry із номером версії з `package.json` (див. [VERSIONING-v6.md](VERSIONING-v6.md)).
- [ ] Регресії автоматично пов'язуються з release-ом, у якому з'явилися.

### 1.4 Маскування PII (`beforeSend`)

- [ ] Реалізовано scrubber, що видаляє PII перед відправкою:

```typescript
function scrubPII(event: Sentry.Event): Sentry.Event | null {
	if (event.request?.cookies) delete event.request.cookies;
	if (event.request?.headers) {
		delete event.request.headers['authorization'];
		delete event.request.headers['cookie'];
	}
	if (event.user) {
		// лишаємо лише id; видаляємо email, ip
		event.user = { id: event.user.id };
	}
	return event;
}
```

- [ ] У Sentry Project Settings увімкнено «**Data Scrubbing**» + «**Scrub IP Addresses**».

---

## 2. Real User Monitoring (RUM) та Core Web Vitals

### 2.1 Збір Core Web Vitals

- [ ] У `+layout.svelte` (або у standalone модулі) встановлено `web-vitals`:

```typescript
import { onCLS, onINP, onLCP, onFCP, onTTFB } from 'web-vitals';

function report(metric) {
	// Sentry, Plausible, GA4 — куди завгодно
	fetch('/api/metrics', {
		method: 'POST',
		body: JSON.stringify({ name: metric.name, value: metric.value, id: metric.id }),
		keepalive: true
	});
}

onCLS(report);
onINP(report); // INP замінив FID у 2024
onLCP(report);
onFCP(report);
onTTFB(report);
```

- [ ] Цільові пороги (Google «Good» thresholds):
  - **LCP** ≤ 2.5s
  - **INP** ≤ 200ms
  - **CLS** ≤ 0.1
  - **FCP** ≤ 1.8s
  - **TTFB** ≤ 800ms

### 2.2 Lighthouse CI у GitHub Actions

- [ ] Pull Request тригерить Lighthouse CI з порогами:

```yaml
- run: npx @lhci/cli autorun
```

з `lighthouserc.json`:

```json
{
	"ci": {
		"assert": {
			"assertions": {
				"categories:performance": ["error", { "minScore": 0.9 }],
				"categories:accessibility": ["error", { "minScore": 0.95 }],
				"categories:best-practices": ["error", { "minScore": 0.9 }],
				"categories:seo": ["error", { "minScore": 0.9 }]
			}
		}
	}
}
```

### 2.3 Privacy-friendly analytics

- [ ] Аналітика — **без cookies та fingerprinting**: Plausible, Umami, Cloudflare Web Analytics або self-hosted.
- [ ] **Заборонено** Google Analytics без явної згоди (GDPR Art. 6).
- [ ] У RUM-payload відсутні: повні URL з токенами/email-ами, `User-Agent` із серійниками пристроїв.

---

## 3. Server-side observability

### 3.1 Health endpoint

- [ ] `src/routes/api/health/+server.ts`:

```typescript
import { json } from '@sveltejs/kit';

const STARTED_AT = Date.now();

export const GET = async () =>
	json({
		status: 'ok',
		version: __APP_VERSION__,
		uptime: Math.floor((Date.now() - STARTED_AT) / 1000),
		timestamp: new Date().toISOString()
	});
```

- [ ] Endpoint **не вимагає авторизації** (для probe-ів) і не повертає чутливих даних.
- [ ] Опціональний `/api/health/ready` — перевіряє доступність БД/Redis (для Kubernetes readiness probes).

### 3.2 Structured logging на сервері

- [ ] У `hooks.server.ts` глобальний middleware пише структурований JSON (`pino` / `winston`):

```typescript
import { handle } from '@sveltejs/kit';
import pino from 'pino';
const logger = pino({ level: process.env.LOG_LEVEL ?? 'info' });

export const handle: Handle = async ({ event, resolve }) => {
	const start = Date.now();
	const response = await resolve(event);
	logger.info({
		method: event.request.method,
		path: event.url.pathname,
		status: response.status,
		durationMs: Date.now() - start,
		// requestId з cookie/header — для кореляції
		requestId: event.locals.requestId
	});
	return response;
};
```

- [ ] **Жодних** `console.log` у production server-side коді — лише структурований logger.

### 3.3 Trace ID / Request ID propagation

- [ ] Кожен запит отримує унікальний `requestId` (UUID) у `hooks.server.ts`.
- [ ] `requestId` додається у заголовок відповіді (`X-Request-ID`) і у всі server-side логи цього запиту.
- [ ] Sentry events tag-ується через `Sentry.setTag('requestId', requestId)`.

---

## 4. Uptime та Synthetic Monitoring

### Контрольний список

- [ ] **Зовнішній uptime checker:** UptimeRobot, BetterStack, Cronitor або self-hosted Uptime Kuma.
- [ ] Перевіряється `/api/health` із інтервалом ≤ 5 хв.
- [ ] Налаштований alert-канал: email + Telegram/Slack/Discord.
- [ ] **Synthetic E2E** (опціонально): Playwright-сценарій критичного шляху (login → ключова дія) запускається з cron'у; падіння — алерт.

---

## 5. Метрики бізнесу (Custom metrics)

### Контрольний список

- [ ] Ключові доменні події (signup, checkout-success, error-rate-by-endpoint) надсилаються як окремі custom-метрики (Sentry custom metrics, Plausible Goals, Prometheus).
- [ ] Кожна метрика має чітке визначення (SLI) та цільове значення (SLO), задокументоване в `README.md` чи окремому `OBSERVABILITY-DASHBOARD.md`.

---

## 6. Alerting

### Контрольний список

- [ ] **Sentry alerts** (мінімум):
  - Новий **regression** (помилка повернулась після resolve) → негайно
  - Error rate > **1%** від запитів за 5 хв → попередження
  - Будь-яка помилка з рівнем `fatal` → негайно
- [ ] **Performance alerts** (опціонально):
  - p95 LCP > 3s протягом 30 хв
  - Apdex < 0.8
- [ ] **Канал доставки:** не лише email — також push (PagerDuty / Telegram / Slack), щоб алерти не загубились.
- [ ] **Runbook:** для кожного типу алерту в репо є `docs/runbooks/<alert-name>.md` із кроками діагностики.

---

## 7. Privacy & GDPR

### Контрольний список

- [ ] **Cookie banner** (якщо використовуються non-essential cookies для аналітики): consent перед завантаженням telemetry-скриптів.
- [ ] Sentry Session Replay вимкнено для сторінок з PII (форми, settings, checkout) через `replaysSessionSampleRate: 0` + `Sentry.replayIntegration({ block: ['.sensitive', 'input'], maskAllText: true })`.
- [ ] У telemetry payload відсутні поля з `email`, `phone`, `password`, `token`, `card_number` (перевірено через `beforeSend`).
- [ ] Користувач може запросити видалення своїх даних з Sentry (через Sentry «User Feedback» API або ручний запит).

---

## 8. Pre-Release Observability Checklist

- [ ] Sentry DSN встановлено для production env
- [ ] Source maps завантажено в Sentry; недоступні з CDN
- [ ] Release-tag збігається з `package.json` версією
- [ ] `beforeSend` маскує PII (перевірено вручну тестовою помилкою)
- [ ] `/api/health` повертає `{ status: 'ok', version }`
- [ ] Зовнішній uptime checker налаштовано
- [ ] Alerts: error-rate, fatal-errors, regression — увімкнено
- [ ] Web Vitals (CLS/INP/LCP) збираються
- [ ] Lighthouse CI зелений на main
- [ ] Cookie consent (якщо застосовно) виводиться **до** ініціалізації аналітики
