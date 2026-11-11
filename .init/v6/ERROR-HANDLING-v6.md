---
Назва: Обробка помилок — Класи, Boundaries, +error.svelte, Retry
Версія: 6.0
Фреймворк: SvelteKit 2 + Svelte 5 (Runes)
Опис: Уніфікована стратегія обробки помилок на всіх рівнях застосунку
---

# Обробка помилок

Цей документ визначає **обов'язкову** стратегію обробки помилок: від доменних класів до user-facing повідомлень. Логування помилок — див. [DEBUGGING-v6.md](DEBUGGING-v6.md). Тестування помилок — див. [CODE-QUALITY-v6.md](CODE-QUALITY-v6.md).

---

## 🚫 ЖОРСТКІ ОБМЕЖЕННЯ (ANTI-PATTERNS)

| Рівень       | Заборона                                                                          | Правильна альтернатива                                                   |
| ------------ | --------------------------------------------------------------------------------- | ------------------------------------------------------------------------ |
| **CRITICAL** | `try { ... } catch { /* мовчки */ }` (silent catch)                               | Логувати через `logService.error()` + проробити, що показати користувачу |
| **CRITICAL** | Показ raw error message від сервера/БД користувачу (`error.message` напряму у UI) | Маппінг помилки → user-friendly повідомлення                             |
| **CRITICAL** | `throw 'string'` (string як помилка)                                              | `throw new AppError(...)` або `throw error(404, '...')` у SvelteKit      |
| **HIGH**     | Один загальний `catch (e: any)` для всіх типів помилок без розрізнення            | Розрізнення через `instanceof` або discriminated union                   |
| **HIGH**     | Нескінченний retry без backoff та ліміту спроб                                    | Експоненційний backoff + max attempts (3-5)                              |
| **HIGH**     | Глобальний `window.onerror` як єдиний обробник                                    | `<svelte:boundary>` + `+error.svelte` + `logService`                     |

---

## 1. Доменні класи помилок

### 1.1 Базовий клас

- [ ] У `src/lib/errors/AppError.ts` визначено базовий клас:

```typescript
export class AppError extends Error {
	constructor(
		public readonly code: string,
		message: string,
		public readonly cause?: unknown
	) {
		super(message);
		this.name = this.constructor.name;
	}
}
```

### 1.2 Спеціалізовані класи

- [ ] Створені типізовані підкласи для основних сценаріїв:

```typescript
export class ValidationError extends AppError {
	constructor(public readonly fields: Record<string, string>) {
		super('VALIDATION_ERROR', 'Дані некоректні');
	}
}

export class NotFoundError extends AppError {
	constructor(resource: string) {
		super('NOT_FOUND', `${resource} не знайдено`);
	}
}

export class NetworkError extends AppError {
	constructor(
		message: string,
		public readonly status?: number
	) {
		super('NETWORK_ERROR', message);
	}
}

export class AuthError extends AppError {
	constructor(message = 'Необхідна авторизація') {
		super('AUTH_ERROR', message);
	}
}
```

### 1.3 Розрізнення типів через `instanceof`

- [ ] У `catch` блоках помилки розрізняються за типом:

```typescript
try {
	await api.fetchUser(id);
} catch (err) {
	if (err instanceof NotFoundError) {
		toast.warn('Користувача не знайдено');
	} else if (err instanceof NetworkError) {
		toast.error("Проблеми зі з'єднанням. Спробуйте пізніше.");
	} else if (err instanceof AuthError) {
		goto('/login');
	} else {
		logService.error('user-fetch', String(err));
		toast.error('Сталася неочікувана помилка');
	}
}
```

---

## 2. SvelteKit-специфічна обробка

### 2.1 `error()` helper із `@sveltejs/kit`

- [ ] У серверних `load`-функціях та `actions` для очікуваних помилок використовується `error()`:

```typescript
import { error } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ params }) => {
	const item = await db.findItem(params.id);
	if (!item) throw error(404, 'Товар не знайдено');
	return { item };
};
```

- [ ] HTTP-статуси: `400` (bad request), `401` (auth), `403` (forbidden), `404` (not found), `409` (conflict), `500` (server error).

### 2.2 `+error.svelte` на рівнях маршрутів

- [ ] У корені `src/routes/` присутній **глобальний** `+error.svelte` як останній fallback.
- [ ] Для важливих секцій (наприклад, `/admin`, `/checkout`) — окремий `+error.svelte` з контекстуальним повідомленням:

```svelte
<!-- src/routes/+error.svelte -->
<script lang="ts">
	import { page } from '$app/stores';
</script>

<div class="error-page">
	<h1>{$page.status}</h1>
	<p>{$page.error?.message ?? 'Щось пішло не так'}</p>
	<a href="/">На головну</a>
</div>
```

### 2.3 `<svelte:boundary>` для ізоляції UI-помилок

- [ ] Критичні віджети (чарти, редактори, треті сторонні embeds) загорнуті у boundary:

```svelte
<svelte:boundary onerror={(error, reset) => logService.error('chart', String(error))}>
	<ComplexChart data={chartData} />

	{#snippet failed(error, reset)}
		<div class="widget-error">
			<p>Не вдалося завантажити графік</p>
			<button onclick={reset}>Спробувати знову</button>
		</div>
	{/snippet}
</svelte:boundary>
```

- [ ] Boundary **не використовується** як заміна `try/catch` для async-логіки — він ловить тільки synchronous render errors.

---

## 3. Retry та Fallback

### 3.1 Експоненційний backoff

- [ ] Для idempotent-запитів (GET) реалізовано retry з експоненційним backoff:

```typescript
async function fetchWithRetry<T>(
	fn: () => Promise<T>,
	{ maxAttempts = 3, baseDelay = 300 } = {}
): Promise<T> {
	let lastError: unknown;
	for (let attempt = 1; attempt <= maxAttempts; attempt++) {
		try {
			return await fn();
		} catch (err) {
			lastError = err;
			if (attempt === maxAttempts) break;
			const delay = baseDelay * Math.pow(2, attempt - 1);
			await new Promise((r) => setTimeout(r, delay));
		}
	}
	throw lastError;
}
```

- [ ] **Заборонено** retry для non-idempotent запитів (POST/PATCH/DELETE) без явного `Idempotency-Key`.

### 3.2 Fallback значення

- [ ] Для не-критичних даних (рекомендації, аналітика, статистика) — при помилці повертається порожнє значення / placeholder, а не падає вся сторінка:

```typescript
const recommendations = await getRecommendations().catch(() => []);
```

### 3.3 Stale-while-revalidate

- [ ] Для часто змінюваних даних — показ кешованого + фонове оновлення; при помилці оновлення — кеш залишається валідним.

---

## 4. User-facing повідомлення

### 4.1 Маппінг помилок

- [ ] Створено централізований маппер `errorToUserMessage(err)`, що перетворює технічні помилки на зрозумілі користувачу повідомлення:

```typescript
export function errorToUserMessage(err: unknown): string {
	if (err instanceof ValidationError) return 'Перевірте введені дані';
	if (err instanceof NotFoundError) return err.message;
	if (err instanceof NetworkError) return "Проблеми зі з'єднанням";
	if (err instanceof AuthError) return 'Необхідна авторизація';
	return 'Сталася неочікувана помилка. Спробуйте пізніше.';
}
```

- [ ] **Заборонено** показувати `err.message` напряму у UI — це може містити stack trace, SQL-запити, шляхи серверних файлів.

### 4.2 Toast / Snackbar

- [ ] Помилки відображаються через єдиний механізм нотифікацій (toast service), а не через `alert()` чи різні компоненти.
- [ ] Тривалість тосту: `info` 3s, `warn` 5s, `error` 7s (або до явного закриття).

### 4.3 Локалізація помилок

- [ ] User-facing повідомлення локалізовані через i18n (Paraglide — див. [UI-UX-v6.md](UI-UX-v6.md)).
- [ ] Технічні повідомлення в логах **не** локалізовуються — тільки англійська (для дебагу).

---

## 5. Глобальні обробники

### 5.1 Unhandled Promise Rejections

- [ ] У `+layout.svelte` (або через окремий setup-модуль) встановлено глобальний обробник:

```svelte
<script lang="ts">
	import { onMount } from 'svelte';
	import { logService } from '$lib/services/logService.svelte';

	onMount(() => {
		const handler = (event: PromiseRejectionEvent) => {
			logService.error('unhandled-promise', String(event.reason));
		};
		window.addEventListener('unhandledrejection', handler);
		return () => window.removeEventListener('unhandledrejection', handler);
	});
</script>
```

### 5.2 `window.onerror`

- [ ] Аналогічно — глобальний `error` listener для синхронних помилок поза boundaries:

```typescript
window.addEventListener('error', (event) => {
	logService.error('window-error', `${event.message} at ${event.filename}:${event.lineno}`);
});
```

> **Примітка:** Глобальні обробники — це **сітка безпеки**, а не основний механізм. Помилки мають оброблятися локально через `try/catch`, `<svelte:boundary>` та `+error.svelte`.

---

## 6. Контрольний список перед релізом

- [ ] У всіх `catch` блоках є хоча б `logService.error(...)` — нічого не «з'їдається»
- [ ] Жодного `throw 'string'` у кодовій базі (`grep -r "throw '" src/`)
- [ ] `+error.svelte` присутній у корені маршрутів
- [ ] Маппер `errorToUserMessage` покриває всі підкласи `AppError`
- [ ] Глобальні обробники `unhandledrejection` та `error` встановлено
- [ ] Помилки авторизації редиректять на `/login` (а не показують 401-сторінку)
- [ ] Жоден `err.message` не виводиться у UI напряму
