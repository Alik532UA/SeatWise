---
Назва: Продуктивність та Оптимізація
Версія: 6.0
Фреймворк: SvelteKit 2 + Svelte 5 (Runes)
Опис: Lazy loading, управління пам'яттю, оптимізація бандлу, рендерингу та SSG
---

# Продуктивність та Оптимізація

Цей документ визначає **обов'язкові** та рекомендовані практики оптимізації продуктивності для SvelteKit + Svelte 5 проєктів.

---

## 🚫 ЖОРСТКІ ОБМЕЖЕННЯ (ANTI-PATTERNS)

| Рівень | Заборона | Правильна альтернатива |
|--------|----------|----------------------|
| **CRITICAL** | `setTimeout` / `setInterval` без очищення при демонтажі | Cleanup у `return` з `$effect` |
| **CRITICAL** | `addEventListener` без `removeEventListener` | Cleanup у `$effect` |
| **HIGH** | Імпорт важких бібліотек у головний бандл | Динамічний `import()` |
| **HIGH** | Зображення без `loading="lazy"` (below the fold) | `loading="lazy"` + `width`/`height` |
| **HIGH** | Необмежені обробники `scroll`/`resize`/`input` | `throttle` або `debounce` |

---

## 1. Оптимізація Зображень та Медіа

### Контрольний список
- [ ] **Сучасні формати:** Зображення конвертовані у WebP або AVIF. JPEG/PNG — лише як fallback.
- [ ] **Lazy Loading:** Усі зображення нижче першого екрану мають `loading="lazy"`:
```svelte
<img src="/images/photo.webp" alt="Description" loading="lazy" width="800" height="600" />
```
- [ ] **Розміри:** Кожен `<img>` має `width` та `height` для запобігання Layout Shift (CLS).
- [ ] **Responsive Images:** Для різних розмірів екрану:
```html
<img
  srcset="/images/hero-480.webp 480w, /images/hero-800.webp 800w"
  sizes="(max-width: 600px) 480px, 800px"
  src="/images/hero-800.webp"
  alt="Hero"
/>
```
- [ ] **Enhanced Image (SvelteKit):** Де можливо, використовується `@sveltejs/enhanced-img` для автоматичної оптимізації:
```svelte
<script>
  import { enhanced_img } from '@sveltejs/enhanced-img';
</script>
<enhanced:img src="./hero.jpg" alt="Hero" />
```

---

## 2. Lazy Loading Компонентів та Модулів

### Контрольний список
- [ ] **Динамічні імпорти:** Важкі компоненти (модальні вікна, редактори, чарти) завантажуються через `import()`:
```svelte
<script lang="ts">
  import type { Component } from 'svelte';
  let EditorComponent: Component | null = $state(null);

  async function openEditor() {
    const module = await import('./HeavyEditor.svelte');
    EditorComponent = module.default;
  }
</script>

{#if EditorComponent}
  <EditorComponent />
{/if}
```

> **Примітка:** У Svelte 5 `<svelte:component this={...}>` deprecated. Динамічні компоненти рендеряться напряму як `<Component />`.

- [ ] **Бібліотеки:** Важкі залежності (highlight.js, chart.js, DOMPurify) імпортуються лише при потребі, а не на верхньому рівні.

---

## 3. Throttling та Debouncing

### Контрольний список
- [ ] **Scroll / Resize:** Обробники обгорнуті у `throttle` (100-200ms). Або краще — використати `IntersectionObserver` / `ResizeObserver`:
```typescript
// Перевага IntersectionObserver — працює off-main-thread
$effect(() => {
    const observer = new IntersectionObserver(([entry]) => {
        isVisible = entry.isIntersecting;
    });
    observer.observe(element);
    return () => observer.disconnect();
});
```
- [ ] **Input / Search:** Обробники текстового вводу обгорнуті у `debounce` (300ms).

---

## 4. Управління Пам'яттю (Memory Leaks)

### Контрольний список
- [ ] **Таймери:** Усі `setTimeout` / `setInterval` очищаються у cleanup `$effect`:
```typescript
$effect(() => {
    const id = setInterval(() => { /* ... */ }, 1000);
    return () => clearInterval(id);
});
```
- [ ] **Observers:** `ResizeObserver`, `IntersectionObserver`, `MutationObserver` — `.disconnect()` при демонтажі.
- [ ] **Event Listeners:** `addEventListener` → парний `removeEventListener` у cleanup.
- [ ] **Підписки:** WebSocket, Firebase `onSnapshot`, EventSource — відписка при демонтажі.
- [ ] **Перевірка:** При SPA-навігації кількість слухачів **не зростає** (DevTools > Performance Monitor).

---

## 5. Оптимізація Бандлу

### Контрольний список
- [ ] **Аналіз розміру:** Періодична перевірка через `rollup-plugin-visualizer` або `vite-bundle-analyzer`.
- [ ] **Tree Shaking:** Іменовані імпорти (`import { Sun } from 'lucide-svelte'`) замість `import * as Lucide`.
- [ ] **Перевірка залежностей:** Перед додаванням пакету — перевірка розміру на [bundlephobia.com](https://bundlephobia.com). Пакети >50KB потребують обґрунтування.
- [ ] **Code Splitting:** SvelteKit автоматично робить code-splitting по маршрутах. Перевірити, що `+layout.svelte` не імпортує зайвих модулів (вони потраплять у бандл кожної сторінки).

---

## 6. Рендеринг та Реактивність

### Контрольний список
- [ ] **Мінімізація зони впливу:** Часто оновлювані значення (таймери, анімації) ізольовані від великих списків. Оновлення лічильника не повинно перерендерювати весь список.
- [ ] **`{#key}` з розумом:** Використовувати **тільки** коли потрібне повне перемонтування (зміна сутності), а не для кожного оновлення.
- [ ] **Віртуалізація списків:** Для списків >100 елементів — віртуалізація (рендер тільки видимих елементів).

---

## 7. Web Workers (для CPU-інтенсивних задач)

### Контрольний список (застосовувати за потреби)
- [ ] **Показання:** Операції, що блокують UI на >100ms (парсинг великих JSON, криптографія, обробка зображень) — виносяться у Web Worker.
- [ ] **Vite Worker Import:**
```typescript
const worker = new Worker(new URL('./heavyTask.worker.ts', import.meta.url), { type: 'module' });
worker.postMessage(data);
worker.onmessage = (e) => { result = e.data; };
```

---

## 8. Prerendering та SSG (SvelteKit)

### Контрольний список
- [ ] **Статичні сторінки:** Сторінки без серверної динаміки (лендинг, about, контакти) мають `export const prerender = true`.
- [ ] **Повна статика:** Якщо весь сайт статичний — `@sveltejs/adapter-static`.
- [ ] **Вимкнення зайвої гідрації:** Для інформаційних сторінок без інтерактиву:
```typescript
export const csr = false; // Svelte не завантажується на клієнті
```
- [ ] **SSR + CSR:** Для інтерактивних сторінок — стандартна поведінка SvelteKit (SSR + hydration). Не змінювати без причини.

