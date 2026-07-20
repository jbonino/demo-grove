# 003-002 — Deploy Web to Fly.io

## User-facing description

A customer or admin can visit a real URL — not localhost — and use the full storefront and admin panel, talking to the production API.

## Acceptance Criteria

```gherkin
Feature: Web app deployed to Fly.io

  Scenario: Storefront loads from the deployed web app
    Given the web app is deployed to Fly.io
    When a customer visits the live URL
    Then the menu loads, sourced from the production API

  Scenario: Full checkout works end to end on the live URLs
    Given the deployed web app is configured to call the deployed API
    When a customer browses the menu, adds items to cart, and completes checkout with a Stripe test card
    Then they land on the confirmation screen with points earned and a correct balance

  Scenario: Admin panel works on the live URL
    Given the deployed web app is configured to call the deployed API
    When an admin logs in and visits the dashboard
    Then recent orders and loyalty stats are visible, sourced from the production database
```

## Technical notes

- Build `apps/web` for production (`vite build`) with `VITE_API_URL` and `VITE_STRIPE_PUBLISHABLE_KEY` (test mode) set at build time to point at the deployed API (003-001).
- `Dockerfile` + `fly.toml` for `apps/web` (`fly launch`, app name e.g. `grove-web`) serving the built static assets — a lightweight static file server (e.g. `serve` or nginx) is sufficient; no SSR needed since this is a Vite SPA.
- Since `vue-router` runs in history mode, the static server needs a catch-all fallback to `index.html` for client-side routes (`/cart`, `/checkout`, `/admin`, etc.) to avoid 404s on refresh/deep link.
- Depends on 003-001 being deployed first so the production API URL exists to build against.

## Test plan

- **Automated:** none new — ships build/serve config, not application logic; existing component/E2E suites already cover the code being deployed.
- **Manual:**
  1. Deploy: `fly deploy` from `apps/web`, after 003-001's API is live.
  2. Visit `https://grove-web.fly.dev`, confirm menu loads.
  3. Complete a full checkout with a Stripe test card; confirm confirmation screen shows correct points/balance.
  4. Refresh on a non-root route (e.g. `/checkout`) to confirm the history-mode fallback works (no 404).
  5. Log into `/admin`, confirm dashboard shows production data.

## Story point estimate

3

## Suggested implementation model

Sonnet — static deploy is mechanical, but the history-mode fallback and cross-app URL wiring are the kind of detail worth a careful pass rather than a rote one.

## Status

Backlog
