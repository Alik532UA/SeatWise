# GEMINI.md — SeatWise

## Проєкт

SeatWise — інтелектуальна система оптимізації розсадки учасників нетворкінгу за алгоритмами полів Галуа та стохастичної евристики.

> **Обов'язково звертайся до [PROJECT-CONTEXT.md](PROJECT-CONTEXT.md) та [AGENTS.md](AGENTS.md).**
> Там визначено канонічні правила v10, префікси сховища `seatwise_`, стандарти Runes та заходи безпеки.

## Ключові інваріанти:

1. Виключно Svelte 5 Runes (`$state`, `$derived`, `$props`).
2. Доступ до браузерного сховища лише через `$lib/services/storage.ts`.
3. Чистий математичний шар у `$lib/algorithms/seating.ts`.
4. Перевірка коду через `npm run check && npm test && npm run lint`.
