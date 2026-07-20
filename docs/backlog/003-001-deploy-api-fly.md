# 003-001 — Deploy API to Fly.io

## User-facing description

The API that powers ordering, loyalty, and admin runs on a real, publicly reachable URL instead of only on localhost, backed by the production MongoDB Atlas database with the same seed data used locally.

## Acceptance Criteria

```gherkin
Feature: API deployed to Fly.io

  Scenario: Health check succeeds against the live API
    Given the API is deployed to Fly.io
    When a client sends GET /health
    Then it returns 200 with { ok: true }

  Scenario: A real checkout completes against the deployed API
    Given the deployed API is wired to the production Stripe webhook endpoint
    When a customer completes checkout with a Stripe test card
    Then payment_intent.succeeded is delivered to the production webhook
    And an Order and matching LoyaltyEvents are created in the production database

  Scenario: Production database has seed data
    Given the seed script has been run against the production Atlas database
    When a client requests GET /api/menu-items
    Then it returns the seeded menu items
```

## Technical notes

- `Dockerfile` for `apps/api` (multi-stage: install workspace deps, build TS, run compiled output) and `fly.toml` (`fly launch` against the existing Fly.io account, app name e.g. `grove-api`).
- Fly secrets: `GROVE_MONGO_URI` (existing Atlas cluster's connection string), `STRIPE_SECRET_KEY` / `STRIPE_WEBHOOK_SECRET` — **test mode** keys, matching local dev.
- Register a new webhook endpoint in the Stripe dashboard (test mode) pointing at `https://grove-api.fly.dev/api/stripe/webhook`; use its signing secret for `STRIPE_WEBHOOK_SECRET` (this replaces the local `stripe listen` flow for the deployed environment only — local dev is unaffected).
- Update CORS origin allowlist (`apps/api/src/app.ts`) to include the deployed web app's Fly URL (from 003-002) alongside the existing local dev origin.
- Run `npm run seed --workspace apps/api` once against the production `GROVE_MONGO_URI` (manual step, not part of the deploy pipeline) so the live demo has the same menu/rewards/loyalty-history data as local dev.

## Test plan

- **Automated:** none new — this ticket ships infra config, not application logic; existing Vitest suites already cover the code being deployed.
- **Manual:**
  1. Deploy: `fly deploy` from `apps/api`.
  2. `curl https://grove-api.fly.dev/health` → expect `200 { ok: true }`.
  3. Run seed script against production `GROVE_MONGO_URI`; confirm via `curl https://grove-api.fly.dev/api/menu-items` that seeded items come back.
  4. Register the production Stripe webhook endpoint; complete one test checkout end-to-end (once 003-002's web app is deployed) and confirm the Order/LoyaltyEvents land in the production database.

## Story point estimate

3

## Suggested implementation model

Sonnet — mostly config/wiring, but the CORS + production webhook registration steps have enough real risk (breaking payment flow, misconfigured secrets) to warrant more than a mechanical pass.

## Status

Backlog
