---
Назва: Якість Коду — Тестування, TypeScript та CI
Версія: 6.0
Фреймворк: SvelteKit 2 + Svelte 5 (Runes)
Опис: Вимоги до типізації, автоматичного тестування та безперервної інтеграції
---

# Якість Коду: Тестування, TypeScript та CI

Цей документ визначає **обов'язкові** критерії якості коду: стратегію типізації, тестування та CI-інтеграцію.

---

## 🚫 ЖОРСТКІ ОБМЕЖЕННЯ (ANTI-PATTERNS)

| Рівень | Заборона | Правильна альтернатива |
|--------|----------|----------------------|
| **CRITICAL** | Тип `any` | Конкретний інтерфейс, `unknown`, дженерик або `satisfies` |
| **CRITICAL** | `// @ts-ignore` | Виправити type error або `// @ts-expect-error` з коментарем причини |
| **HIGH** | Тести, що залежать від порядку виконання | Повна ізоляція кожного тесту |
| **HIGH** | Пошук елементів у E2E через CSS-класи або XPath | `data-testid` атрибути |
| **HIGH** | Snapshot-тести для логіки | Snapshot — лише для стабільного UI; для логіки — assertion-тести |

---

## 1. TypeScript (Strict Mode)

### 1.1 Конфігурація
- [ ] `tsconfig.json` має `"strict": true`. Implicit `any`, implicit returns та unchecked index access заборонені.

### 1.2 Типізація — баланс між явністю та inference
- [ ] Явні типи **обов'язкові** на межах модулів: параметри публічних функцій, повернені типи експортованих функцій, пропси компонентів.
- [ ] Внутрішні змінні, приватні функції та локальні обчислення **використовують TypeScript inference** — не потрібно явно писати тип, якщо він однозначно виводиться:

```typescript
// ✅ Публічна функція — явний return type
export function formatDate(date: Date): string {
    return date.toLocaleDateString('uk-UA');
}

// ✅ Приватна змінна — inference достатній
const count = items.filter(i => i.active).length; // TypeScript знає, що це number
```

> **Примітка:** Надмірна явна типізація (explicit types everywhere) створює шум і суперечить офіційним рекомендаціям TypeScript. Inference — потужний інструмент, використовуйте його.

### 1.3 Спільні типи
- [ ] Спільні інтерфейси та типи винесені у `src/lib/types/` (або `src/app.d.ts` для SvelteKit-specific типів: `PageData`, `Locals`).
- [ ] Для типів, що використовуються у кількох модулях, створюються окремі файли (наприклад, `types/game.ts`, `types/user.ts`).

### 1.4 Utility Types
- [ ] Активно використовуються вбудовані утиліти (`Partial<T>`, `Pick<T, K>`, `Omit<T, K>`, `Record<K, V>`) для уникнення дублювання.

### 1.5 Іменування файлів
- [ ] Конвенції іменування — у [PROJECT-STRUCTURE-v6.md § 5](PROJECT-STRUCTURE-v6.md).

---

## 2. Документація коду

### 2.1 JSDoc
- [ ] Публічні методи класів-контролерів та сервісів мають JSDoc з описом призначення та параметрів.
- [ ] Приватні, тривіальні методи та очевидні getters **не потребують** JSDoc.

### 2.2 Коментарі
- [ ] Коментарі пояснюють **"Чому"**, а не **"Що"** робить код. Зрозумілі назви змінних та функцій — пріоритет.

---

## 3. Unit-тестування (Vitest)

### 3.1 Ізоляція логіки
- [ ] Бізнес-логіка, функції-утиліти та класи стану тестуються ізольовано через Vitest **без монтування DOM**.
- [ ] Кожен контролер (`.svelte.ts`) має відповідний тест-файл поруч (наприклад, `GameState.test.ts`).

### 3.2 Мокінг
- [ ] Зовнішні залежності (API, Firebase, fetch) мокаються через `vi.mock()` або `vi.fn()`.
- [ ] `localStorage` мокається через `vi.stubGlobal('localStorage', createMockStorage())`.
- [ ] Таймери контролюються через `vi.useFakeTimers()`.

### 3.3 Структура тестів (AAA)
- [ ] Тести дотримуються патерну **Arrange → Act → Assert**:
```typescript
it('should increment counter', () => {
    // Arrange
    const counter = new CounterState();
    // Act
    counter.increment();
    // Assert
    expect(counter.count).toBe(1);
});
```

### 3.4 Edge Cases
- [ ] Тести покривають не лише Happy Path, але й граничні випадки: порожні масиви, null/undefined, перевищення лімітів, некоректні дані.

---

## 4. Component-тестування (@testing-library/svelte)

### 4.1 Коли потрібні Component-тести
- [ ] Складні UI-компоненти з різними станами (Modal, Form, Tabs, Autocomplete) тестуються через `@testing-library/svelte` у Vitest (DOM-середовище `jsdom` або `happy-dom`).
- [ ] Component-тести перевіряють **інтеграцію** шаблону зі станом — те, чого Unit-тести контролерів (без DOM) не покривають.

### 4.2 Приклад
```typescript
import { render, screen, fireEvent } from '@testing-library/svelte';
import Modal from './Modal.svelte';

it('closes on Escape', async () => {
    render(Modal, { props: { open: true, title: 'Test' } });
    await fireEvent.keyDown(window, { key: 'Escape' });
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
});
```

### 4.3 Scope
- [ ] Component-тести — для **базових UI-компонентів** (`Button`, `Modal`, `Input`, `Toast`). Для сторінок і потоків — E2E (Playwright).
- [ ] Доступність компонентів (a11y) — див. [ACCESSIBILITY-v6.md](ACCESSIBILITY-v6.md).

---

## 5. E2E-тестування (Playwright)

### 5.1 Data-TestId
- [ ] Ключові інтерактивні елементи UI мають `data-testid`:
```svelte
<button data-testid="submit-form" onclick={handleSubmit}>Відправити</button>
```

### 5.2 Happy Path
- [ ] Для кожного основного користувацького сценарію написано Playwright-тест від початку до кінця.

### 5.3 A11y Audit
- [ ] Автоматизована перевірка доступності через `@axe-core/playwright` інтегрована хоча б для головної сторінки:
```typescript
import AxeBuilder from '@axe-core/playwright';

test('should not have a11y violations', async ({ page }) => {
    await page.goto('/');
    const results = await new AxeBuilder({ page }).analyze();
    expect(results.violations).toEqual([]);
});
```

### 5.4 Візуальна регресія (опціонально)
- [ ] Для критичних UI-компонентів налаштовано screenshot-порівняння через `expect(page).toHaveScreenshot()`.

---

## 6. CI-інтеграція

### 6.1 Автоматичний запуск
- [ ] Тести запускаються автоматично при кожному Pull Request через GitHub Actions.
- [ ] PR **не може бути змерджений**, якщо тести не пройшли (Branch Protection Rules).

### 6.2 Coverage
- [ ] Встановлено мінімальний поріг покриття для критичної логіки (контролери, сервіси). Рекомендовано ≥70%:
```typescript
// vitest.config.ts
export default defineConfig({
    test: {
        coverage: {
            include: ['src/lib/controllers/**', 'src/lib/services/**'],
            thresholds: { statements: 70, branches: 70 }
        }
    }
});
```

### 6.3 Build Verification
- [ ] CI включає `npm run build` — без помилок і TypeScript warnings.
- [ ] CI включає `npm run check` (`svelte-check`) для валідації Svelte-компонентів.

### 6.4 Лінтинг
- [ ] ESLint з `eslint-plugin-svelte`. CI запускає `npm run lint` і блокує PR з помилками.

---

## Пов'язані документи

- Тестування доступності (axe-core, Lighthouse CI) — [ACCESSIBILITY-v6.md](ACCESSIBILITY-v6.md)
- CI/CD пайплайн та деплой — [CI-CD-AND-TOOLS-v6.md](CI-CD-AND-TOOLS-v6.md)
- Тестування i18n-покриття — [I18N-v6.md](I18N-v6.md)
- Production monitoring — [OBSERVABILITY-v6.md](OBSERVABILITY-v6.md)

