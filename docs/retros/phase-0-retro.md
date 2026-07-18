# Phase 0 Retro — Foundation & Ordering

**Date:** 2026-07-18
**Scope:** 000-001 through 000-006 — monorepo scaffold, DB models, seed script, menu screen, cart/checkout/Stripe, confirmation screen.

## Good

- **Real E2E coverage with Playwright + Stripe.** The 000-005 checkout flow is tested against the actual Stripe test API and drives the real Elements card iframe end-to-end — not mocked. Called out as genuinely impressive and worth protecting as a bar for future payment/critical-path work.

## Bad

- **TDD wasn't actually followed, even though the workflow calls for it.** Each ticket landed as a single squashed commit with implementation and tests together — no red/green/refactor history. I wrote tests alongside or after implementation rather than test-first, despite the ticket workflow specifying Superpowers TDD. The code came out correct, but that's not the same as having followed the process, and it means the tests were shaped by what I already knew the code did rather than by the acceptance criteria alone — a weaker check.
  - **Action for Phase 1:** actually write the failing test first per Gherkin scenario, confirm it fails, then implement. Don't rely on final code quality as a substitute for the process.
- **Seed script didn't load `.env`.** `apps/api/src/scripts/seed.ts` was missing `import "dotenv/config"` — present in `index.ts`, `e2eServer.ts`, and `stripeListen.ts`, but not here. Running `npm run seed` standalone would throw `GROVE_MONGO_URI is not set` unless the shell happened to already have it exported. This is exactly the kind of thing the "manual verification" step in 000-003 should have caught, but that step was deferred to 000-004 and never circled back to test the script in true isolation.
  - **Fixed now:** added the missing import (commit pending).

## Suggestions (for Phase 1+)

- **UI needs interaction feedback.** No loading/disabled/pressed states surfaced during clicks (e.g. "Place Order" while the PaymentIntent is in flight). Worth a pass adding basic loading/disabled states on async actions across Cart/Checkout, and building it in by default for new Phase 1 screens (loyalty lookup).
- **Checkout should support more Stripe payment methods**, e.g. Apple Pay / Google Pay via the Payment Request Button or Stripe's Payment Element, not just manual card entry. Currently only Stripe Elements card input is wired (per 000-005's technical notes, which explicitly scoped to "inline card-on-file UI, not a redirect-based Checkout Session"). Wallet support wasn't in Phase 0's scope, but worth a ticket if the demo should show it off.
- **One-command local dev.** Right now bringing the stack up locally means three separate terminals (`dev:api`, `dev:web`, `stripe:listen`). Wants a single `npm run dev` (or similar) that orchestrates all three together.

## Carry-forward notes for Phase 1

- Loyalty/rewards work will touch the same checkout path (000-005) for points accrual — check for the kind of ticket-boundary overlap that made 000-006 redundant before finalizing Phase 1 ticket scoping.
- Apply real TDD discipline per ticket, not just test coverage after the fact.
- Consider whether "wallet payment methods" and "single dev command" belong as their own small Phase 1 tickets or as cross-cutting polish alongside the loyalty work.
