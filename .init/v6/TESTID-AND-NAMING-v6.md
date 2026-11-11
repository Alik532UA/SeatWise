---
Назва: Стандарти `data-testid`, CSS-класів та іменування компонентів
Версія: 6.0
Фреймворк: SvelteKit 2 + Svelte 5 (Runes)
Опис: Уніфіковані конвенції для `data-testid`, CSS-класів та назв компонентів — щоб AI, QA та E2E-тести однозначно розпізнавали тип і призначення елемента.
---

# Стандарти `data-testid` та іменування

Цей документ фіксує **обов'язкові** конвенції іменування для:
1. Атрибутів `data-testid` (для E2E-тестів та AI-агентів).
2. CSS-класів (для стилів).
3. Назв Svelte-компонентів та слотів.

Основна мета: щоб **за самою назвою** можна було визначити **тип** елемента (кнопка / поле / контейнер / модалка) та **його роль** у UI.

---

## 🚫 ЖОРСТКІ ОБМЕЖЕННЯ (ANTI-PATTERNS)

| Рівень | Заборона | Правильна альтернатива |
|--------|----------|----------------------|
| **CRITICAL** | Дублікати `data-testid` на одній сторінці (один і той самий ID на 2+ елементах) | Кожен ID — унікальний у межах сторінки. Перевірка у E2E. |
| **CRITICAL** | Змішані конвенції в одному проєкті (`save-btn` поряд з `btn-save` поряд з `save-button`) | Один стандарт на весь проєкт (див. § 1) |
| **HIGH** | Ключовий інтерактивний елемент (`<button>`, `<input>`, `<a href>`, `<select>`, `[role="button"\|"tab"\|"dialog"]`), що бере участь у user-flow, без `data-testid` | Обов'язково додати `data-testid`. **Примітка:** спочатку спробувати `getByRole`/`getByLabel` (Testing Library best practice); `data-testid` — як fallback коли семантики недостатньо (динамічний текст, i18n, дублі по ролі) |
| **HIGH** | Кнопка без суфікса `-btn` (напр. `data-testid="save"`) — неможливо зрозуміти тип з назви | `data-testid="save-btn"` |
| **HIGH** | Імена-«сирітки» (`data-testid="thing"`, `data-testid="x"`, `data-testid="container"`) | Ім'я повинне описувати **домен → елемент → тип** (`auth-email-input`) |
| **HIGH** | CSS-класи з utility-сенсом для логіки (`.btn-blue` як ідентифікатор стану) | Стан — через `aria-*` або `data-state`; класи — оформлення |
| **HIGH** | Suffix-інконсистентність: одне використання `-modal`, інше `-dialog`, третє `-popup` для тих самих елементів | Один термін на тип (див. таблицю § 1.2) |

---

## 1. `data-testid` — Канонічна конвенція

### 1.1 Формат

```text
[<scope>-]<feature>-<role>[-<modifier>]-<type>
```

- **Розділювач:** `-` (kebab-case, **завжди** lowercase ASCII).
- **Тип — завжди останній сегмент (суфікс), НЕ префікс.** Див. § 1.2.1 про обгрунтування.
- **Без skip-сегментів:** не можна писати `auth--email-input` (подвійний дефіс).
- **Без UUID, без `index`, без `[i]`:** для списків — використовувати **ідентифікатор елемента** або порядковий номер: `card-{card.id}` або `card-item-{i}`.
- **ASCII only:** жодних кирилиць, емоджі, спецсимволів.

### 1.2 Канонічна таблиця **типів** (суфіксів) — обов'язкова

| Суфікс | Тип елемента | Приклади |
|--------|--------------|----------|
| `-btn` | Кнопка (`<button>` або `[role="button"]`) | `auth-login-btn`, `card-edit-btn`, `modal-close-btn` |
| `-link` | Гіперпосилання (`<a href>`) | `nav-home-link`, `footer-privacy-link` |
| `-input` | Текстовий ввід (`<input type="text/email/password/number/url/tel">`) | `auth-email-input`, `profile-name-input` |
| `-textarea` | Багаторядковий ввід | `feedback-message-textarea` |
| `-checkbox` | Чекбокс | `settings-notify-checkbox` |
| `-radio` | Радіокнопка | `theme-light-radio`, `theme-dark-radio` |
| `-select` | Випадаючий список (`<select>` або `[role="combobox"]`) | `lang-switcher-select` |
| `-toggle` | Перемикач on/off (`[role="switch"]`) | `notifications-toggle`, `dark-mode-toggle` |
| `-slider` | Повзунок (`<input type="range">`) | `volume-slider` |
| `-form` | `<form>` | `auth-login-form`, `feedback-form` |
| `-fieldset` | Група полів | `address-fieldset` |
| `-label` | `<label>` | `auth-email-label` |
| `-modal` | Модальне вікно (`[role="dialog"]`) | `confirm-delete-modal`, `auth-modal` |
| `-drawer` | Бічна панель | `settings-drawer` |
| `-tooltip` | Tooltip | `help-tooltip` |
| `-toast` | Снек-бар / повідомлення | `error-toast`, `success-toast` |
| `-card` | Картка-контейнер з даними | `user-card`, `news-card-{id}` |
| `-list` | Список (`<ul>`/`<ol>`/`[role="list"]`) | `notifications-list`, `cards-list` |
| `-item` | Елемент списку | `notifications-list-item-{id}` |
| `-tab` | Вкладка | `settings-general-tab`, `settings-account-tab` |
| `-tabs` | Контейнер вкладок | `settings-tabs` |
| `-panel` | Контент вкладки/секції | `settings-general-panel` |
| `-section` | `<section>` верхнього рівня | `hero-section`, `pricing-section` |
| `-header` | `<header>` | `app-header`, `card-header` |
| `-footer` | `<footer>` | `app-footer` |
| `-nav` | `<nav>` | `main-nav`, `breadcrumb-nav` |
| `-menu` | Контекстне/випадаюче меню | `user-menu`, `actions-menu` |
| `-menu-item` | Пункт меню | `user-menu-logout-item` |
| `-icon` | SVG/іконка (декоративна або інформативна) | `chevron-down-icon` |
| `-img` | `<img>` | `avatar-img`, `hero-img` |
| `-badge` | Бейдж/мітка | `unread-count-badge` |
| `-progress` | Прогресс-бар | `upload-progress` |
| `-spinner` | Завантажувач | `page-loading-spinner` |
| `-error` | Повідомлення про помилку (inline) | `auth-email-error`, `form-submit-error` |
| `-hint` / `-help` | Підказка під полем | `auth-password-hint` |
| `-container` | Узагальнений контейнер (коли жоден з типів вище не підходить) | `app-root-container`, `chart-container` |

> **Правило вибору:** якщо елемент **семантично** є кнопкою (`<button>` або `role="button"`) — **завжди** `-btn`, навіть якщо він стилізований під посилання. Тип у `data-testid` відображає **HTML-семантику**, а не візуальний стиль.

#### 1.2.x Маппінг популярних нестандартних суфіксів

Аудит реальних проєктів виявив часті суфікси, яких немає у каноні § 1.2. Ось рекомендоване мапування — не вводити їх як нові типи, а замінити на канонічні:

| Нестандартний суфікс | Замінити на | Чому |
|----------------------|-------------|------|
| `-button` | `-btn` | Канон § 1.2; ризик змішання `-button` з `-btn` (CRITICAL anti-pattern) |
| `-group` | `-fieldset` (для форм) або `-section` (для UI-блоків) | `-group` не несе семантики |
| `-block` | `-section` (semantic) або `-container` (generic) | Поняття «блок» не визначене у § 1.2 |
| `-content` | `-panel` (для tab/section content), `-body` лише як частина композита (`-modal-body`), або взагалі без типу | `-content` неоднозначний |
| `-widget` | конкретний тип (`-card`, `-panel`, `-section`) | «Віджет» — не HTML-семантика |
| `-display` / `-value` / `-text` | без типу-суфікса (read-only текст не потребує testid-типу) або `-label` (якщо це підпис) | Не інтерактивний елемент — не потребує типового маркера |
| `-root` | без суфікса (root компонента) або `-container` | Root і так очевидно за scope |
| `-wrapper` | `-container` | Синоніми; залишити один |
| `-area` | `-section` або `-container` | «Area» неінформативне |
| `-switcher` | `-select` (якщо `<select>`) або `-toggle` / `-radio-group` (за реальним role) | Стиль ≠ семантика; testid повинен віддзеркалювати role |
| `-pulse` / `-animation` | без testid (декорація) або `-icon` | Декоративні елементи зазвичай не потребують testid |

> Якщо проєкт уже має багато `-button` суфіксів і міграція дорога — пріоритет: **усунути змішування `-btn` ↔ `-button`** (один з двох), а потім поступово зводити до канона `-btn`.

### 1.2.1 Чому тип-суфікс, а не префікс?

Тип-суфікс (`save-btn`) обрано як канон з чотирьох причин:

1. **Групування за фічею при алфавітному сортуванні:** `auth-email-input`, `auth-login-btn`, `auth-password-input` — усі `auth-*` поряд у grep, файлових пошуках, результатах E2E. Префікс руйнує фіче-контекст — `btn-auth-login` розкидані між усіма іншими `btn-*`.
2. **Збіг з BEM-елементами:** BEM-конвенція ставить тип-елемент після блоку: `.modal__close-btn`, `.card__title`. `data-testid` віддзеркалює це.
3. **Природна послідовність читання:** "save **button**" реальною мовою (як aria-label `"Save button"`), не «button save». Тип є «іменником», ємність-опис — «визначенням» перед ним.
4. **Збіг з Svelte component-naming:** `<LoginButton>` ↔ `data-testid="auth-login-btn"`. Обидві використовують тип-суфікс.

**Довідка з реальних проєктів:** серед проаналізованих 8 SvelteKit-проєктів (~1700 testid разом) 3 з 4 найбільших — суфіксовий стиль (Slovko, MindStep, teatralo4ka).

> **Альтернативна позиція «префікс» (не рекомендована):** якщо команда вже використовує `btn-*` в існуючих тестах і міграція дорога — **будь-який один стиль краще за змішаний**. Головне правило — **консистентність**.

### 1.3 Scope (Префікс домену)

Для великих проєктів додати домен/feature як **перший сегмент**:

```text
auth-login-btn          // домен: auth
profile-avatar-img      // домен: profile
admin-news-edit-modal   // домен: admin, feature: news
```

Це гарантує **унікальність** `data-testid` між фічами.

### 1.4 Параметризовані ID (списки, динамічні елементи)

- [ ] Для повторюваних елементів — додавати **унікальний параметр** через шаблонний літерал:

```svelte
{#each cards as card (card.id)}
    <article data-testid={`card-${card.id}`}>
        <button data-testid={`card-${card.id}-edit-btn`}>Edit</button>
        <button data-testid={`card-${card.id}-delete-btn`}>Delete</button>
    </article>
{/each}
```

- [ ] Якщо немає природного `id` — використовувати індекс: `card-item-${i}`.
- [ ] **Не** використовувати випадкові `crypto.randomUUID()` для `data-testid` — ID мають бути детерміновані між рендерами.

### 1.5 Композитні компоненти (prop `testId`)

Якщо переюзний компонент (Button, Modal, Input) має багато внутрішніх елементів — приймати `testId` пропом і будувати дочірні ID на його основі:

```svelte
<!-- Modal.svelte -->
<script lang="ts">
    let { testId, title, children, onClose }: {
        testId: string;
        title: string;
        children: Snippet;
        onClose: () => void;
    } = $props();
</script>

<div role="dialog" data-testid={`${testId}-modal`}>
    <header data-testid={`${testId}-modal-header`}>
        <h2 data-testid={`${testId}-modal-title`}>{title}</h2>
        <button data-testid={`${testId}-modal-close-btn`} onclick={onClose}>×</button>
    </header>
    <div data-testid={`${testId}-modal-body`}>
        {@render children()}
    </div>
</div>
```

Використання:
```svelte
<Modal testId="confirm-delete" title="Видалити?" {onClose}>...</Modal>
<!-- Згенерує: confirm-delete-modal, confirm-delete-modal-header, confirm-delete-modal-close-btn, ... -->
```

### 1.6 Перевірка унікальності у CI (обов'язково для проєктів з E2E)

- [x] **CI-gate (обов'язковий):** для кожного проєкту з Playwright/Cypress — глобальний інваріант унікальності `data-testid`. Це єдиний автоматичний захист від CRITICAL anti-pattern «дублікати testid». Аудит 2026-04-28 показав: жоден проєкт цей інваріант не реалізував — це системна прогалина, яку треба закрити.
- [ ] Інваріант запускається **перед** основними E2E-тестами (`tests/_invariants.spec.ts` або `playwright/projects: setup`).
- [ ] Список сторінок (`PAGES`) актуалізується при появі нових ключових routes.

```typescript
// tests/invariants.spec.ts
import { test, expect } from '@playwright/test';

const PAGES = ['/', '/login', '/profile', '/settings'];

for (const path of PAGES) {
    test(`unique data-testid on ${path}`, async ({ page }) => {
        await page.goto(path);
        const ids = await page.$$eval('[data-testid]', els =>
            els.map(el => el.getAttribute('data-testid'))
        );
        const dupes = ids.filter((id, i) => ids.indexOf(id) !== i);
        expect(dupes, `Duplicate data-testid: ${[...new Set(dupes)].join(', ')}`).toEqual([]);
    });
}
```

- [ ] **Не існує готового ESLint-плагіну**, який вимагає `data-testid` на інтерактивних елементах. Альтернатива: написати власне ESLint-правило або використати Playwright інваріант (вище § 1.6) як CI-gate — він простіший і перевіряє фактичний DOM, а не синтаксичне дерево Svelte.

### 1.7 Production-стратегія

**Дві валідні позиції** — оберіть одну і зафіксуйте в GEMINI.md / copilot-instructions.md:

| Стратегія | За | Проти |
|----------|----|--------|
| **A. Видаляти у production** (рекомендація Cypress, MUI, Testing Library) | Менший bundle, неможливість стороннім скриптам чеплятися за внутрішніх ідентифікатори; хакерам важче реконструювати user-flow | Треба окремий staging-білд для QA |
| **B. Зберігати у production** | Зовнішні QA та підтримка можуть писати smoke-тести; один білд для всіх середовищ | +0.5–2 KB gzip; видимість внутрішньої структури |

- [ ] Якщо обрано **A** — налаштувати Vite-плагін (напр. `vite-plugin-strip-testid`) або Svelte preprocess для `mode === 'production'`, **завжди залишаючи** для `staging`/`preview`.
- [ ] Якщо обрано **B** — зафіксувати в документації рішення та причину.
- [ ] **Дефолт v6:** стратегія **A** (видаляти) є безпечнішим варіантом для публічних сайтів.

---

## 2. CSS-класи

### 2.1 Конвенція BEM-lite (рекомендована)

```css
.block {}              /* блок */
.block__element {}     /* елемент блоку */
.block--modifier {}    /* модифікатор стану/варіанту */
```

Приклади:
- `.card`, `.card__title`, `.card__actions`, `.card--featured`
- `.modal`, `.modal__header`, `.modal--small`

> **Альтернатива:** Tailwind / utility-first — допускається, але **тільки якщо обраний на старті проєкту**. Не змішувати з BEM у тому самому компоненті.

### 2.2 Заборони

| Рівень | Заборона | Правильна альтернатива |
|--------|----------|----------------------|
| **HIGH** | CSS-класи з кольором/розміром у назві (`.btn-blue`, `.btn-large`) як ідентифікатори стану | Семантичні назви (`.btn--primary`, `.btn--lg`); стан — через `aria-*` |
| **HIGH** | Класи у `data-testid`-стилі (`.save-btn`) | Класи — для стилів; `data-testid` — для тестів. **Розділяти.** |
| **MEDIUM** | Глобальні селектори (`.container`, `.title` без префіксу) | Scoped стилі Svelte або BEM-блок |

### 2.3 Стан — через атрибути, не класи

```svelte
<!-- ❌ Поганo: стан через клас -->
<button class:active={isActive}>Tab</button>

<!-- ✅ Добре: стан через aria + data -->
<button
    role="tab"
    aria-selected={isActive}
    data-state={isActive ? 'active' : 'inactive'}
    data-testid="settings-general-tab"
>
    Tab
</button>
```

CSS:
```css
[role="tab"][aria-selected="true"] { /* active */ }
[role="tab"][data-state="loading"] { /* loading */ }
```

Це робить стан **видимим** для screen readers, тестів і CSS — без зайвих класів.

---

## 3. Іменування Svelte-компонентів

### 3.1 Файли

- [ ] `PascalCase.svelte` для UI: `UserCard.svelte`, `ConfirmDeleteModal.svelte`.
- [ ] **Тип у назві:** компоненти-модалки → суфікс `Modal`, кнопки-обгортки → `Button`, форми → `Form`, картки → `Card`. Це паралельно з `data-testid`-конвенцією.

| Тип | Суфікс файлу | Приклад |
|-----|--------------|---------|
| Сторінкова секція | `Section` | `HeroSection.svelte` |
| Картка | `Card` | `NewsCard.svelte` |
| Модалка | `Modal` | `ConfirmDeleteModal.svelte` |
| Drawer | `Drawer` | `SettingsDrawer.svelte` |
| Форма | `Form` | `LoginForm.svelte` |
| Іконка | `Icon` | `ChevronDownIcon.svelte` |
| Список | `List` | `NotificationsList.svelte` |

### 3.2 Slot/Snippet props

- [ ] Слоти-сніппети іменуються семантично: `header`, `footer`, `actions`, `empty`, `failed`, `loading`. **Не** `slot1`, `content2`.

### 3.3 Event-handler props

- [ ] Колбеки — у форматі `on{Event}` (Svelte 5 native): `onSubmit`, `onClose`, `onSelect`. **Не** `handle*`, **не** `onClick={...handleClick}` (це plain DOM-handler).

```svelte
<!-- API компонента -->
let { onClose, onSubmit }: {
    onClose: () => void;
    onSubmit: (data: FormData) => Promise<void>;
} = $props();
```

---

## 4. Зв'язок `data-testid` ↔ ім'я компонента ↔ CSS-клас

Канонічна трійка для одного UI-елемента:

| Сутність | Приклад |
|----------|---------|
| Файл компонента | `ConfirmDeleteModal.svelte` |
| `data-testid` (root) | `confirm-delete-modal` |
| BEM-клас (root) | `.confirm-delete-modal` (або просто `.modal` у `<style>` Svelte з scoped class) |
| Внутрішня кнопка ОК | `data-testid="confirm-delete-modal-confirm-btn"` |
| Внутрішня кнопка скасування | `data-testid="confirm-delete-modal-cancel-btn"` |

> Однозначність: за `data-testid` **завжди** можна знайти компонент і навпаки.

---

## 5. Pre-release Checklist

- [ ] Усі інтерактивні елементи мають `data-testid` (з примітки § anti-patterns: спочатку `getByRole`/`getByLabel`, testid — fallback).
- [ ] **E2E-інваріант унікальності `data-testid` (§ 1.6) запущений у CI і проходить** — обов'язково для проєктів з E2E.
- [ ] Усі `data-testid` закінчуються на канонічний тип-суфікс (`-btn`, `-input`, `-modal`...) — див. § 1.2 і мапінг § 1.2.x.
- [ ] Жодного змішування `-btn` ↔ `-button`, `-modal` ↔ `-dialog`, `-toggle` ↔ `-switcher` у одному проєкті.
- [ ] Жодних кирилиць/емоджі/uppercase у `data-testid`.
- [ ] CSS-класи дотримуються однієї конвенції (BEM-lite або Tailwind, не суміш).
- [ ] Стан UI відображається через `aria-*` / `data-state`, а не через CSS-клас.
- [ ] Файли компонентів мають коректний тип-суфікс (`Modal`, `Form`, `Card`...).
- [ ] Реюзні UI-компоненти приймають `testId` пропом і автоматично будують ID для дочірніх елементів.

---

## Пов'язані документи

- Доступність (роль/aria, screen readers) — [ACCESSIBILITY-v6.md](ACCESSIBILITY-v6.md)
- Тестування (Vitest, Playwright, axe-core) — [CODE-QUALITY-v6.md](CODE-QUALITY-v6.md)
- Структура файлів і папок — [PROJECT-STRUCTURE-v6.md](PROJECT-STRUCTURE-v6.md)
- Компоненти та CSS-scoping — [SVELTE-UI-v6.md](SVELTE-UI-v6.md)

