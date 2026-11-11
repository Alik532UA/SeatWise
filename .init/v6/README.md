---
Назва: Індекс інструкцій v6
Версія: 6.0
Фреймворк: SvelteKit 2 + Svelte 5 (Runes)
Опис: Канонічний перелік усіх документів пакету v6 з коротким описом кожного
---

# Інструкції для AI-асистентів — v6

Цей пакет визначає **обов'язкові** архітектурні стандарти для SvelteKit 2 + Svelte 5 (Runes) проєктів.

---

## 📂 Зміст (за доменами)

### Архітектура та структура

| Файл | Опис |
|------|------|
| [PROJECT-STRUCTURE-v6.md](PROJECT-STRUCTURE-v6.md) | Файлова структура: корінь, `static/`, `src/lib/`, `src/routes/`, іменування |
| [SVELTE-CORE-v6.md](SVELTE-CORE-v6.md) | Реактивний стан: `$state`, `$derived`, `$effect`, класи-контролери, `.reset()` |
| [SVELTE-UI-v6.md](SVELTE-UI-v6.md) | Компоненти, snippets, CSS scoping, Svelte-специфічні a11y-нюанси |
| [SVELTEKIT-DATA-v6.md](SVELTEKIT-DATA-v6.md) | Data loading: `+page.ts`, `+page.server.ts`, form actions, hooks |

### Якість та безпека

| Файл | Опис |
|------|------|
| [CODE-QUALITY-v6.md](CODE-QUALITY-v6.md) | TypeScript strict, Unit/Component/E2E тестування, coverage, CI |
| [TESTID-AND-NAMING-v6.md](TESTID-AND-NAMING-v6.md) | Конвенції `data-testid`, CSS-класи, назви компонентів |
| [ERROR-HANDLING-v6.md](ERROR-HANDLING-v6.md) | Доменні класи помилок, `<svelte:boundary>`, user-facing маппінг |
| [SECURITY-v6.md](SECURITY-v6.md) | CSP, CSRF, XSS, HTTPS, secrets, PII, tab-blur захист |

### UX та доступність

| Файл | Опис |
|------|------|
| [UI-UX-v6.md](UI-UX-v6.md) | Теми (Light/Dark), CSS-змінні, SVG-іконки |
| [ACCESSIBILITY-v6.md](ACCESSIBILITY-v6.md) | WCAG 2.2 AA: семантика, ARIA, фокус, контраст, axe-core, Lighthouse |
| [I18N-v6.md](I18N-v6.md) | Paraglide.js, ключі, плюралізація, RTL, SEO hreflang, CI перевірка |

### Операції та інфраструктура

| Файл | Опис |
|------|------|
| [PERFORMANCE-v6.md](PERFORMANCE-v6.md) | Бюджет продуктивності, code splitting, lazy loading, Core Web Vitals |
| [OBSERVABILITY-v6.md](OBSERVABILITY-v6.md) | Sentry, RUM, Web Vitals, Lighthouse CI, health endpoint, алерти, GDPR |
| [DEBUGGING-v6.md](DEBUGGING-v6.md) | Локальне логування, LogService, DevTools, bug-report |
| [STORAGE-NAMESPACE-v6.md](STORAGE-NAMESPACE-v6.md) | localStorage namespace, версіонування, міграції |
| [VERSIONING-v6.md](VERSIONING-v6.md) | SemVer, app-version.json, changelog |
| [DOCUMENTATION-v6.md](DOCUMENTATION-v6.md) | Структура `.private/docs/`, ADR, life-cycle, frontmatter |
| [CI-CD-AND-TOOLS-v6.md](CI-CD-AND-TOOLS-v6.md) | GitHub Actions OIDC, Sentry source maps, AI-інструкції |

---

## 🔗 Перехресні посилання

Кожен документ містить секцію **"Пов'язані документи"** з посиланнями на суміжні теми. Це дозволяє AI-агенту завантажити лише потрібний домен, а при потребі — перейти до деталей.
