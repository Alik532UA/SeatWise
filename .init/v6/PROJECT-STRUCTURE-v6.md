---
Назва: Організація та структура проєкту
Версія: 6.0
Фреймворк: SvelteKit 2 + Svelte 5 (Runes)
Опис: Правила кореневої папки, static/, src/lib/, src/routes/, іменування та тестова інфраструктура
---

# Організація та структура проєкту

Чистота файлової структури критично важлива для підтримки та масштабування. Цей документ встановлює **обов'язкові** правила розміщення файлів, що враховують архітектуру SvelteKit та парадигму Svelte 5.

---

## 🚫 ЖОРСТКІ ОБМЕЖЕННЯ (ANTI-PATTERNS)

| Рівень | Заборона | Правильна альтернатива |
|--------|----------|----------------------|
| **CRITICAL** | Самописні скрипти в кореневій папці (`inject_galleries.cjs`, `update_settings_ui.cjs`) | Перенести у `scripts/` |
| **CRITICAL** | Порушення file-system routing (`About.svelte` у `src/routes/`) | `+page.svelte` для маршрутів; компоненти у `src/lib/` |
| **CRITICAL** | Медіафайли у корені `static/` (окрім системних) | Підпапки: `images/`, `fonts/`, `svg/`, `audio/` |
| **HIGH** | Змішування E2E-тестів з вихідним кодом у `src/` | E2E у кореневому `tests/` |
| **HIGH** | Згенеровані артефакти в репозиторії (`bundle-stats.html`, `.playwright/`) | `.gitignore` |
| **HIGH** | Змішування стилів іменування для одного типу файлів | Єдиний стиль по всьому проєкту |

---

## 1. Порядок у кореневій папці

### Контрольний список
- [ ] **Чистий корінь:** Відсутні самописні скрипти логіки.
- [ ] **Дозволені файли в корені (вичерпний список):**

  | Категорія | Файли |
  |-----------|-------|
  | Менеджер пакетів | `package.json`, `package-lock.json` |
  | Збірка та конфіг | `svelte.config.js`, `vite.config.ts`, `tsconfig.json`, `vitest.config.ts`, `playwright.config.ts` |
  | Лінтинг | `eslint.config.js`, `.prettierrc` |
  | Оточення | `.env`, `.env.example` |
  | Git | `.gitignore`, `.gitattributes` |
  | AI-інструкції | `GEMINI.md`, `.geminiignore`, `.github/copilot-instructions.md` |
  | Документація | `README.md`, `LICENSE` |
  | Firebase / Інше | `firebase.json`, `firestore.rules`, `.nojekyll` |

- [ ] **Папка `scripts/`:** Усі кастомні Node.js скрипти (bump-version, парсинг, міграції, генерація) перенесені сюди.
- [ ] **Оновлені команди:** `package.json` скрипти вказують на `scripts/` (напр. `"bump": "node scripts/bump-version.js"`).
- [ ] **Артефакти відсутні:** `bundle-stats.html`, тестові звіти, `dist/` — не комітяться.

---

## 2. Організація `static/` (або `public/`)

### Контрольний список
- [ ] **Медіафайли у підпапках:**
```text
static/
├── images/          # растрові зображення (jpg, png, webp, avif)
├── svg/             # векторна графіка
├── fonts/           # кастомні шрифти
├── audio/           # звукові файли (якщо є)
├── og/              # Open Graph зображення
└── favicon/         # іконки фавікону різних розмірів
```
- [ ] **Дозволені файли в корені `static/`:**
  - `favicon.ico`, `favicon.png`, `favicon.svg`
  - `robots.txt`, `sitemap.xml`
  - `manifest.json` та PWA-іконки (`icon-192.png`, `icon-512.png`)
  - `.nojekyll`, `CNAME`
  - `app-version.json` (генерується скриптом)
- [ ] **Усе інше** в корені `static/` — заборонено.

---

## 3. Організація `src/routes/` (Маршрутизація)

### Контрольний список
- [ ] **Зарезервовані імена:** У `src/routes/` — **виключно** системні імена SvelteKit: `+page.svelte`, `+layout.svelte`, `+page.ts/.server.ts`, `+layout.ts/.server.ts`, `+server.ts`, `+error.svelte`.
- [ ] **Компоненти — у `src/lib/`:** Заборонено створювати файли типу `UserProfile.svelte` безпосередньо як маршрути.
- [ ] **Колокація:** Компоненти, що використовуються **тільки** на одній сторінці, дозволено тримати поруч з `+page.svelte`. SvelteKit ігнорує файли без префіксу `+` у `routes/`, тому ніякого спеціального іменування (типу `_prefix`) не потрібно.

> **Примітка:** SvelteKit **автоматично** ігнорує файли без `+` у `src/routes/`. Файл `LocalForm.svelte` поруч з `+page.svelte` — не стане маршрутом. Конвенція `_` — необов'язкова.

---

## 4. Організація `src/lib/`

### Контрольний список
- [ ] **Логічне розділення:**
```text
src/lib/
├── components/       # .svelte UI компоненти
│   ├── ui/           # базові: Button, Modal, Input, Toast
│   └── sections/     # складені секції сторінок
├── controllers/      # .svelte.ts класи з $state/$derived/$effect
├── errors/           # доменні класи помилок (AppError, HttpError) — див. ERROR-HANDLING-v6.md
├── i18n/             # конфіг Paraglide, допоміжні утиліти — див. I18N-v6.md
├── services/         # .ts сервіси (API, storage, log)
├── types/            # TypeScript інтерфейси
├── utils/            # чисті функції-утиліти
└── config/           # константи, enum-и, конфіги
```
- [ ] **Заборонено:** тримати файли "россипом" у `src/lib/` без підпапки (виняток — `index.ts` для barrel exports).

---

## 5. Іменування файлів та Svelte 5

### Контрольний список
- [ ] **Svelte UI:** `PascalCase.svelte` (`UserCard.svelte`, `GameBoard.svelte`).
- [ ] **Контролери (з рунами):**
  - Клас → `PascalCase.svelte.ts` (`GameState.svelte.ts`)
  - Factory → `camelCase.svelte.ts` (`createGameState.svelte.ts`)
- [ ] **Сервіси/утиліти (без реактивності):** `camelCase.ts` (`formatDate.ts`, `apiClient.ts`).
- [ ] **Сервіси (з `$state`):** `camelCase.svelte.ts` (`logService.svelte.ts`).
- [ ] **Типи:** `camelCase.ts` у `types/` (`types/user.ts`).
- [ ] **Папки:** `kebab-case` (`src/lib/components/ui/`, `src/routes/admin-panel/`).
- [ ] **Єдина конвенція** по всьому проєкту.

> **Чому `.svelte.ts`?** Svelte 5 compiler обробляє файли `.svelte.ts` спеціально — дозволяє використовувати руни (`$state`, `$derived`, `$effect`). Звичайні `.ts` файли — не можуть містити руни.

---

## 6. Інфраструктура тестування

### Контрольний список
- [ ] **Unit-тести** колоковані поруч із файлом: `formatDate.ts` → `formatDate.test.ts`.
- [ ] **E2E-тести** — у кореневому `tests/` (не в `src/`).
- [ ] **Єдиний суфікс:** `.test.ts` або `.spec.ts` — один стандарт.
- [ ] Конвенції тестування, мокінг, coverage — у [CODE-QUALITY-v6.md](CODE-QUALITY-v6.md).

---

## Пов'язані документи

| Домен | Документ |
|-------|----------|
| Компоненти та CSS | [SVELTE-UI-v6.md](SVELTE-UI-v6.md) |
| Реактивний стан | [SVELTE-CORE-v6.md](SVELTE-CORE-v6.md) |
| Доступність | [ACCESSIBILITY-v6.md](ACCESSIBILITY-v6.md) |
| i18n | [I18N-v6.md](I18N-v6.md) |
| Помилки | [ERROR-HANDLING-v6.md](ERROR-HANDLING-v6.md) |
| Моніторинг (prod) | [OBSERVABILITY-v6.md](OBSERVABILITY-v6.md) |
| CI/CD | [CI-CD-AND-TOOLS-v6.md](CI-CD-AND-TOOLS-v6.md) |
| Безпека | [SECURITY-v6.md](SECURITY-v6.md) |

