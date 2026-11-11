---
Назва: Архітектурні стандарти UI/UX — Теми та Іконки
Версія: 6.0
Фреймворк: SvelteKit 2 + Svelte 5 (Runes)
Опис: Тематизація (Light/Dark) та стандарти SVG-іконок
---

# Архітектурні стандарти UI/UX

Цей документ визначає **обов'язкові** критерії для тематизації та візуальної консистентності інтерфейсу.

Пов'язані документи:

- **Інтернаціоналізація (i18n) — Paraglide, ключі, плюралізація** — див. [I18N-v6.md](I18N-v6.md).
- **Доступність (a11y, WCAG)** — див. [ACCESSIBILITY-v6.md](ACCESSIBILITY-v6.md).
- **Компоненти, snippets, CSS scoping** — див. [SVELTE-UI-v6.md](SVELTE-UI-v6.md).

---

## 🚫 ЖОРСТКІ ОБМЕЖЕННЯ (ANTI-PATTERNS)

| Рівень       | Заборона                                                          | Правильна альтернатива                                       |
| ------------ | ----------------------------------------------------------------- | ------------------------------------------------------------ |
| **CRITICAL** | Системні емодзі (☀️🌙⚙️⚠️) в UI-елементах (кнопки, меню, діалоги) | SVG-іконки з `lucide-svelte` або іншої бібліотеки            |
| **CRITICAL** | `<meta name="color-scheme" content="light">` для світлої теми     | `content="light dark"` (інакше — Force Dark Mode на Android) |
| **HIGH**     | `writable` store для мови/теми                                    | Клас з `$state` у `.svelte.ts`                               |
| **HIGH**     | Сирий `<svg>...</svg>` у розмітці сторінок                        | Окремий компонент або файл у `static/svg/`                   |

> **Виняток для емодзі:** Списки для вибору (emoji picker) та текстовий контент, створений користувачем — емодзі допускаються.

---

## 1. Теми інтерфейсу (Light / Dark)

### 1.1 Inline Script (app.html) — уникнення FOUC

- [ ] У `app.html` **перед** `%sveltekit.body%` розміщено inline `<script>`:

```html
<script>
	(function () {
		const PREFIX = 'myapp_'; // Замінити на свій
		const saved = localStorage.getItem(PREFIX + 'theme');
		const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
		const theme = saved || (prefersDark ? 'dark' : 'light');
		document.documentElement.setAttribute('data-theme', theme);
		const meta = document.querySelector('meta[name="color-scheme"]');
		if (meta) meta.setAttribute('content', theme === 'dark' ? 'dark' : 'light dark');
	})();
</script>
```

### 1.2 Мета-тег color-scheme

- [ ] У `<head>`: `<meta name="color-scheme" content="light dark" />`.
- [ ] **Темна тема:** `content="dark"`.
- [ ] **Світла тема:** `content="light dark"` (**НЕ** `"light"` — провокує Force Dark Mode на Android).

### 1.3 Реактивний клас стану

- [ ] Тема керується класом у `.svelte.ts`:

```typescript
class ThemeController {
	theme = $state<'light' | 'dark'>('light');

	constructor() {
		const saved = storage.get('theme') as 'light' | 'dark' | null;
		if (saved) this.theme = saved;
	}

	toggle() {
		this.theme = this.theme === 'dark' ? 'light' : 'dark';
	}
}
```

- [ ] Синхронізація з DOM та localStorage реалізована через `$effect` **всередині компонента**, що створює цей контролер (або у `+layout.svelte`):

```svelte
<script lang="ts">
	const theme = new ThemeController();
	setContext('theme', theme);

	$effect(() => {
		document.documentElement.setAttribute('data-theme', theme.theme);
		storage.set('theme', theme.theme);
		const meta = document.querySelector('meta[name="color-scheme"]');
		if (meta) meta.setAttribute('content', theme.theme === 'dark' ? 'dark' : 'light dark');
	});
</script>
```

> **Примітка:** `$effect` для DOM-синхронізації працює всередині компонента без `$effect.root`. Використовувати `$effect.root` **тільки** якщо контролер створюється поза компонентом (module-level singleton).

### 1.4 Синхронізація з ОС

- [ ] Контролер слухає `matchMedia('(prefers-color-scheme: dark)')` і змінює тему, якщо користувач **не зафіксував** ручний вибір.

### 1.5 CSS-змінні

- [ ] Кольори визначені через CSS Custom Properties:

```css
:root {
	--bg: #ffffff;
	--text: #1a1a1a;
}
[data-theme='dark'] {
	--bg: #1a1a1a;
	--text: #f0f0f0;
}
```

---

## 2. Локалізація (i18n)

Усі вимоги — у [I18N-v6.md](I18N-v6.md): Paraglide.js, конвенції ключів, плюралізація, RTL, тестування покриття перекладів, SEO `hreflang`.

Короткі правила-нагадування:

- [ ] Жодного хардкоду user-facing рядків — лише через Paraglide messages.
- [ ] `<html lang>` оновлюється автоматично через Paraglide handle у `hooks.server.ts`.
- [ ] Зміна мови — без перезавантаження сторінки.

---

## 3. Іконки та SVG-графіка

### Контрольний список

- [ ] **Бібліотека іконок встановлена:** `lucide-svelte` або аналог (наприклад, `@iconify/svelte`).
- [ ] **Відсутність емодзі в UI:** Системні емодзі вилучені з кнопок, меню, діалогів, повідомлень про помилки. Використовуються SVG-іконки.
- [ ] **Ізоляція SVG:** Жодного сирого `<svg>` у розмітці `.svelte` сторінок. Кастомні SVG винесені в:
  - Компоненти (`Logo.svelte`, `CustomIcon.svelte`) — для SVG з динамічною стилізацією
  - Файли у `static/svg/` — для статичних декоративних SVG
- [ ] **Адаптивність до теми:** Іконки використовують `currentColor` для автоматичного перемикання кольору при зміні теми.
- [ ] **Консистентний розмір:** Усі іконки в однотипних контекстах мають однаковий розмір (напр. 20px для навбару, 16px для кнопок).
