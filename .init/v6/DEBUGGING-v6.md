---
Назва: Стандарти дебагінгу та логування
Версія: 6.0
Фреймворк: SvelteKit 2 + Svelte 5 (Runes)
Опис: Централізований реактивний сервіс логування з плаваючою UI-кнопкою збору звітів
---

# Стандарти дебагінгу та логування

Цей документ визначає **обов'язкову** архітектуру **локального** логування та збору звітів — для розробника під час dev/debug.

Розмежування:
- **Production-моніторинг** (Sentry, RUM, Web Vitals, alerts, uptime) — у [OBSERVABILITY-v6.md](OBSERVABILITY-v6.md).
- **Доменні класи помилок та user-facing маппінг** — у [ERROR-HANDLING-v6.md](ERROR-HANDLING-v6.md).
- **PII у логах** — у [SECURITY-v6.md § 10](SECURITY-v6.md).

---

## 🚫 ЖОРСТКІ ОБМЕЖЕННЯ (ANTI-PATTERNS)

| Рівень | Заборона | Правильна альтернатива |
|--------|----------|----------------------|
| **CRITICAL** | `console.log/warn/error` у компонентах та сервісах для логування бізнес-подій | `logService.info()` / `.warn()` / `.error()` |
| **CRITICAL** | Хардкод версії у логах (`const VERSION = '1.0.3'`) | Версія з build-time або runtime (див. [VERSIONING-v6.md](VERSIONING-v6.md)) |
| **HIGH** | Логування персональних даних (email, пароль, токени) | Анонімізація або повне виключення PII |

> **Примітка щодо `console.log`:** Використання `console.log` для швидкого дебагу під час розробки **допускається** — це нормальний інструмент. Заборона стосується фінального коду, де логування бізнес-подій повинно йти через `logService` для структурованого збору та аналізу. Для дебагу реактивних значень використовуйте `$inspect()`.

---

## 1. Реактивний LogService (`logService.svelte.ts`)

### Контрольний список
- [ ] **Окремий реактивний клас:** Структуроване логування через `src/lib/services/logService.svelte.ts`.
- [ ] **Категоризація:** Кожен лог має категорію (`'ui'`, `'network'`, `'game'`, `'storage'` тощо).
- [ ] **Фільтрація шуму:** Конфіг дозволяє вмикати/вимикати вивід у консоль за категорією:
```typescript
const logConfig: Record<string, boolean> = {
    ui: true,
    network: true,
    game: false,    // вимкнено — не засмічує консоль
    i18n: false,
};
```
- [ ] **Ієрархія рівнів:** Методи `info()`, `warn()`, `error()` з timestamp та категорією.
- [ ] **Реактивний лічильник помилок:**
```typescript
class LogService {
    errorCount = $state(0);

    error(category: string, message: string) {
        this.errorCount++;
        // ...збереження та вивід
    }
}
```
- [ ] **Сесійне збереження:** Останні N записів (≤1000) у масиві + `sessionStorage` для відновлення після перезавантаження.
- [ ] **Production mode:** У production логи **зберігаються** в масив (для звітів), але **не виводяться** у `console` (окрім `error`).

---

## 2. Плаваюча кнопка збору логів (`LogCopyButton.svelte`)

### Логіка видимості

| Середовище | Помилки відсутні | Помилки зареєстровані |
|------------|------------------|----------------------|
| **dev** | ❌ Прихована | ✅ **Видима** |
| **prod** | ❌ Прихована | ❌ Прихована |

```svelte
<script lang="ts">
  import { dev } from '$app/environment';
  // Кнопка видима ТІЛЬКИ у dev-режимі І ТІЛЬКИ коли є зареєстровані помилки
  const isVisible = $derived(dev && logService.errorCount > 0);
</script>

{#if isVisible}
  <button class="log-fab" onclick={copyReport}>
    <!-- ... -->
  </button>
{/if}
```

### Контрольний список
- [ ] **Видимість:** Кнопка прихована за замовчуванням. Показується **тільки** у `dev`-режимі **і** коли `logService.errorCount > 0`.
- [ ] **Плаваюче розташування та розмір:** Кругла кнопка (FAB), закріплена у **лівому нижньому куті** екрана поверх усього контенту (`position: fixed; bottom: 16px; left: 16px; z-index: 9999`). Розмір кнопки: **32px** на комп'ютерній версії та **24px** на мобільній версії.
- [ ] **Динамічний стан (Svelte 5):**

  | Стан | Іконка | Колір |
  |------|--------|-------|
  | Є помилки (початковий) | Цифра (кількість помилок) | Червоний |
  | Після копіювання | `Check` (lucide), 1 сек | Зелений |

- [ ] **Формат звіту:**
```text
--- LOG REPORT ---
DATE: 4/17/2026, 10:30:00 AM
URL: https://example.com/page
DEVICE: Mozilla/5.0 (Linux; Android 14; Pixel 8)...
VERSION: 1.2.45
---
[2026-04-17T08:30:00.000Z] [INFO] [APP] Environment check: production
[2026-04-17T08:30:01.234Z] [ERROR] [NETWORK] Failed to fetch: 503
```
- [ ] **Копіювання:** `navigator.clipboard.writeText()` з fallback для старих браузерів.
- [ ] **Версія у звіті:** Отримана через build-time injection або runtime fetch (див. [VERSIONING-v6.md](VERSIONING-v6.md)).

