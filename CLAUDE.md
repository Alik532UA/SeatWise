# CLAUDE.md — SeatWise Guidelines

- **Project**: SeatWise (Social Golfer Networking Seating Optimizer)
- **Stack**: SvelteKit 2, Svelte 5 (Runes only), TypeScript (strict), adapter-static.
- **Context**: Read `PROJECT-CONTEXT.md` for invariants.
- **Storage**: Never call `localStorage` directly. Use `$lib/services/storage.ts` with prefix `seatwise_`.
- **Commands**:
  - `npm run check`: Type & component checks.
  - `npm test`: Vitest unit tests.
  - `npm run test:e2e`: Playwright E2E tests.
  - `npm run lint`: Prettier & ESLint checks.
  - `npm run build`: Production build.

