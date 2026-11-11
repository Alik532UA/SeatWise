---
Назва: Стандарти організації проєктної документації
Версія: 6.0
Фреймворк: SvelteKit 2 + Svelte 5 (Runes)
Опис: Структура папки `.private/docs/`, життєвий цикл документів (active → archive), іменування файлів-аналізів, версіювання звітів, READMEs-індекси.
---

# Організація проєктної документації

Цей документ визначає **обов'язкову** структуру внутрішньої проєктної документації — усього, що знаходиться поза публічним `README.md`: аналізи, плани рефакторингу, архітектурні рішення, звіти, замітки, чернетки.

**Мета:** AI-агент і нова людина в проєкті повинні **за 60 секунд** знайти потрібний документ, відрізнити **актуальний** від **архівного**, та зрозуміти, **який документ є канонічним джерелом істини** з кожного питання.

---

## 🚫 ЖОРСТКІ ОБМЕЖЕННЯ (ANTI-PATTERNS)

| Рівень | Заборона | Правильна альтернатива |
|--------|----------|----------------------|
| **CRITICAL** | Документація розкидана: частина в корені, частина у `docs/`, частина у `.private/`, частина у `.private/docs/` | Один кореневий вузол: **`.private/docs/`** (або `docs/` якщо документи публічні) |
| **CRITICAL** | Декілька файлів з однаковою темою без позначення актуальності (`ANIMATION_SPECS.md`, `ANIMATION_SPECS-actual.md`, `ANIMATION_SPECS-new.md`, `ANIMATION_SPECS-old.md`) | Один **канонічний** файл; решта — у `archive/` з префіксом дати |
| **CRITICAL** | Замітки в кореневому каталозі проєкту (`notes-2026-04-02.txt`, `terminology_audit.md`) | Усе у `.private/docs/notes/` або `.private/docs/audits/` |
| **HIGH** | Папки `delete/`, `temp/`, `test01/` з некомітованим хламом, що потрапляє в репо | `.gitignore` для `.private/.temp/`; реальні файли — у структурованих папках |
| **HIGH** | Десятки файлів у одній папці без README-індексу | Кожна папка глибше 1 рівня — має `README.md` зі списком файлів і їхнім призначенням |
| **HIGH** | Звіти-аналізи без дати у назві (`refactoring-review.md`) | Дата у назві: `refactoring-review-YYYY-MM-DD.md` або у frontmatter |
| **HIGH** | Кирилиця у назвах папок/файлів коду (`іmprovements/`) | ASCII-only: `improvements/` |
| **MEDIUM** | Бінарні файли (PDF, PNG, ICNS) розкидані поряд з текстовими доками | Окрема папка `assets/` або `media/` всередині `.docs/` |

---

## 1. Канонічна структура `.private/docs/`

```text
.private/
├── .gitkeep
└── docs/
    ├── README.md                      # 📍 Точка входу: що де лежить
    │
    ├── architecture/                  # Активні архітектурні рішення (ADR-style)
    │   ├── README.md
    │   ├── 001-state-management.md
    │   ├── 002-routing-strategy.md
    │   └── 003-data-flow.md
    │
    ├── analysis/                      # Звіти-аналізи (одноразові)
    │   ├── README.md
    │   ├── 2026-04-15-bundle-size-audit.md
    │   ├── 2026-04-20-a11y-audit.md
    │   └── 2026-04-23-performance-review.md
    │
    ├── plans/                         # Плани рефакторингу/міграції (in-progress)
    │   ├── README.md
    │   ├── svelte5-migration.md
    │   └── i18n-rollout.md
    │
    ├── specs/                         # Технічні специфікації фіч
    │   ├── README.md
    │   ├── animation-specs.md
    │   ├── cms-spec.md
    │   └── auth-flow.md
    │
    ├── notes/                         # Робочі замітки розробника
    │   ├── README.md
    │   └── 2026-04-13-debugging-session.md
    │
    ├── archive/                       # Старі/застарілі документи (не видалені!)
    │   ├── README.md
    │   ├── 2025-12-12-old-architecture.md
    │   └── 2026-01-15-deprecated-state-plan.md
    │
    └── assets/                        # Зображення, PDF, скріншоти, посилання на них з docs
        ├── README.md
        └── screenshots/
```

### 1.1 Правила розташування

- [ ] **Один корінь:** `.private/docs/` (для приватної документації) або `docs/` (для публічної). **Не змішувати.**
- [ ] **Жодних кореневих доків** окрім `README.md`, `LICENSE`, `CHANGELOG.md`, `GEMINI.md` / `.github/copilot-instructions.md`.
- [ ] **`.gitignore` стратегія для `.private/`:**
  - **Обов'язково** ігноровані: `.private/.temp/`, `.private/notes/` (особисті робочі замітки), бінарні PII (скріншоти з даними).
  - **Комітяться в репо** (виняток з ignore): `.private/docs/architecture/`, `.private/docs/specs/`, `.private/docs/plans/`, `.private/docs/analysis/`, `.private/docs/archive/` — це «технічна історія» проєкту, потрібна для AI-агента та нових розробників.
  - Приклад `.gitignore`:
```gitignore
.private/*
!.private/docs/
.private/docs/notes/
.private/.temp/
```
- [ ] **Для соло-проєктів** можна ігнорувати всю `.private/` — але тоді зробити backup окремо (Git LFS, окреме приватне репо), бо втрата ADR — втрата історії рішень.

### 1.2 README.md у кожній папці

Кожна папка глибше 1 рівня **обов'язково** має `README.md` з:
- Призначенням папки (1–2 речення)
- Списком файлів з коротким описом (1 рядок на файл)
- Правилом іменування (якщо специфічне)
- Правилом архівування (коли документ переходить у `archive/`)

**Шаблон:**

```markdown
# `analysis/` — Звіти-аналізи

Одноразові звіти-аналізи стану проєкту: продуктивність, доступність, безпека, bundle size.

## Конвенція іменування

`YYYY-MM-DD-<topic>.md` — дата проведення аналізу + тема.

## Файли

- `2026-04-15-bundle-size-audit.md` — аналіз розміру bundle після Svelte 5 migration
- `2026-04-20-a11y-audit.md` — аудит доступності (axe-core + manual)
- `2026-04-23-performance-review.md` — Lighthouse + Web Vitals

## Архівування

Аналіз вважається архівним через 6 місяців або після виконання його рекомендацій. Перенести у `../archive/`, додати у назву префікс `archived-`.
```

---

## 2. Життєвий цикл документа

```text
draft → active → archived → deleted (тільки якщо повністю некорисний)
```

### 2.1 Draft (чернетка)
- Розташування: `.private/docs/notes/` або `.private/docs/<category>/drafts/`
- Не має статусу «канонічного джерела істини».
- Може бути переписаний без попередження.

### 2.2 Active (активний)
- Канонічне джерело істини з теми.
- Розташування: відповідна категорія (`architecture/`, `specs/`, `plans/`).
- **Один файл на тему.** Якщо потрібна нова версія — або **редагувати**, або **архівувати стару**.

### 2.3 Archived (архівний)
- Розташування: `.private/docs/archive/`
- **Не видаляється** — зберігає історичний контекст для AI та нових розробників.
- Префікс у назві: `archived-` або підпапка за роком: `archive/2025/`, `archive/2026-Q1/`.

### 2.4 Заборонені суфікси у назвах активних документів

| ❌ Заборонено | Чому | ✅ Замість того |
|--------------|------|---------------|
| `_old`, `-old.md` | Не видно дати; не зрозуміло, що актуально | Перенести в `archive/` з датою |
| `_new`, `-new.md` | Тимчасова назва, що залишається назавжди | Перейменувати у канонічне; стару — в archive |
| `_v2`, `_final`, `_FINAL_v2` | Дублює систему контролю версій | Git-історія; для важливих контрольних точок — `archive/2026-04-XX-<topic>.md` |
| `copy`, `(1)`, `(2)` | Артефакти ОС/IDE | Переіменувати або видалити |

> **Правило: один топік — один файл.** Якщо є три варіанти ANIMATION_SPECS — два з них **зараз** мають піти в `archive/` з датою.

---

## 3. Frontmatter (YAML заголовок) — обов'язково

Кожен документ у `architecture/`, `specs/`, `plans/`, `analysis/` починається з YAML-frontmatter:

```yaml
---
Назва: Архітектура управління станом
Версія: 1.2
Дата створення: 2026-03-15
Дата оновлення: 2026-04-23
Статус: active             # draft | active | archived
Автор: ozapolnov
Категорія: architecture
Теги: [state, runes, controllers]
Зв'язані: [001-routing-strategy.md, ../specs/auth-flow.md]
---
```

- [ ] `Статус` синхронний з папкою (active → у відповідній папці; archived → у `archive/`).
- [ ] `Дата оновлення` оновлюється при кожній значущій зміні.
- [ ] `Зв'язані` — relative-посилання на пов'язані документи (для AI-агента).

---

## 4. Конвенції іменування файлів

### 4.1 ADR (Architecture Decision Records)

```text
NNN-<kebab-case-topic>.md
```

Приклади: `001-state-management.md`, `015-firebase-vs-supabase.md`.

- Номер монотонно зростає.
- Тема — короткою фразою (3–6 слів).
- ADR ніколи не перезаписується — якщо рішення змінилося, створюється новий ADR з посиланням на старий через frontmatter `Замінює: 003-...md`.

### 4.2 Звіти-аналізи

```text
YYYY-MM-DD-<topic>.md
```

Приклади: `2026-04-15-bundle-size-audit.md`, `2026-04-23-user-feedback-analysis.md`.

### 4.3 Specs (специфікації фіч)

```text
<feature-name>-spec.md
```

Приклади: `auth-flow-spec.md`, `cms-spec.md`. **Без** версій у назві (версія — у frontmatter).

### 4.4 Notes (замітки)

```text
YYYY-MM-DD-<short-topic>.md
```

Приклади: `2026-04-13-debugging-session.md`, `2026-04-20-vite-config-issue.md`.

### 4.5 Загальні правила

- [ ] **kebab-case** (lowercase + дефіси).
- [ ] **ASCII only** (жодних кирилиць, емоджі, пробілів, спецсимволів).
- [ ] **Дата у форматі ISO 8601** (`YYYY-MM-DD`).
- [ ] **Без зайвих суфіксів** (`_final`, `_v2`).

---

## 5. Папки-сервіси (тимчасові артефакти)

### 5.1 `.private/.temp/`

- Для тимчасових файлів (драфти JSON, зразки даних, чернетки експериментів).
- **Завжди** у `.gitignore`.
- Не використовується як sustainable storage.

### 5.2 `.private/.start/` (стартова інформація)

- Файли `start.md`, onboarding для нової людини в проєкті.
- Альтернатива: `docs/onboarding.md`.

### 5.3 Категорично ЗАБОРОНЕНІ папки

- `delete/`, `to-delete/`, `_delete/` — це не структура; видаліть або переіменуйте у `archive/`.
- `tmp/`, `temp/` — у корені проєкту.
- Папки з кирилицею (`нотатки/`, `іmprovements/`).

---

## 6. Зв'язок з AI-інструкціями

### 6.1 GEMINI.md / copilot-instructions.md

Кореневий `GEMINI.md` (або `.github/copilot-instructions.md`) **обов'язково** містить секцію:

```markdown
## Карта проєктної документації

Канонічна документація — у `.private/docs/`. Точка входу — `.private/docs/README.md`.

- `architecture/` — ADR з архітектурних рішень. Канон.
- `specs/` — специфікації фіч. Канон.
- `plans/` — плани рефакторингу (in-progress).
- `analysis/` — одноразові звіти.
- `notes/` — робочі замітки (не канон).
- `archive/` — застарілі документи (не редагувати).

При суперечності — `architecture/` > `specs/` > `plans/` > `notes/`.
```

### 6.2 Видимість для AI

- [ ] `.geminiignore` / `.copilotignore` **НЕ** виключає `.private/docs/` (інакше AI втрачає контекст).
- [ ] Виключаються лише `.private/.temp/`, `.private/.start/screenshots/`, бінарні файли.

---

## 7. Pre-release Checklist

- [ ] Один кореневий вузол документації (`.private/docs/` АБО `docs/`, не обидва).
- [ ] Кожна підпапка має `README.md` зі списком файлів.
- [ ] Жодного `_old.md` / `_new.md` / `_FINAL.md` у активних папках.
- [ ] Кожен документ у `architecture/`, `specs/`, `plans/`, `analysis/` має YAML-frontmatter зі статусом і датою оновлення.
- [ ] Звіти-аналізи мають дату у назві (`YYYY-MM-DD-<topic>.md`).
- [ ] Жодних кирилиць у назвах папок/файлів.
- [ ] `.private/.temp/` у `.gitignore`.
- [ ] Кореневий `GEMINI.md` / `copilot-instructions.md` посилається на `.private/docs/README.md`.
- [ ] Папки `delete/`, `to-delete/`, `temp/` — відсутні в репозиторії.

---

## 8. Міграція існуючого хаосу — рецепт

Якщо проєкт уже має розкидану документацію — виконати по черзі:

1. **Інвентаризація:** `Get-ChildItem -Recurse -Include *.md,*.txt | Where-Object FullName -notmatch 'node_modules|build|.svelte-kit'` — зібрати повний список.
2. **Класифікація:** для кожного файлу визначити категорію (architecture / spec / analysis / plan / note / archive).
3. **Створити структуру** `.private/docs/{architecture,specs,plans,analysis,notes,archive,assets}/` + README у кожній.
4. **Перенести** файли, **перейменувати** за конвенцією, додати **frontmatter**.
5. **Архівувати** дублікати-варіанти (`-old`, `-new`, `-actual`) з префіксом дати у назві.
6. **Видалити** папки `delete/`, `to-delete/`, `tmp/` (попередньо переконавшись, що там немає корисного).
7. **Створити** `.private/docs/README.md` як точку входу.
8. **Оновити** `GEMINI.md` з картою документації.
9. **Зафіксувати** одним великим коміт-резервом: `chore(docs): reorganize private docs to v6 standard`.

---

## Пов'язані документи

- Файлова структура проєкту — [PROJECT-STRUCTURE-v6.md](PROJECT-STRUCTURE-v6.md)
- AI-інструкції (GEMINI.md, copilot-instructions.md) — [CI-CD-AND-TOOLS-v6.md § 2](CI-CD-AND-TOOLS-v6.md)
- Версіонування коду — [VERSIONING-v6.md](VERSIONING-v6.md)

