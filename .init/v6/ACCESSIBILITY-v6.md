---
Назва: Доступність (Accessibility / A11y)
Версія: 6.0
Фреймворк: SvelteKit 2 + Svelte 5 (Runes)
Опис: Єдиний документ-джерело істини для вимог доступності (WCAG 2.2 AA) — семантика, клавіатура, фокус, ARIA, контраст, screen readers, автоматизований аудит
---

# Доступність (Accessibility / A11y)

Цей документ — **єдине джерело істини** для всіх a11y-вимог проєкту. Усі правила побудовані навколо **WCAG 2.2 AA** як мінімального обов'язкового стандарту.

Пов'язані документи:

- Семантика компонентів та `aria-*` у Svelte — див. [SVELTE-UI-v6.md](SVELTE-UI-v6.md).
- Локалізація (атрибут `lang`) — див. [I18N-v6.md](I18N-v6.md).
- Анімації та `prefers-reduced-motion` — див. [UI-UX-v6.md](UI-UX-v6.md).
- Автоматизований a11y-аудит у CI — див. [CODE-QUALITY-v6.md](CODE-QUALITY-v6.md).

---

## 🚫 ЖОРСТКІ ОБМЕЖЕННЯ (ANTI-PATTERNS)

| Рівень       | Заборона                                                             | Правильна альтернатива                                                      |
| ------------ | -------------------------------------------------------------------- | --------------------------------------------------------------------------- |
| **CRITICAL** | `onclick` на `<div>` / `<span>` без `role` та `tabindex`             | `<button>` для дій, `<a>` для навігації                                     |
| **CRITICAL** | Іконка-кнопка без `aria-label` чи `<span class="visually-hidden">`   | Доданий `aria-label` із дієсловом-дією                                      |
| **CRITICAL** | Контраст тексту < 4.5:1 (звичайний) або < 3:1 (великий)              | Перевірка через DevTools / axe; виправлення палітри                         |
| **CRITICAL** | `outline: none` на focusable елементі без альтернативного індикатора | Залишити нативний outline або задати кастомний `:focus-visible` стиль       |
| **CRITICAL** | Інтерактивний елемент із touch target < 24×24px (WCAG 2.2 SC 2.5.8)  | Мінімум 24×24px; рекомендовано 44×44px на мобільних                         |
| **HIGH**     | Модалка без focus trap і без повернення фокусу                       | Focus trap всередині + `aria-modal="true"` + повернення фокусу при закритті |
| **HIGH**     | `aria-hidden="true"` на елементі, що містить focusable дітей         | Прибрати `aria-hidden` або винести focusable за межі                        |
| **HIGH**     | Динамічні повідомлення (toast, помилки форми) без `aria-live`        | `aria-live="polite"` для інфо, `"assertive"` — лише для критичних           |
| **HIGH**     | Зміна мови без оновлення `<html lang>`                               | Оновлювати атрибут разом зі зміною `locale`                                 |

---

## 1. Семантичний HTML

### Контрольний список

- [ ] Для **дій** використовується `<button type="button">`. Для **навігації** — `<a href>`.
- [ ] `<a>` без `href` (заглушка) не використовується — це не focusable за замовчуванням.
- [ ] Заголовки (`<h1>`–`<h6>`) йдуть **по порядку** без пропусків рівнів. На сторінці — рівно один `<h1>`.
- [ ] Списки (`<ul>`, `<ol>`) використовуються для всіх семантичних списків (а не `<div>` з мітками).
- [ ] Landmarks: `<header>`, `<nav>`, `<main>`, `<footer>`, `<aside>` присутні на кожній сторінці. На сторінці — рівно один `<main>`.
- [ ] Виняток: `<div role="button" tabindex="0" onclick onkeydown>` — лише для drag handles, slider thumbs та подібних кастомних контролів, для яких немає нативного елемента.

---

## 2. Клавіатурна навігація

### Контрольний список

- [ ] Усі інтерактивні елементи доступні з клавіатури (`Tab` / `Shift+Tab`).
- [ ] Порядок фокусу логічно відповідає візуальному порядку. `tabindex` > 0 **заборонено** (порушує природний порядок).
- [ ] Кастомні кнопки (`role="button"`) обов'язково обробляють `Enter` та `Space`:

```svelte
<div
  role="button"
  tabindex="0"
  onclick={handleClick}
  onkeydown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleClick(); } }}
>
```

- [ ] Меню та dropdown'и підтримують `Arrow Up/Down`, `Home`, `End`, `Esc` (за патерном WAI-ARIA Authoring Practices).
- [ ] Модалка ловить `Esc` для закриття.
- [ ] Skip-link на початку `<body>`:

```svelte
<a href="#main-content" class="skip-link">Перейти до основного вмісту</a>
```

---

## 3. Фокус-менеджмент

### Контрольний список

- [ ] **Видимий focus indicator** для всіх focusable елементів. Якщо нативний `outline` прибраний — заміна через `:focus-visible`:

```css
:focus-visible {
	outline: 2px solid var(--focus-ring);
	outline-offset: 2px;
}
```

- [ ] При відкритті модалки фокус переміщується **всередину** (на перший focusable або на `aria-labelledby`-заголовок).
- [ ] При закритті модалки фокус **повертається** на елемент, що її відкрив.
- [ ] **Focus trap** усередині модалки: `Tab` циклить між focusable елементами, не виходить за межі.
- [ ] При SPA-навігації фокус переміщується на `<main>` або `<h1>` нової сторінки (інакше screen reader продовжить читати з попереднього місця).

---

## 4. ARIA та підписи

### 4.1 Іконки-кнопки

- [ ] Кнопки без видимого тексту мають `aria-label` із **дієсловом-дією**:

```svelte
<button aria-label="Закрити діалог" onclick={close}>
	<X />
</button>
```

- [ ] Альтернатива — `<span class="visually-hidden">Закрити діалог</span>`.

### 4.2 Форми

- [ ] Кожен `<input>`, `<select>`, `<textarea>` має пов'язаний `<label>` через `for`/`id` або обгортку.
- [ ] Поля з помилками: `aria-invalid="true"` + `aria-describedby="field-error"`, де `id` помилки збігається.
- [ ] Обов'язкові поля: атрибут `required` (нативний) + візуальна позначка (`*`).
- [ ] Підказки для полів — через `aria-describedby`, а не лише `placeholder` (placeholder зникає при вводі).

### 4.3 Live regions

- [ ] Toast / Snackbar / статусні повідомлення обгорнуті у `aria-live="polite"`:

```svelte
<div role="status" aria-live="polite" aria-atomic="true">
	{statusMessage}
</div>
```

- [ ] `aria-live="assertive"` — **тільки** для критичних оголошень (помилка платежу, втрата сесії).

### 4.4 Модалки та діалоги

- [ ] Модалка має `role="dialog"` (або `alertdialog`) + `aria-modal="true"` + `aria-labelledby` (на заголовок).
- [ ] Контент позаду модалки приховано від screen reader через `inert` атрибут (новий стандарт) або `aria-hidden="true"` на сусідніх елементах.

### 4.5 Декоративні vs значущі іконки

- [ ] Декоративні SVG-іконки: `aria-hidden="true"` + `focusable="false"`.
- [ ] Значущі іконки (несуть інформацію): `role="img"` + `aria-label="..."`.

---

## 5. Зображення та медіа

### Контрольний список

- [ ] Усі `<img>` мають атрибут `alt`:
  - Інформативні: `alt="..."` з описом змісту.
  - Декоративні: `alt=""` (порожній — screen reader пропустить).
- [ ] Складні зображення (графіки, інфографіка) мають довгий опис через `aria-describedby` або текстовий блок поруч.
- [ ] Відео мають субтитри (`<track kind="captions">`) для важливого аудіо-контенту.
- [ ] Аудіо-контент має текстову транскрипцію.
- [ ] Жодного контенту, що передається **виключно** кольором (наприклад, червоний/зелений статус) — додавати іконку або текст.

---

## 6. Контраст і колір (WCAG AA)

### Контрольний список

- [ ] **Звичайний текст:** контраст ≥ **4.5:1** до фону.
- [ ] **Великий текст** (≥18pt або ≥14pt bold): контраст ≥ **3:1**.
- [ ] **UI-компоненти та focus indicator:** контраст ≥ **3:1** до сусідніх кольорів.
- [ ] Жодна інформація не передається **тільки кольором** (помилки форми — також іконка/текст).
- [ ] Палітра перевірена в обох темах (Light / Dark) через [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/) або вбудовані DevTools.

---

## 7. Анімації та рух

### Контрольний список

- [ ] Анімації поважають `prefers-reduced-motion`:

```css
@media (prefers-reduced-motion: reduce) {
	*,
	*::before,
	*::after {
		animation-duration: 0.01ms !important;
		animation-iteration-count: 1 !important;
		transition-duration: 0.01ms !important;
		scroll-behavior: auto !important;
	}
}
```

- [ ] Жодна анімація не перевищує **3 спалахів/секунду** (ризик світлочутливої епілепсії).
- [ ] Автовідтворюване відео/каруселі мають кнопку «Пауза».
- [ ] Parallax / scroll-driven анімації вимикаються при `prefers-reduced-motion`.

---

## 8. Розмір touch target (WCAG 2.2 SC 2.5.8)

### Контрольний список

- [ ] Інтерактивні елементи на сенсорних екранах — **мінімум 24×24 CSS-пікселів** (WCAG 2.2 AA).
- [ ] Рекомендовано: **44×44px** (Apple HIG, Material Design).
- [ ] Якщо елемент менший — забезпечується відступ навколо нього (combined target) ≥ 24×24px.

---

## 9. Мова та читабельність

### Контрольний список

- [ ] `<html lang="uk">` — обов'язково. Атрибут оновлюється при зміні мови (див. [I18N-v6.md § 4](I18N-v6.md)).
- [ ] Для вкраплень іншою мовою — `<span lang="en">...</span>`.
- [ ] Текст можна збільшити до **200%** без втрати функціональності та горизонтального скролу (responsive verstka).
- [ ] Допускається `text-spacing` overrides користувача (line-height, letter-spacing) без обрізання.

---

## 10. Автоматизований аудит

### Контрольний список

- [ ] У CI запущено `@axe-core/playwright` хоча б на головну сторінку та критичні маршрути:

```typescript
import AxeBuilder from '@axe-core/playwright';

test('homepage has no a11y violations', async ({ page }) => {
	await page.goto('/');
	const results = await new AxeBuilder({ page })
		.withTags(['wcag2a', 'wcag2aa', 'wcag22aa'])
		.analyze();
	expect(results.violations).toEqual([]);
});
```

- [ ] Lighthouse CI (опціонально): `npx @lhci/cli autorun` із порогом `accessibility ≥ 95`.
- [ ] ESLint: `eslint-plugin-svelte` із a11y-правилами (`a11y-click-events-have-key-events`, `a11y-no-static-element-interactions` тощо) — увімкнені та blocking у CI.

---

## 11. Ручне тестування

### Контрольний список (хоча б раз перед релізом)

- [ ] Пройти весь критичний шлях лише з клавіатурою (без миші).
- [ ] Перевірити з screen reader: NVDA (Windows), VoiceOver (macOS/iOS), TalkBack (Android).
- [ ] Збільшити масштаб браузера до 200% — перевірити, що нічого не обрізається.
- [ ] Увімкнути «Reduce motion» в ОС — перевірити, що анімації вимкнено.
- [ ] Темна та світла тема — обидві проходять контраст.

---

## 12. Pre-Release A11y Checklist

- [ ] Axe-аудит у CI — 0 violations на ключових сторінках
- [ ] Lighthouse Accessibility ≥ 95
- [ ] Усі форми мають labels та aria-describedby для помилок
- [ ] Усі іконки-кнопки мають aria-label
- [ ] `<html lang>` коректний і оновлюється
- [ ] Skip-link присутній і працює
- [ ] Focus indicator видимий у всіх станах
- [ ] Модалки мають focus trap і повертають фокус
- [ ] Контраст перевірений у Light + Dark
- [ ] `prefers-reduced-motion` респектується
