---
Назва: Ізоляція браузерного сховища (Storage Facade)
Версія: 6.0
Фреймворк: SvelteKit 2 + Svelte 5 (Runes)
Опис: Архітектурний патерн Storage Wrapper для запобігання колізіям localStorage/sessionStorage
---

# Ізоляція браузерного сховища (Storage Facade)

## Коли потрібен цей патерн

Цей документ **обов'язковий** для проєктів, де:

- Кілька застосунків розгорнуті на **одному домені** (наприклад, `username.github.io/app1`, `username.github.io/app2`)
- Різні середовища (staging, production) на одному домені

Для проєктів на **окремих доменах** — патерн рекомендований як захист від майбутніх конфліктів.

## Контекст проблеми

Браузер визначає origin як `protocol + host + port`. Отже, `localStorage`, `sessionStorage`, `cookies` та `Cache API` **спільні** для всіх застосунків на одному origin.

| Ризик           | Приклад                                                  |
| --------------- | -------------------------------------------------------- |
| Перезапис даних | Ключ `theme` в App1 перезаписує `theme` в App2           |
| Знищення даних  | `localStorage.clear()` в одному — видаляє дані **всіх**  |
| Конфлікт кешів  | Однакова назва кешу в Cache API у різних Service Workers |

---

## 🚫 ЖОРСТКІ ОБМЕЖЕННЯ (ANTI-PATTERNS)

| Рівень       | Заборона                                               | Правильна альтернатива                             |
| ------------ | ------------------------------------------------------ | -------------------------------------------------- |
| **CRITICAL** | `localStorage.getItem('key')` поза StorageService      | `storage.get('key')`                               |
| **CRITICAL** | `localStorage.setItem('key', val)` поза StorageService | `storage.set('key', val)`                          |
| **CRITICAL** | `localStorage.clear()`                                 | `storage.clear()` (видаляє лише ключі з префіксом) |
| **HIGH**     | Скорочені префікси (`ms_`, `hp_`)                      | Повна назва: `mindstep_`, `hotpaste_`              |

---

## Впровадження

### Крок 1: Створити StorageService

- [ ] **Модуль:** `src/lib/services/storage.ts` з методами `get`, `set`, `remove`, `clear`, `getJSON`, `setJSON`.
- [ ] **Інкапсуляція префіксу:**

```typescript
const PREFIX = 'myapp_'; // Повна назва проєкту

export const storage = {
	get(key: string): string | null {
		return localStorage.getItem(PREFIX + key);
	},
	set(key: string, value: string): void {
		localStorage.setItem(PREFIX + key, value);
	},
	remove(key: string): void {
		localStorage.removeItem(PREFIX + key);
	},
	clear(): void {
		const keysToRemove: string[] = [];
		for (let i = 0; i < localStorage.length; i++) {
			const key = localStorage.key(i);
			if (key?.startsWith(PREFIX)) keysToRemove.push(key);
		}
		keysToRemove.forEach((k) => localStorage.removeItem(k));
	},
	getJSON<T>(key: string): T | null {
		const raw = storage.get(key);
		if (raw === null) return null;
		try {
			return JSON.parse(raw) as T;
		} catch {
			return null;
		}
	},
	setJSON(key: string, value: unknown): void {
		storage.set(key, JSON.stringify(value));
	}
};
```

### Крок 2: Session Storage Wrapper (за потреби)

- [ ] Якщо проєкт використовує `sessionStorage` — аналогічний wrapper `sessionStore` з тим самим префіксом.
- [ ] Wrapper реалізує **той самий контракт**, що й `storage`: `get`, `set`, `remove`, `clear` (мінімум). За потреби — `getJSON`/`setJSON`.
- [ ] `clear()` видаляє **лише** ключі з префіксом проєкту (паралельно до `storage.clear()`), а не весь `sessionStorage`.

```typescript
// src/lib/services/sessionStore.ts
const PREFIX = 'myapp_';

export const sessionStore = {
	get(key: string): string | null {
		return sessionStorage.getItem(PREFIX + key);
	},
	set(key: string, value: string): void {
		sessionStorage.setItem(PREFIX + key, value);
	},
	remove(key: string): void {
		sessionStorage.removeItem(PREFIX + key);
	},
	clear(): void {
		const keysToRemove: string[] = [];
		for (let i = 0; i < sessionStorage.length; i++) {
			const key = sessionStorage.key(i);
			if (key?.startsWith(PREFIX)) keysToRemove.push(key);
		}
		keysToRemove.forEach((k) => sessionStorage.removeItem(k));
	}
};
```

### Крок 3: Заборонити прямий доступ

- [ ] У жодному `.svelte` чи `.ts` файлі (окрім `storage.ts`) немає прямих `localStorage.*` або `sessionStorage.*` викликів.
- [ ] **ESLint (рекомендовано):** Налаштувати `no-restricted-globals` для `localStorage` та `sessionStorage`.

### Крок 4: Міграція існуючих даних

- [ ] **Скрипт міграції** (`src/lib/services/storageMigration.ts`), що запускається один раз:

```typescript
const MIGRATION_KEY = PREFIX + '__migrated';

export function migrateStorage(mapping: Record<string, string>): void {
	if (localStorage.getItem(MIGRATION_KEY)) return;

	for (const [oldKey, newKey] of Object.entries(mapping)) {
		const value = localStorage.getItem(oldKey);
		if (value !== null && localStorage.getItem(PREFIX + newKey) === null) {
			localStorage.setItem(PREFIX + newKey, value);
			localStorage.removeItem(oldKey);
		}
	}
	localStorage.setItem(MIGRATION_KEY, 'true');
}
```

- [ ] Виклик міграції у `+layout.svelte` **до** ініціалізації контролерів.

### Крок 5: Ізоляція Service Worker (Cache API)

- [ ] Назви кешів з префіксом проєкту: `const CACHE_NAME = 'myapp_cache_v1'`.
- [ ] У `activate` SW видаляє лише свої кеші:

```javascript
self.addEventListener('activate', (event) => {
	event.waitUntil(
		caches
			.keys()
			.then((names) =>
				Promise.all(
					names
						.filter((name) => name.startsWith('myapp_') && name !== CACHE_NAME)
						.map((name) => caches.delete(name))
				)
			)
	);
});
```

### Крок 6: Edge-cases

- [ ] **`app.html` inline script:** Якщо тема читається до завантаження Svelte — використовує повний ключ з префіксом (`localStorage.getItem('myapp_theme')`).
- [ ] **Cookies:** Cookies використовують `path=/app-path/` для ізоляції.
- [ ] **IndexedDB:** Назви баз даних мають префікс проєкту.

---

## Довідка: Ізоляція за типом сховища

| Технологія         | Ізольовано за path?     | Рішення                    |
| ------------------ | ----------------------- | -------------------------- |
| **localStorage**   | ❌ Ні                   | StorageService з префіксом |
| **sessionStorage** | ❌ Ні (лише по вкладці) | SessionStore з префіксом   |
| **Cookies**        | ✅ Так (через `path=`)  | Вказувати `path=/app/`     |
| **Cache API**      | ❌ Ні                   | Префікс у назві кешу       |
| **IndexedDB**      | ❌ Ні                   | Префікс у назві бази       |
| **Service Worker** | ✅ Так (scope)          | Вже ізольовано             |

---

## Розширені практики (опціонально)

Ці прийоми **не обов'язкові** — основний об'єктно-літеральний фасад вище достатній для більшості проєктів. Застосовуйте їх, лише якщо проєкт потрапляє в один зі сценаріїв нижче.

### A. DI-інтерфейс `StorageProvider`

**Коли застосовувати:**

- Складний state-management із бізнес-логікою, що залежить від storage (наприклад, `playlistStore`, `settingsService`).
- Потрібно покривати цю логіку юніт-тестами без зачіпання реального `localStorage`.
- Планується підміна імплементації (IndexedDB, віддалений KV-store, in-memory для тестів).

**Антипаттерн:** уводити інтерфейс у малому проєкті без таких потреб — це over-engineering. Object-literal фасад зі стандарту вище повністю достатній.

```typescript
// src/lib/services/storage/storageProvider.ts
export interface StorageProvider {
	getItem(key: string): string | null;
	setItem(key: string, value: string): void;
	removeItem(key: string): void;
	getJson<T>(key: string): T | null;
	setJson(key: string, value: unknown): void;
	clear(): void;
}

export class LocalStorageProvider implements StorageProvider {
	constructor(private readonly prefix: string) {}
	// … реалізація з префіксом і browser-guard
}

// У тестах:
export class MemoryStorageProvider implements StorageProvider {
	/* in-memory */
}
```

Реальний приклад: `Slovko-2026-04-28/src/lib/services/storage/storageProvider.ts`.

### B. Юніт-тести фасаду

**StorageService — критичний сервіс.** Він обов'язково покривається юніт-тестами згідно з [CODE-QUALITY-v6.md](CODE-QUALITY-v6.md) (вимога "критичні сервіси покриті тестами"). Цей документ не дублює вимогу, але наголошує:

- [ ] Тести перевіряють: префіксацію всіх ключів, ізольований `clear()`, JSON serialize/parse, поведінку без `window` (SSR).
- Реальний приклад: `HotPaste-2026-04-28/src/lib/services/storage.test.ts`.
