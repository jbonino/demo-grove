# Phase 0 Retro — Foundation & Ordering

**Date:** 2026-07-18
**Scope:** 000-001 through 000-006 — monorepo scaffold, DB models, seed script, menu screen, cart/checkout/Stripe, confirmation screen.

## Outcome

Exit criteria met: a customer can browse the menu, add items to a cart, and complete a real Stripe test-mode paid order, start to finish, verified end-to-end via Playwright against the real stack (not mocks). 6 tickets, 22 nominal story points, delivered as 5 PRs.

## What went well

- **Verification discipline held up.** Every ticket has a dated verification record with concrete evidence (test counts, what was actually exercised) rather than a bare "tests pass" claim. 000-005 in particular ran its Stripe integration tests against the real Stripe test API and drove real Elements iframes in Playwright — no mocked payment logic anywhere in the critical path.
- **A real bug surfaced by going past unit tests.** 000-004's manual/E2E pass caught a missing CORS middleware that component tests (jsdom, which doesn't enforce CORS) completely missed — it would have silently broken the real browser → API path. This is the payoff of the "test in a real browser before claiming done" step in the workflow; worth keeping non-negotiable for UI tickets.
- **Model-tier picks tracked ticket complexity well** (Haiku for scaffold/seed, Sonnet for schema/UI/Stripe work) — no ticket felt mis-sized for its assigned model in hindsight.

## What didn't go well

- **000-006 (Confirmation screen) was redundant scope.** Checkout (000-005) necessarily needed a screen to redirect to on payment success, so the Confirmation view got built as part of that ticket whether or not it existed separately in the backlog. 000-006 ended up costing zero incremental implementation effort — it was just closed out after the fact. This is a sequencing miss: the two tickets had a hard dependency that should have been caught at ticket-creation time (either merge them into one ticket, or explicitly scope 000-005 to stop short of the confirmation UI with a stub).
  - **How to apply going forward:** when brainstorming a ticket, check whether an adjacent ticket's acceptance criteria already implies the screen/flow being planned. If "given a successful X, the user lands on Y" appears in one ticket's AC, Y's ticket should be checked for actual incremental scope before backlog-ordering assumes it's separate work.
- **One deferred manual step chained across tickets.** 000-003's manual seed verification was pushed to 000-004 (no local Mongo daemon available to smoke-test in isolation). It did get covered implicitly once 000-004 visually verified seeded data rendering correctly, but this was a soft dependency that wasn't written down as a blocking note on 000-004 — it worked out, but was implicit rather than tracked.

## Carry-forward notes for Phase 1

- Loyalty/rewards work will touch the same checkout path (000-005) for points accrual — re-check for the same kind of overlap that caused the 000-006 redundancy before finalizing Phase 1 ticket boundaries.
- Keep the "drive it in a real browser, not just component tests" bar for any new UI ticket (loyalty lookup screen) — that's what caught the CORS gap last time.
