---
Назва: SvelteKit — Роутинг, Завантаження даних та Форми
Версія: 6.0
Фреймворк: SvelteKit 2 + Svelte 5 (Runes)
Опис: Правила завантаження даних, мутацій через actions та API routes. Безпека — див. SECURITY-v6.md
---

# SvelteKit: Роутинг, Дані та Форми

Цей документ визначає **обов'язкові** критерії для серверної логіки, завантаження даних, форм та `+server.ts` ендпоінтів.

> **Безпека (валідація через Zod, CSRF, Auth Guards, env vars, CSP, XSS)** винесена в окремий документ — див. [SECURITY-v6.md](SECURITY-v6.md).

---

## 🚫 ЖОРСТКІ ОБМЕЖЕННЯ (ANTI-PATTERNS)

| Рівень       | Заборона                                                   | Правильна альтернатива                   |
| ------------ | ---------------------------------------------------------- | ---------------------------------------- |
| **CRITICAL** | Запити до БД у `+page.ts` або `.svelte`                    | `+page.server.ts` (`load` або `actions`) |
| **CRITICAL** | Ручний `fetch` для стандартних HTML-форм                   | SvelteKit `actions` + `use:enhance`      |
| **HIGH**     | Блокуючий `await` для повільних некритичних даних у `load` | Стрімінг (повертати unawaited promise)   |
| **HIGH**     | `+server.ts` для CRUD, що мав би йти через форму           | Використовувати `actions`                |

---

## 1. Завантаження Даних (Data Loading)

### 1.1 Server-First

- [ ] Функція `load` для отримання даних з БД або зовнішніх API реалізована у `+page.server.ts`.
- [ ] Клієнтський `+page.ts` використовується для даних, що **не потребують серверного доступу** (читання URL params, об'єднання серверних даних з клієнтським станом).

### 1.2 Стрімінг (Streaming)

- [ ] Для тривалих запитів використовуються неблокуючі проміси у `load` — критичні дані з `await`, повільні — без:

```typescript
// +page.server.ts
export const load: PageServerLoad = async () => {
	return {
		fast: await getFastData(), // блокує рендер (критичні дані)
		slow: getSlowRecommendations() // НЕ await — стрімиться після першого рендеру
	};
};
```

```svelte
<!-- +page.svelte -->
{#await data.slow}
	<Skeleton />
{:then recommendations}
	<RecommendationList items={recommendations} />
{/await}
```

### 1.3 Кешування

- [ ] Серверні `load`-функції, що звертаються до зовнішніх API, використовують `setHeaders()` для контролю HTTP-кешу:

```typescript
export const load: PageServerLoad = async ({ setHeaders }) => {
	setHeaders({ 'cache-control': 'max-age=60' });
	return { items: await fetchItems() };
};
```

### 1.4 Preloading

- [ ] Для швидкої навігації використовується `data-sveltekit-preload-data="hover"` на `<body>` у `app.html` або на окремих посиланнях.

### 1.5 Інвалідація

- [ ] Для перезавантаження даних після мутації використовується `invalidate()` / `invalidateAll()`, а не повне перезавантаження сторінки.
- [ ] У `load`-функціях оголошуються залежності через `depends('app:items')` для прицільної інвалідації.

---

## 2. Мутації та Форми (Form Actions)

### 2.1 Server Actions

- [ ] Усі мутації даних (створення, оновлення, видалення) реалізуються через `export const actions` у `+page.server.ts`:

```typescript
export const actions = {
	create: async ({ request }) => {
		const formData = await request.formData();
		const parsed = schema.safeParse(Object.fromEntries(formData));
		if (!parsed.success) return fail(400, { errors: parsed.error.flatten() });
		await db.create(parsed.data);
		throw redirect(303, '/items');
	}
} satisfies Actions;
```

> **Валідація через Zod / Valibot — обов'язкова.** Деталі — у [SECURITY-v6.md § 1](SECURITY-v6.md).

### 2.2 Progressive Enhancement

- [ ] HTML-форми **обов'язково** використовують `use:enhance` — вони працюють без JS, але покращуються з JS:

```svelte
<form method="POST" action="?/create" use:enhance>
```

### 2.3 Валідація з Feedback

- [ ] Помилки валідації повертаються через `fail()` і відображаються поруч із відповідними полями форми.
- [ ] Форма зберігає введені дані при помилці (через `form` prop або повернення `data` з `fail()`).
- [ ] Поля з помилками мають `aria-invalid="true"` та пов'язаний `aria-describedby` з повідомленням.

### 2.4 Редиректи після успіху

- [ ] Після успішної мутації — `throw redirect(303, ...)` (POST/Redirect/GET pattern).
- [ ] Це запобігає повторному submit при F5.

---

## 3. API Routes (`+server.ts`)

### Коли використовувати `+server.ts`

- [ ] `+server.ts` створюється для:
  - Webhook-обробників (Stripe, Telegram bot)
  - Завантаження/вивантаження файлів
  - WebSocket / SSE endpoints
  - API для зовнішніх клієнтів (мобільний додаток, third-party SPA)
- [ ] Для стандартних CRUD між формами та сервером — використовуються `actions`, а не `+server.ts`.

### Контрольний список

- [ ] Кожен `+server.ts` ендпоінт валідує вхідні дані через Zod (див. [SECURITY-v6.md § 1](SECURITY-v6.md)).
- [ ] Повертає коректні HTTP-статуси (`200`, `201`, `400`, `401`, `403`, `404`, `409`, `500`).
- [ ] Використовує `json()` helper з `@sveltejs/kit` для відповідей:

```typescript
import { json, error } from '@sveltejs/kit';

export const POST: RequestHandler = async ({ request }) => {
	const body = await request.json();
	const parsed = schema.safeParse(body);
	if (!parsed.success) throw error(400, 'Invalid payload');
	const result = await processData(parsed.data);
	return json(result, { status: 201 });
};
```

---

## 4. Hooks (`hooks.server.ts`)

### Контрольний список

- [ ] `handle` — глобальний middleware для всіх запитів (logging, auth перевірка, security headers).
- [ ] `handleFetch` — для перепризначення `fetch` усередині `load`-функцій (наприклад, додати auth-токен до серверних викликів).
- [ ] `handleError` — централізована обробка помилок сервера (інтеграція з Sentry, лог-агрегатором).
- [ ] Auth-логіка та security headers — див. [SECURITY-v6.md](SECURITY-v6.md).
