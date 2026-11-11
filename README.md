# SeatWise 🎯

> **Інтелектуальна система оптимізації розсадки учасників на бізнес-івентах та нетворкінг-сесіях.**

[![Svelte 5](https://img.shields.io/badge/Svelte-5_Runes-FF3E00?logo=svelte&logoColor=white)](https://svelte.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-Strict-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Canon v10](https://img.shields.io/badge/sveltekit--canon-v10-success)](../sveltekit-canon/)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

---

## 📌 Про проєкт

**SeatWise** розв'язує класичну математичну задачу *Social Golfer Problem*: як організувати кілька раундів зустрічей для групи учасників так, щоб кожен познайомився з якомога більшою кількістю нових людей, а повторні зустрічі (колізії) були зведені до нуля.

### Ключові можливості:
- **Математична досконалість через поле Галуа $GF(8)$**: Для конфігурації з 64 учасників (8 столів по 8 місць) алгоритм афінної площини гарантує **9 ідеальних раундів з абсолютно нульовою кількістю повторних зустрічей**.
- **Гнучка жадібна евристика**: Для довільних розмірів груп $(N, T, C)$ застосовується стохастичний оптимізатор суміжності.
- **Модульна система скінів (Skins)**:
  - 📋 **Professional Skin**: Табличний вигляд для модераторів заходу та експорт списків столів.
  - 📱 **Compact Skin**: Оптимізовано для швидкого перегляду зі смартфона.
  - 🎨 **Visual Skin**: 2D-візуалізація розміщення столів та переміщення учасників.
- **Підтримка мов (i18n)**: Українська та англійська через Paraglide.js.
- **Повна конфіденційність**: Усі розрахунки відбуваються локально в браузері.

---

## 🛠️ Технологічний стек

- **Фреймворк**: [SvelteKit 2](https://kit.svelte.dev/)
- **Реактивність**: [Svelte 5 Runes](https://svelte.dev/docs/svelte/overview) (`$state`, `$derived`, `$effect`)
- **Типізація**: [TypeScript](https://www.typescriptlang.org/) (Strict mode)
- **Адаптер деплою**: `@sveltejs/adapter-static` (GitHub Pages)
- **Безпека**: Content Security Policy (CSP) з авто-хешуванням інлайн-скриптів (sha256).

---

## 🚀 Встановлення та запуск

```bash
# Встановлення залежностей
npm install

# Запуск сервера розробки
npm run dev

# Перевірка типів та компонентів
npm run check

# Запуск модульних тестів Vitest
npm test

# Запуск E2E тестів Playwright
npm run test:e2e

# Збірка статичного сайту
npm run build
```

---

## 📐 Архітектура та Канон

Проєкт розроблено у суворій відповідності до стандартів **`sveltekit-canon` v10**.
Деталі дивіться у файлах:
- [PROJECT-CONTEXT.md](PROJECT-CONTEXT.md) — Повний архітектурний контекст та параметри.
- [AGENTS.md](AGENTS.md) — Правила та інваріанти для AI-асистентів.
- [docs/adr/](docs/adr/) — Архітектурні рішення (ADR).
