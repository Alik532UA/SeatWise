---
Назва: Безпека — Валідація, Сесії, Заголовки, Залежності, Завантаження
Версія: 6.0
Фреймворк: SvelteKit 2 + Svelte 5 (Runes)
Опис: Єдиний документ безпеки — від валідації входу до файлових завантажень, sessions, headers, dependency audit
---

# Безпека

Цей документ — **єдине джерело істини** для безпекових вимог проєкту. Покриває:
- Валідація вхідних даних (Zod / Valibot)
- Захист роутів (Auth Guards, CSRF, Sessions)
- Змінні оточення та секрети
- HTTP security headers (CSP, HSTS, X-Frame-Options тощо)
- XSS, prototype pollution, injection prevention
- Завантаження файлів
- Rate limiting
- Безпека залежностей (supply chain)
- PII у логах
- Pre-release security checklist

Логування помилок — див. [DEBUGGING-v6.md](DEBUGGING-v6.md). Обробка помилок — див. [ERROR-HANDLING-v6.md](ERROR-HANDLING-v6.md).

---

## 🚫 ЖОРСТКІ ОБМЕЖЕННЯ (ANTI-PATTERNS)

| Рівень | Заборона | Правильна альтернатива |
|--------|----------|----------------------|
| **CRITICAL** | Імпорт секретів з `$env/static/public` | `$env/static/private` — тільки у серверних файлах |
| **CRITICAL** | Запити до БД або валідація секретів у `+page.ts` чи `.svelte` | `+page.server.ts` (`load` або `actions`) |
| **CRITICAL** | Обробка form data без валідації | Zod / Valibot схеми для кожного `actions` |
| **CRITICAL** | `throw redirect()` на клієнті для захисту роутів | `throw redirect()` у `hooks.server.ts` або `+layout.server.ts` |
| **CRITICAL** | Зберігання паролів у відкритому вигляді | `argon2` або `bcrypt` (cost ≥ 12) |
| **CRITICAL** | Сесійні токени / JWT у `localStorage` | HTTP-only `Secure SameSite=Lax` cookies |
| **CRITICAL** | Логування паролів, токенів, повних номерів карт, email | Маскування або повне виключення PII з логів |
| **CRITICAL** | Завантажений файл зберігається з оригінальним user-controlled ім'ям | UUID-ім'я + перевірка MIME-type на сервері |
| **CRITICAL** | `{@html untrustedString}` без санітизації | `DOMPurify.sanitize(...)` або рендер через DOM API |
| **CRITICAL** | Вимикання вбудованого CSRF-захисту SvelteKit | `csrf.checkOrigin` залишається `true` |
| **HIGH** | Відкриті public endpoints без rate limiting | Обмеження частоти (per-IP / per-session) |
| **HIGH** | Залежності з відомими CVE без оновлення | `npm audit` у CI + Dependabot |
| **HIGH** | `eval()`, `new Function(string)`, `setTimeout(string, ...)` | Заборонено повністю |

---

## 1. Валідація вхідних даних

### 1.1 Zod / Valibot
- [ ] **Усі** вхідні дані жорстко валідуються через Zod або Valibot схеми:
  - Form data у `actions`
  - URL параметри (`params`, `searchParams`)
  - Відповіді зовнішніх API
  - Тіло запитів у `+server.ts`
- [ ] Невалідні дані → `fail(400, { errors: ... })` (для форм) або `error(400, ...)` (для API).

```typescript
import { z } from 'zod';

const createUserSchema = z.object({
    email: z.string().email(),
    age: z.number().int().min(13).max(120)
});

export const actions = {
    create: async ({ request }) => {
        const formData = await request.formData();
        const parsed = createUserSchema.safeParse(Object.fromEntries(formData));
        if (!parsed.success) return fail(400, { errors: parsed.error.flatten() });
        // safe to use parsed.data
    }
} satisfies Actions;
```

### 1.2 Захист від prototype pollution
- [ ] При парсингу JSON від користувача не використовуються `Object.assign(target, userJson)` — використовується явне присвоєння полів зі схеми.
- [ ] Заборонено: `lodash.merge` без deep-clone (вразливі версії).

---

## 2. Захист роутів та Auth Guards

### 2.1 Спільна перевірка у `hooks.server.ts`
- [ ] **Спільна** перевірка авторизації (чи залогінений) — централізовано:
```typescript
export const handle: Handle = async ({ event, resolve }) => {
    const session = await getSession(event.cookies);
    event.locals.user = session?.user ?? null;

    if (event.url.pathname.startsWith('/admin') && !event.locals.user) {
        throw redirect(303, '/login');
    }
    return resolve(event);
};
```

### 2.2 Гранулярна перевірка
- [ ] **Специфічні** перевірки (роль `admin`, ownership, гранулярні permissions) — у відповідному `+page.server.ts` або `+layout.server.ts`.

> **Примітка:** Загальну перевірку «чи залогінений» — у hooks. Рольову гранулярну перевірку — в конкретних серверних файлах. DRY без надмірної жорсткості.

### 2.3 CSRF Protection
- [ ] Вбудований CSRF-захист SvelteKit — `csrf.checkOrigin` залишається `true` (за замовчуванням).
- [ ] Для зовнішніх клієнтів (мобільні додатки, third-party SPA) — окремий API через `+server.ts` з власною токен-схемою (Bearer).

---

## 3. Сесії та Аутентифікація

### 3.1 HTTP-only cookies для сесійних токенів
- [ ] Сесійні токени / JWT встановлюються **виключно** через `cookies.set()` із прапорцями:
```typescript
cookies.set('session', token, {
    path: '/',
    httpOnly: true,         // недоступно з JavaScript (захист від XSS)
    secure: true,           // тільки HTTPS
    sameSite: 'lax',        // захист від CSRF при cross-site GET
    maxAge: 60 * 60 * 24 * 7 // 7 днів
});
```
- [ ] **Заборонено** зберігати токени у `localStorage` чи `sessionStorage` — XSS-атака їх викраде.

### 3.2 Хешування паролів
- [ ] `argon2` (рекомендовано) або `bcrypt` із cost factor **≥ 12**:
```typescript
import argon2 from 'argon2';

const hash = await argon2.hash(password, { type: argon2.argon2id });
const valid = await argon2.verify(hash, candidatePassword);
```
- [ ] Заборонено: `MD5`, `SHA-1`, `SHA-256` без salt, власні «обфускації».

### 3.3 Тривалість та інвалідація сесій
- [ ] Сесії мають обмежений `maxAge` (7-30 днів для UX, до 1 години для адмінських).
- [ ] Logout інвалідує сесію **на сервері** (видаляє з БД / Redis), а не лише видаляє cookie.
- [ ] При зміні пароля — усі активні сесії інвалідуються.

### 3.4 Захист від brute-force
- [ ] Логін-ендпоінт має rate limiting (див. розділ 6) — наприклад, 5 спроб / 15 хв на IP.
- [ ] Помилка авторизації повертає **узагальнене** повідомлення («Невірний email або пароль») — не уточнюючи, що саме.

---

## 4. Змінні оточення та секрети

### Контрольний список
- [ ] Серверні секрети (API keys, DB credentials) імпортуються **виключно** з `$env/static/private` або `$env/dynamic/private`.
- [ ] Клієнтські публічні ключі — з `$env/static/public` (з префіксом `PUBLIC_`).
- [ ] `.env` додано в `.gitignore`. `.env.example` з описом змінних (без значень) комітиться.
- [ ] Жодного хардкоду секретів у коді (`grep` перед релізом).

---

## 5. XSS Prevention та `{@html}`

### Контрольний список
- [ ] Дані користувача екрануються автоматично (стандарт Svelte template) — НЕ обходити це через `{@html}`.
- [ ] `{@html ...}` використовується **тільки** із санітизацією через DOMPurify:
```svelte
{@html DOMPurify.sanitize(userMarkdown)}
```
- [ ] Динамічні `href` та `src` атрибути перевіряються на `javascript:` протокол:
```typescript
function safeUrl(url: string): string {
    if (/^javascript:/i.test(url.trim())) return '#';
    return url;
}
```

---

## 6. HTTP Security Headers

### Контрольний список

#### CSP через SvelteKit
- [ ] Налаштовано CSP через `svelte.config.js`:
```javascript
kit: {
    csp: {
        directives: {
            'script-src': ['self'],
            'style-src': ['self', 'unsafe-inline']
        }
    }
}
```
- [ ] CSP `script-src` явно перераховує дозволені домени (не `*`). `unsafe-inline` для `script-src` **заборонено**.

#### Решта заголовків через `hooks.server.ts`
- [ ] Встановлені заголовки безпеки:

| Заголовок | Значення | Призначення |
|-----------|----------|-------------|
| `Strict-Transport-Security` | `max-age=31536000; includeSubDomains` | Примусовий HTTPS на 1 рік |
| `X-Content-Type-Options` | `nosniff` | Заборона MIME-sniffing |
| `X-Frame-Options` | `DENY` (або `SAMEORIGIN`) | Захист від clickjacking |
| `Referrer-Policy` | `strict-origin-when-cross-origin` | Обмеження витоку referrer |
| `Permissions-Policy` | `camera=(), microphone=(), geolocation=()` | Заборона зайвих API |

```typescript
// hooks.server.ts
export const handle: Handle = async ({ event, resolve }) => {
    const response = await resolve(event);
    response.headers.set('X-Content-Type-Options', 'nosniff');
    response.headers.set('X-Frame-Options', 'DENY');
    response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
    response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
    return response;
};
```

> **Примітка для GitHub Pages:** деякі заголовки (HSTS, CSP) на GitHub Pages не контролюються — використовуйте `<meta http-equiv="Content-Security-Policy">` як fallback.

---

## 7. Rate Limiting

### Контрольний список
- [ ] Чутливі ендпоінти мають rate limiting:
  - `/login`, `/signup`, `/reset-password`: 5 запитів / 15 хв на IP
  - Public API: 60 запитів / хв на IP
  - Form submissions з користувацьким контентом: 10 / хв на сесію
- [ ] Для serverless / edge — зовнішній стор (Redis, Upstash, Cloudflare KV), не in-memory Map.
- [ ] Перевищення ліміту → HTTP `429 Too Many Requests` з `Retry-After`.

---

## 8. Завантаження файлів (File Uploads)

### 8.1 Перевірка на сервері
- [ ] Розмір обмежений на **сервері** (не лише через HTML `accept`):
```typescript
const MAX_SIZE = 5 * 1024 * 1024;
if (file.size > MAX_SIZE) return fail(413, { error: 'File too large' });
```
- [ ] MIME-type перевіряється **за вмістом** (через `file-type` або magic bytes), а не лише за `Content-Type`.
- [ ] Allowlist дозволених типів: `['image/png', 'image/jpeg', 'image/webp']` тощо.

### 8.2 Безпечне зберігання
- [ ] **Не зберігати** оригінальне ім'я — генерувати UUID:
```typescript
import { randomUUID } from 'crypto';
const safeName = `${randomUUID()}.${ext}`;
```
- [ ] Файли — **поза** статичною папкою публічного веб-серверу або в object storage (S3, R2, Firebase Storage).
- [ ] Для не-зображень — `Content-Disposition: attachment` при віддачі.

### 8.3 Path traversal
- [ ] Усі імена файлів, що формують шлях, очищаються через `path.basename()` або суворий regex (видалення `..`, `/`, `\`).

---

## 9. Безпека залежностей (Supply Chain)

### Контрольний список
- [ ] **Аудит у CI:** `npm audit --production --audit-level=high` блокує PR при high/critical:
```yaml
- run: npm audit --production --audit-level=high
```
- [ ] **Dependabot або Renovate:** автоматичні PR з оновленнями (мінімум — security updates).
- [ ] **Lock-файл:** `package-lock.json` комітиться. CI використовує `npm ci` (див. [CI-CD-AND-TOOLS-v6.md](CI-CD-AND-TOOLS-v6.md)).
- [ ] **Перевірка нових пакетів:** Дрібні пакети (<10k тижневих завантажень) — потенційний ризик supply chain атак (typosquatting, hijacked packages). Перевіряти автора, кількість завантажень, дату релізу.

---

## 10. PII у логах

### Контрольний список
- [ ] **Заборонено** логувати:
  - Паролі, токени, API ключі, секрети
  - Повні номери кредитних карт (max — last 4 digits)
  - Email адреси без потреби (для дебагу — маскувати: `j***@example.com`)
  - Номери телефонів, паспортів, IP адрес користувачів (GDPR/CCPA — це PII)
- [ ] Якщо PII потрапляє у логи — створено хелпер маскування:
```typescript
function maskEmail(email: string): string {
    const [local, domain] = email.split('@');
    return `${local[0]}***@${domain}`;
}
```
- [ ] Звіти від `LogCopyButton` (див. [DEBUGGING-v6.md](DEBUGGING-v6.md)) також очищаються від PII.
- [ ] Телеметрія (Sentry, RUM) — окремий scrubber, див. [OBSERVABILITY-v6.md § 1.4](OBSERVABILITY-v6.md).

---

## 10.1 Приховування чутливого UI при втраті фокусу

### Контрольний список
- [ ] Сторінки з чутливим вмістом (банкінг, медичні дані, чати, settings) приховують вміст при `visibilitychange` → `hidden` або при втраті фокусу вкладки:
```typescript
$effect(() => {
    const onVisibilityChange = () => {
        document.body.classList.toggle('app-blurred', document.hidden);
    };
    document.addEventListener('visibilitychange', onVisibilityChange);
    return () => document.removeEventListener('visibilitychange', onVisibilityChange);
});
```
```css
.app-blurred main { filter: blur(20px); }
```
- [ ] Так само — для PWA на iOS, де preview у app-switcher показує останній кадр (потенційний витік даних через скріншот системи).
- [ ] Поля з паролем мають `autocomplete="current-password"` / `"new-password"` (НЕ `"off"` — порушує password manager).

---

## 11. Заборонені конструкції (Code-level)

### Контрольний список
- [ ] **Заборонено:**
  - `eval(string)`
  - `new Function(string)`
  - `setTimeout(string, ...)` / `setInterval(string, ...)` із рядком як першим аргументом
  - `document.write()`
  - Inline `onclick="..."` атрибути в HTML (тільки event listeners в JS / Svelte)
- [ ] ESLint правила: `no-eval`, `no-implied-eval`, `no-new-func`.

---

## 12. Третя сторона (3rd-party scripts)

### Контрольний список
- [ ] Зовнішні скрипти (analytics, CDN-бібліотеки) завантажуються із **Subresource Integrity (SRI)**:
```html
<script src="https://cdn.example.com/lib.js" integrity="sha384-..." crossorigin="anonymous"></script>
```
- [ ] CSP `script-src` явно перераховує дозволені домени.
- [ ] iframe з третіх сторін мають `sandbox` атрибут із мінімальними дозволами.

---

## 13. Pre-Release Security Checklist

Перед публічним релізом:

- [ ] `npm audit --production` — 0 high/critical
- [ ] Жодного `console.log(token)` чи `console.log(password)` (`grep`)
- [ ] `.env` НЕ в репозиторії; `.env.example` — без реальних значень
- [ ] Cookies встановлюються з `Secure`, `HttpOnly`, `SameSite`
- [ ] Security headers повертаються (перевірити через [securityheaders.com](https://securityheaders.com))
- [ ] CSP не має `unsafe-inline` для `script-src`
- [ ] Усі `+server.ts` ендпоінти валідують вхід через Zod
- [ ] Усі форми мають `use:enhance` (див. [SVELTEKIT-DATA-v6.md](SVELTEKIT-DATA-v6.md)) і не вимикають CSRF
- [ ] Усі `{@html}` пройдені через DOMPurify

