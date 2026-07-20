# 003-001 — Deploy to Fly.io

## User-facing description

A customer or admin can visit a single real URL — not localhost — and use the full storefront and admin panel, backed by the production MongoDB Atlas database with the same seed data used locally.

## Acceptance Criteria

```gherkin
Feature: App deployed to Fly.io as a single app

  Scenario: Health check succeeds against the live app
    Given the app is deployed to Fly.io
    When a client sends GET /health
    Then it returns 200 with { ok: true }

  Scenario: Storefront loads from the deployed app
    Given the app is deployed to Fly.io
    When a customer visits the live URL
    Then the menu loads, served by the same app that serves the API

  Scenario: A client-side route survives a refresh
    Given the deployed app
    When a customer refreshes the browser on a client-side route (e.g. /checkout)
    Then the page loads correctly instead of a 404

  Scenario: A real checkout completes against the deployed app
    Given the deployed app is wired to the production Stripe webhook endpoint
    When a customer completes checkout with a Stripe test card
    Then payment_intent.succeeded is delivered to the production webhook
    And an Order and matching LoyaltyEvents are created in the production database

  Scenario: Production database has seed data
    Given the seed script has been run against the production Atlas database
    When a client requests GET /api/menu-items
    Then it returns the seeded menu items

  Scenario: Admin panel works on the live URL
    Given the deployed app
    When an admin logs in and visits the dashboard
    Then recent orders and loyalty stats are visible, sourced from the production database
```

## Technical notes

- Single Fly app (`fly launch` against the existing Fly.io account, e.g. `grove`) serving both the API and the built frontend from one Express process — no second app, no CORS needed (same origin).
- `apps/web` is built (`vite build`) with `VITE_API_URL` pointing at the same origin (e.g. relative `/api`) and `VITE_STRIPE_PUBLISHABLE_KEY` (test mode) baked in at build time.
- Express (`apps/api/src/app.ts`) adds static-file middleware serving `apps/web`'s build output, plus a catch-all route falling back to `index.html` for non-API paths so `vue-router`'s history-mode routes (`/cart`, `/checkout`, `/admin`, etc.) survive a refresh/deep link — mounted *after* the existing `/api/*` and `/health` routes so it doesn't shadow them.
- Single `Dockerfile` (multi-stage: build `apps/web` and `apps/api`, copy both into one runtime image) and one `fly.toml`.
- Fly secrets (see `apps/api/.env.example` for the full local-dev list): `GROVE_MONGO_URI` (existing Atlas cluster's connection string), `STRIPE_SECRET_KEY` / `STRIPE_WEBHOOK_SECRET` — **test mode** keys, matching local dev — plus `GROVE_ADMIN_PASSWORD` / `GROVE_SESSION_SECRET` for the admin panel (Phase 2), which the app fails to boot without.
- Register a new webhook endpoint in the Stripe dashboard (test mode) pointing at `https://grove.fly.dev/api/stripe/webhook`; use its signing secret for `STRIPE_WEBHOOK_SECRET` (this replaces the local `stripe listen` flow for the deployed environment only — local dev is unaffected).
- Run `npm run seed --workspace apps/api` once against the production `GROVE_MONGO_URI` (manual step, not part of the deploy pipeline) so the live demo has the same menu/rewards/loyalty-history data as local dev.

## Test plan

- **Automated:** none new for the deploy config itself; the static-serving/SPA-fallback behavior added to `apps/api/src/app.ts` is covered by new Vitest cases in `app.test.ts` (TDD'd alongside this ticket).
- **Manual (local, already done during implementation):** built the Docker image locally and ran it alongside a throwaway Mongo container — confirmed `/health` (200), `/` (200, menu assets load), `/checkout` refreshed via direct fallback request (200, serves `index.html`), `/api/menu-items` (200), and `/api/does-not-exist` (404, does not fall back to `index.html`). Also caught and fixed a pre-existing bug where the root `npm run build` built workspaces in the wrong order and failed on a truly clean checkout (`packages/shared` must build before `apps/api`/`apps/web`).
- **Manual (live, still required before marking Done):**
  1. Deploy: `fly deploy` from the repo root.
  2. `curl https://grove.fly.dev/health` → expect `200 { ok: true }`.
  3. Visit `https://grove.fly.dev`, confirm menu loads.
  4. Run seed script against production `GROVE_MONGO_URI`; confirm via `curl https://grove.fly.dev/api/menu-items` that seeded items come back.
  5. Refresh on a non-root route (e.g. `/checkout`) to confirm the history-mode fallback works (no 404).
  6. Register the production Stripe webhook endpoint; complete one test checkout end-to-end with a Stripe test card and confirm the confirmation screen shows correct points/balance, and the Order/LoyaltyEvents land in the production database.
  7. Log into `/admin`, confirm dashboard shows production data.

## Story point estimate

3

## Suggested implementation model

Sonnet — mostly config/wiring, but the static-serving + history-mode fallback, webhook registration, and secrets wiring have enough real risk (breaking routing or payment flow) to warrant more than a mechanical pass.

## Status

Active
