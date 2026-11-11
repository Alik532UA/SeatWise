---
Назва: CI/CD та налаштування інструментарію
Версія: 6.0
Фреймворк: SvelteKit 2 + Svelte 5 (Runes)
Опис: Безпечний деплой через OIDC, стабільний CI та підготовка проєктів для AI-асистентів
---

# CI/CD та налаштування інструментарію

Цей документ визначає **обов'язкові** стандарти автоматичного розгортання та підготовки проєктів до ефективної роботи з AI-асистентами.

---

## 🚫 ЖОРСТКІ ОБМЕЖЕННЯ (ANTI-PATTERNS)

| Рівень | Заборона | Правильна альтернатива |
|--------|----------|----------------------|
| **CRITICAL** | `npm install` в CI-пайплайні | `npm ci` (строго з `package-lock.json`) |
| **CRITICAL** | Сторонні Actions з `contents: write` | Офіційні `actions/upload-pages-artifact` + `actions/deploy-pages` (OIDC) |
| **HIGH** | Деплой з гілки `master` | Перейменувати на `main` (стандарт GitHub) |
| **HIGH** | Відсутність `.geminiignore` / аналогічного ignore для AI | AI витрачає контекст на `node_modules`, `build/`, `.svelte-kit/` |

---

## 1. Пайплайн розгортання (GitHub Actions)

### Контрольний список
- [ ] **Тригер:** `.github/workflows/deploy.yml` запускається при `push` в `main`.
- [ ] **Безпека (OIDC Token):** Деплой через офіційні Actions. Permissions жорстко обмежені:
```yaml
permissions:
  contents: read
  pages: write
  id-token: write
```
- [ ] **Стабільність:** Тільки `npm ci`. Кешування через `cache: 'npm'`.
- [ ] **Валідація перед деплоєм:** `npm ci` → `npm run check` → `npm run lint` → `npm test` → `npm run build` → deploy.
- [ ] **Відсутність застарілих Actions:** Немає `peaceiris/actions-gh-pages` або інших сторонніх деплой-екшенів.

### Еталонний deploy.yml
```yaml
name: Deploy to GitHub Pages
on:
  push:
    branches: [main]
permissions:
  contents: read
  pages: write
  id-token: write
concurrency:
  group: pages
  cancel-in-progress: false
jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: npm
      - run: npm ci
      - run: npm run check
      - run: npm run lint
      - run: npm run check:i18n        # перевірка повноти перекладів (I18N-v6.md)
      - run: npm test -- --run
      - run: npx playwright test        # E2E + axe a11y audit (ACCESSIBILITY-v6.md)
      - run: npx lhci autorun           # Lighthouse CI (OBSERVABILITY-v6.md)
      - run: npm run build
      - uses: actions/upload-pages-artifact@v3
        with:
          path: build
      - id: deployment
        uses: actions/deploy-pages@v4
```

---

## 2. Інструкції для AI-асистентів

### 2.1 Файл контексту (`GEMINI.md` / `copilot-instructions.md`)

#### Контрольний список
- [ ] **Наявність:** У корені — `GEMINI.md` (для Gemini CLI). Для GitHub Copilot — `.github/copilot-instructions.md`. Якщо файлів кілька — вони не суперечать один одному.
- [ ] **Опис архітектури:** Зазначено фреймворк + версію ("SvelteKit 2 + Svelte 5 Runes"), патерн стейт-менеджменту (контролери `.svelte.ts`), потік даних.
- [ ] **Проєктні конвенції (обов'язково):**
  - Префікс `localStorage` (якщо є спільний домен)
  - Заборона Svelte 4 APIs (`writable`, `on:click`, `<slot>`)
  - Стиль іменування файлів
  - Інструменти тестування (Vitest + Playwright)
- [ ] **Anti-patterns:** Явний розділ "НЕ РОБИ" з конкретними прикладами забороненого коду.
- [ ] **Приклади:** 2-3 приклади правильного коду (компонент, контролер, сервіс).

### 2.2 Фільтрація `.geminiignore`

#### Контрольний список
- [ ] **Наявність:** Файл `.geminiignore` у корені.
- [ ] **Мінімальний вміст:**
```
node_modules/
build/
dist/
.svelte-kit/
.private/
*.lock
package-lock.json
```

