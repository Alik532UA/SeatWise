---
Назва: Svelte 5 — Компоненти та CSS
Версія: 6.0
Фреймворк: SvelteKit 2 + Svelte 5 (Runes)
Опис: Архітектурні правила проєктування Svelte-компонентів та scoped-стилізації. Доступність — окремий документ.
---

# Svelte 5: Проєктування Компонентів та UI

Цей документ фіксує **обов'язкові** правила створення візуальних компонентів та управління стилями.

Пов'язані документи:

- **Доступність (a11y, ARIA, focus, контраст, screen readers)** — див. [ACCESSIBILITY-v6.md](ACCESSIBILITY-v6.md). Цей документ містить лише компонент-специфічні a11y-нюанси Svelte.
- **Тематизація (CSS-змінні, теми)** — див. [UI-UX-v6.md](UI-UX-v6.md).
- **Реактивний стан, контролери, snippets з логікою** — див. [SVELTE-CORE-v6.md](SVELTE-CORE-v6.md).

---

## 🚫 ЖОРСТКІ ОБМЕЖЕННЯ (ANTI-PATTERNS)

| Рівень       | Заборона                                       | Правильна альтернатива                                            |
| ------------ | ---------------------------------------------- | ----------------------------------------------------------------- |
| **CRITICAL** | `<slot>` та `<slot name="...">`                | `{#snippet name(params)}...{/snippet}` + `{@render name(params)}` |
| **CRITICAL** | `on:click`, `on:input`, `on:keydown`           | Нативні атрибути: `onclick`, `oninput`, `onkeydown`               |
| **CRITICAL** | `{@html untrustedString}` без санітизації      | `{@html DOMPurify.sanitize(string)}` або рендер через DOM API     |
| **CRITICAL** | `onclick` на `<div>` / `<span>` без role       | `<button>` для дій, `<a>` для навігації                           |
| **CRITICAL** | `<svelte:component this={Component}>`          | Пряме використання: `<Component />` або `{@render snippet()}`     |
| **HIGH**     | 20+ булевих пропсів (`showIcon`, `isSmall`...) | Snippets та композиція компонентів                                |
| **HIGH**     | Глобальні CSS-селектори без `:global()`        | Scoped `<style>` або явний `:global()`                            |

---

## 1. Архітектура Компонентів

### 1.1 Пропси та Типізація

- [ ] Усі пропси розпаковуються через `let { ... } = $props()` з явним TypeScript інтерфейсом.
- [ ] Дефолтні значення задаються через деструктуризацію:

```svelte
<script lang="ts">
	interface Props {
		title: string;
		variant?: 'primary' | 'secondary';
		onclick?: () => void;
	}
	let { title, variant = 'primary', onclick }: Props = $props();
</script>
```

- [ ] `$bindable()` використовується **лише** для полів форм (`<input bind:value>`) або випадків, де двостороння прив'язка критично необхідна.

### 1.2 Snippets замість Slots

- [ ] Для передачі фрагментів UI між компонентами використовуються виключно `{#snippet}` та `{@render}`:

```svelte
<!-- Card.svelte -->
<script lang="ts">
	import type { Snippet } from 'svelte';
	let { header, body }: { header: Snippet; body: Snippet } = $props();
</script>

<!-- Parent.svelte -->
<Card>
	{#snippet header()}
		<h2>Title</h2>
	{/snippet}
	{#snippet body()}
		<p>Content</p>
	{/snippet}
</Card>
<div class="card">
	{@render header()}
	{@render body()}
</div>
```

### 1.3 Динамічні компоненти (Svelte 5)

- [ ] `<svelte:component this={...}>` **не використовується** — у Svelte 5 він deprecated.
- [ ] Для рендерингу динамічних компонентів — присвоїти змінній та використати напряму:

```svelte
<script lang="ts">
	import type { Component } from 'svelte';
	let DynamicWidget: Component | null = $state(null);

	async function loadWidget() {
		const module = await import('./HeavyWidget.svelte');
		DynamicWidget = module.default;
	}
</script>

{#if DynamicWidget}
	<DynamicWidget />
{/if}
```

### 1.4 Презентаційні (Dumb) Компоненти

- [ ] Презентаційні компоненти **не мають** побічних ефектів, не імпортують глобальні сервіси і залежать виключно від переданих пропсів та snippets.
- [ ] Розумні (Smart) компоненти знаходяться на рівні `+page.svelte` або в `sections/` — вони з'єднують контролери з UI.

### 1.5 Keyed Blocks

- [ ] Для списків або елементів, що вимагають повного перемонтування при зміні даних (наприклад, зміна ID сутності), обов'язково використовується `{#key id}`:

```svelte
{#key selectedUserId}
	<UserProfile userId={selectedUserId} />
{/key}
```

### 1.6 Error Boundaries

- [ ] Критичні секції UI загорнуті у `<svelte:boundary>` для ізоляції помилок рендерингу:

```svelte
<svelte:boundary onerror={(error) => logService.error('render', error.message)}>
	<RiskyWidget />
	{#snippet failed(error, reset)}
		<p>Помилка: {error.message}</p>
		<button onclick={reset}>Спробувати знову</button>
	{/snippet}
</svelte:boundary>
```

- [ ] На рівні маршрутів наявний `+error.svelte` для обробки помилок завантаження даних.

### 1.7 Базові UI-компоненти

- [ ] У проєкті створені перевикористовувані базові компоненти (`Button.svelte`, `Modal.svelte`, `Input.svelte`), які інкапсулюють стилі, a11y та поведінку.
- [ ] Вони приймають `{...restProps}` для прокидання нативних HTML-атрибутів:

```svelte
<script lang="ts">
	import type { HTMLButtonAttributes } from 'svelte/elements';
	interface Props extends HTMLButtonAttributes {
		variant?: 'primary' | 'secondary';
	}
	let { variant = 'primary', children, ...restProps }: Props = $props();
</script>

<button class="btn btn-{variant}" {...restProps}>
	{@render children?.()}
</button>
```

---

## 2. A11y у Svelte-компонентах

Повний набір a11y-вимог (WCAG 2.2 AA, ARIA-патерни, контраст, screen readers, ручне тестування) — у [ACCESSIBILITY-v6.md](ACCESSIBILITY-v6.md). Тут — лише **Svelte-специфічні** нюанси.

### 2.1 ESLint-плагін

- [ ] У `eslint.config.js` увімкнено правила `eslint-plugin-svelte` для a11y:
  - `svelte/a11y-click-events-have-key-events`
  - `svelte/a11y-no-static-element-interactions`
  - `svelte/a11y-label-has-associated-control`
  - `svelte/a11y-media-has-caption`
  - `svelte/a11y-no-noninteractive-element-interactions`
- [ ] CI блокує PR при будь-якому warning із цієї групи.

### 2.2 Snippets та focus management

- [ ] При використанні `{#if}` або `{#key}` для перемонтування інтерактивного блоку — фокус переміщується явно через `bind:this` + `element.focus()` у `$effect`, інакше screen reader втрачає контекст.
- [ ] Модальні snippet-и (`{#snippet failed(...)}` у `<svelte:boundary>`) забезпечують `role="alert"` для повідомлень про помилку.

### 2.3 Базові UI-компоненти і a11y

- [ ] `Button.svelte`, `Modal.svelte`, `Input.svelte` мають **вбудовані** a11y-атрибути (focus ring, `aria-label` для icon-only, focus trap для модалок) — споживачі не повинні щоразу думати про це.

---

## 3. CSS та Стилізація

### 3.1 Scoped Styles

- [ ] Стилі пишуться у блоці `<style>` компонента — вони автоматично scoped.
- [ ] Глобальні стилі допускаються **лише** через `:global()` або у файлі `app.css` для reset/variables/typography.

### 3.2 Theming (CSS Custom Properties)

- [ ] Кольори, відступи та шрифти — через CSS-змінні. Деталі та конвенції — у [UI-UX-v6.md § 1](UI-UX-v6.md).

### 3.3 Респонсивність

- [ ] Макет адаптивний — використовуються `min-width` media queries (Mobile First) або Container Queries.
- [ ] Інтерактивні елементи мають мінімальний touch target **24×24px** (WCAG 2.2 AA, обов'язково) — рекомендовано **44×44px** на мобільних.
