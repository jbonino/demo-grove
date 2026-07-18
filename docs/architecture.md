# FarmShare — Architecture

Technical reference for implementation details that don't belong in `design.md` (product vision) or `product-roadmap.md` (phase sequencing). This doc grows as tickets are implemented — treat it as the current source of truth for how the system is actually built, updated whenever a ticket's implementation settles something not yet documented here.

---

## Stack

- **Frontend/Backend:** Go, `html/template` (server-rendered HTML) — monolithic server, single binary
- **Interactivity:** HTMX (server returns HTML fragments; no client-side state, no JSON API for UI)
- **CSS:** Bulma
- **Database:** SQLite
- **Payments:** Stripe (test mode through Beta; live mode from Phase 3 readiness check onward)
- **Deployment:** Undecided — Vercel's serverless model + ephemeral disk doesn't fit a long-lived Go binary with a SQLite file on a persistent volume. Deferred until Phase 0 needs to deploy.

**HTMX-native principle:** UI routes return HTML. Handlers inspect the `HX-Request` header to choose between a full-page render (base layout + Bulma chrome) and a bare swappable fragment. Machine-to-machine endpoints (Stripe webhook, health check) stay non-HTML.

---

## Data Model

SQLite tables. Field semantics carry over from the original schemas.

### `farms`

| Column | Type | Notes |
|---|---|---|
| `name` | text | |
| `story` | text | Displayed on the home page |
| `location` | text | |
| `pickup_point` | text | Free-text fixed weekly pickup window/location (design.md §9), e.g. "Saturdays 9am-12pm at the farm stand, 123 Main St" — no structured day/time/address fields yet (ticket 001-002). Defaults to `''`; `internal/db.Migrate` adds this column to pre-001-002 databases via `ALTER TABLE` since `CREATE TABLE IF NOT EXISTS` doesn't touch existing tables |

### `boxes`

| Column | Type | Notes |
|---|---|---|
| `cycle_date` | text/date | Which billing/delivery cycle this box belongs to |
| `items` | text | Contents list — stored as JSON text (resolved in 000-002; no separate `box_items` table) |
| `size` | text (`small`, `medium`, `large`) | |
| `price` | integer | In cents, matching Stripe convention |

### `customers`

| Column | Type | Notes |
|---|---|---|
| `name` | text | |
| `email` | text | |
| `stripe_customer_id` | text | |

### `subscriptions`

| Column | Type | Notes |
|---|---|---|
| `customer_id` | integer FK → `customers` | |
| `box_size` | text (`small`, `medium`, `large`) | |
| `billing_cycle` | text (`weekly`, `biweekly`) | |
| `stripe_subscription_id` | text | |
| `status` | text (`active`, `canceled`, ...) | Mirrors Stripe subscription status |

**Multi-tenancy note:** none of these tables carry a `farm_id` yet, since Phase 0–1 are single-tenant. Per `product-roadmap.md` §6.4, tag every event/row with `farm_id` starting no later than Phase 2 — retrofitting it before Phase 4's multi-tenant launch is far cheaper than after.

---

## Project Layout

Settled in ticket 000-001 (scaffold).

```
cmd/farmshare/main.go        entrypoint: reads env, opens+migrates DB, starts server
cmd/seed/main.go             entrypoint: reads env, opens+migrates DB, inserts seed data
internal/db/db.go            db.Open(dsn) — opens SQLite and pings
internal/db/schema.go        db.Migrate(conn) — creates tables if not present (safe on every startup)
internal/store/              Farm/Box/Customer/Subscription structs + Insert*/Upsert*/Get* functions against *sql.DB
internal/seed/seed.go        seed.Run(conn) — inserts one hardcoded Farm and one Box
internal/server/server.go    New(db, cfg) http.Handler — registers all routes, builds the Stripe client
internal/server/checkout.go, confirmation.go, webhook.go   Stripe Checkout/webhook handlers (000-003)
internal/server/templates/   base.html (layout) + per-page content templates (go:embed)
```

- **SQLite driver:** `modernc.org/sqlite` (pure Go, no cgo) — builds on Windows without a C toolchain.
- **Templates:** parsed once at startup via `template.ParseFS` over an embedded `templates/*.html`, all sharing one template set. `base.html` defines `{{define "layout"}}` (full document, taking `.Title` and `.Body` as pre-rendered `template.HTML`). Each page defines its own uniquely-named content template (`home`, `box`, ...) — a shared name like `content` would collide across pages parsed into the same set, since only the last-parsed definition of a given name survives. The `render` helper in `server.go` executes the page's content template to a buffer first; for a full-page request it wraps that buffer in `layout`, for an HTMX request (non-empty `HX-Request` header) it writes the buffer directly as a bare fragment.
- **Template funcs:** `dollars` formats an integer cents value as a `$X.XX` string (registered via `template.FuncMap` at parse time).
- **Config (env vars):** `FARMSHARE_ADDR` (default `:8080`), `FARMSHARE_DB` (default `farmshare.db`), `FARMSHARE_BASE_URL` (default `http://localhost:8080`, used to build Stripe Checkout success/cancel redirect URLs), `FARMSHARE_ADMIN_PASSWORD` and `FARMSHARE_SESSION_SECRET` (farmer admin login, ticket 001-001 — no defaults; a startup warning logs if either is unset), plus the Stripe keys. See `.env.example`. On startup `internal/config.LoadDotenv` loads a `.env` file from the working directory if present — real environment variables win over `.env`, and a missing file is not an error.
- **Stripe SDK:** `github.com/stripe/stripe-go/v81`, via `client.API` (`internal/server.newStripeClient`) rather than the package-level global client, so tests can point requests at a local `httptest.Server` through `Config.StripeAPIBaseURL` instead of the real Stripe API.

### Routes

| Route | Handler | Notes |
|---|---|---|
| `GET /` | `homeHandler` | Storefront home: seeded farm's name/story + link to the box page; full page vs. HTMX fragment |
| `GET /box` | `boxHandler` | Current CSA box's items/size/price (with a "Subscribe" button posting to `/checkout`) plus the farm's pickup point (or a friendly empty state for either if unconfigured) |
| `GET /health` | `healthHandler` | Plain-text `ok` after a live SQLite ping |
| `POST /checkout` | `checkoutHandler` | Creates a Stripe Checkout Session (subscription mode) priced at the current box's price, billed weekly, and redirects the shopper to it |
| `GET /confirmation` | `confirmationHandler` | Reads `session_id` from the query string, retrieves the Checkout Session from Stripe, and looks up the resulting `Subscription` by Stripe subscription ID; shows an "active" or "still processing" message depending on whether the webhook has landed yet, plus the farm's pickup point |
| `POST /webhooks/stripe` | `stripeWebhookHandler` | Verifies the `Stripe-Signature` header against `STRIPE_WEBHOOK_SECRET` (400 on failure, no DB writes). On `checkout.session.completed`, upserts `Customer` and `Subscription` keyed by Stripe customer/subscription ID (idempotent — safe for webhook redelivery) |
| `GET/POST /admin/login` | `adminLoginPageHandler`/`adminLoginHandler` | Farmer admin login form; checks the submitted password against `FARMSHARE_ADMIN_PASSWORD` and, on success, sets a signed session cookie (ticket 001-001) |
| `POST /admin/logout` | `adminLogoutHandler` | Clears the session cookie and redirects to `/admin/login` |
| `GET /admin` | `adminDashboardHandler` | Admin landing page linking to the box editor and subscriber list; requires a valid session |
| `GET/POST /admin/box` | `adminBoxHandler` | Edit form (GET) and update (POST) for the current box's contents/price via `store.UpdateBox`, plus the farm's pickup point via `store.UpdatePickupPoint` (ticket 001-002's settings folded into this screen); requires a valid session |
| `GET /admin/subscribers` | `adminSubscribersHandler` | Lists current subscribers (name, email, box size) via `store.ListSubscribers`; requires a valid session |

## Service Wiring

- **SQLite:** single shared connection pool held for the process lifetime (the server is a long-lived binary, not per-request serverless functions)
- **Stripe:** test-mode keys via env vars; webhook endpoint verifies signatures before processing any event
- **Health check:** a `/health` endpoint (plain text/200) confirms live SQLite connectivity
- **Billing cycle:** hardcoded to `weekly` in the Checkout Session created by `checkoutHandler` — design.md §4 says billing cycle is "farm's choice at setup," but farm-level configuration doesn't exist yet (single farm, single box, Phase 0). Revisit when farm setup/configuration is built.
- **Farmer admin auth (ticket 001-001):** single shared password (`FARMSHARE_ADMIN_PASSWORD`) — no user table, since Phase 1 is single-farm/single-admin. On login, `internal/server/session.go` signs a cookie (`HMAC-SHA256` over an expiry timestamp, keyed by `FARMSHARE_SESSION_SECRET`); there is no server-side session store, so validity is entirely determined by the signature and expiry. `requireAdminSession` middleware (`internal/server/admin_login.go`) guards every `/admin/*` route except `/admin/login`.

*(This section will fill in further as later tickets add marketing automation, task management, and certification record-keeping infrastructure.)*
