# Grove — Architecture

Technical reference for implementation details that don't belong in `design.md` (product vision) or `product-roadmap.md` (phase sequencing). This doc grows as tickets are implemented — treat it as the current source of truth for how the system is actually built, updated whenever a ticket's implementation settles something not yet documented here.

---

## Stack

- **Frontend:** Vue 3 + TypeScript, Vite
- **Backend:** Express + TypeScript
- **Database:** MongoDB (Atlas free tier)
- **Payments:** Stripe (test mode)
- **Deployment:** Fly.io (API and web as separate Fly apps)

*(Filled in further as tickets are implemented — routes, data model, project layout, service wiring.)*

---

## Project Layout

npm workspaces monorepo:

- `apps/api` — Express + TypeScript API
- `apps/web` — Vue 3 + TypeScript + Vite storefront
- `packages/shared` — shared TS types/DTOs consumed by both apps

## Database

Mongoose for schema definition/validation. Connection is opened once at API
startup via `connectDb()` (`apps/api/src/db.ts`), reading `GROVE_MONGO_URI`
from the environment (see `apps/api/.env.example`).

### Data Model

**MenuItem** (`apps/api/src/models/MenuItem.ts`)
- `name: string` (required)
- `description: string` (required)
- `priceCents: number` (required)
- `category: string` (required)

**Order** (`apps/api/src/models/Order.ts`)
- `items: { menuItem: ObjectId ref MenuItem, quantity: number, unitPriceCents: number }[]`
- `subtotalCents: number` (required)
- `phone: string` (required)
- `pickup: { mode: "asap" | "scheduled", time: string | null }` (required)
- `stripePaymentIntentId: string | null` (unique + sparse index — enforces idempotent Order creation from webhook redelivery)
- `status: "pending" | "paid" | "failed"` (default `"pending"`)
- `createdAt: Date` (default now)

Orders are created by the Stripe webhook handler, not by `POST /api/orders` — see Payments below. A payment that fails never produces an Order document at all (not a "failed"-status one), matching the AC that no order exists on a declined card.

`Order` also carries `rewardRedeemed: { name, discountAmountCents } | null` (set when a reward discounted the order), `pointsEarned: number`, and `pointsBalanceAfter: number` (both default `0`) — written by the webhook handler alongside the Order itself.

**LoyaltyEvent** (`apps/api/src/models/LoyaltyEvent.ts`)
- `phone: string` (required)
- `orderId: ObjectId | null` ref `Order`
- `type: "earn" | "redeem"` (required)
- `points: number` (required — positive for `earn`, negative for `redeem`)
- `createdAt: Date` (default now)

A phone number's balance is never stored directly — it's derived by summing `LoyaltyEvents.points` for that phone (`apps/api/src/loyalty/balance.ts#getPointsBalance`, a Mongo aggregation), keeping history auditable per `design.md` §6.

**Reward** (`apps/api/src/models/Reward.ts`)
- `name: string` (required)
- `description: string` (required)
- `pointsCost: number` (required)
- `discountAmountCents: number` (required) — beyond `design.md` §6's table; needed to know how much a redeemed reward discounts the charge.

### Seed Data

`apps/api/src/scripts/seed.ts` runs, in order: `seedMenuItems`, `seedRewards` (`apps/api/src/seed/rewards.ts` — fixed 3-reward catalog), and `seedLoyaltyHistory` (`apps/api/src/seed/loyaltyHistory.ts` — 35 synthetic customers with 1-5 paid `Order`s each and matching `earn` `LoyaltyEvent`s; a subset get a simulated past redemption, and a subset are left just under the cheapest reward's threshold). Each seed function deletes-then-inserts its own data, so re-running the script doesn't duplicate. `seedLoyaltyHistory` requires `MenuItems` and `Rewards` to already be seeded (reads current prices/reward thresholds to generate realistic data) and scopes its `Order` cleanup to its own `pi_seed_*`-prefixed `stripePaymentIntentId`s so it doesn't touch real orders.

## API Routes

- `GET /health` — returns `200 { ok: true }` if the DB connection is live, `503 { ok: false }` otherwise.
- `GET /api/menu-items` — returns all `MenuItem` documents as `MenuItemDTO[]` (`packages/shared`), sorted by category then name. CORS is enabled (`cors` middleware) so the Vite dev server (5173) can call the API (3001) cross-origin in local dev.
- `POST /api/orders` — recomputes the subtotal server-side from current `MenuItem` prices (does not trust client-sent prices), creates a Stripe PaymentIntent with the cart snapshot (items/phone/pickup) stored in PaymentIntent `metadata`, and returns `{ clientSecret, paymentIntentId, subtotalCents, discountedSubtotalCents }`. Does **not** create an `Order`. Accepts an optional `rewardId`: if present, looks up the `Reward`, verifies the phone's live balance (`getPointsBalance`) covers its `pointsCost` — rejecting with `400` before any PaymentIntent is created if not — then charges `subtotalCents - discountAmountCents` (floored at 0) instead of the full subtotal. Reward name/discount/pointsCost are carried in PaymentIntent metadata (`rewardName`, `rewardDiscountAmountCents`, `rewardPointsCost`) alongside the pre-discount `subtotalCents`, since the webhook has no other way to know them once the PaymentIntent exists.
- `GET /api/orders/by-payment-intent/:paymentIntentId` — returns the `Order` for a PaymentIntent once the webhook has created it, or `404` if it hasn't landed yet. Polled by the frontend after client-side payment confirmation (`apps/web/src/api/orders.ts#pollForOrder`).
- `GET /api/rewards` — returns all `Reward` documents as `RewardDTO[]` (`packages/shared`), sorted by `pointsCost` ascending.
- `POST /api/stripe/webhook` — verifies the Stripe signature (`stripe-signature` header, `STRIPE_WEBHOOK_SECRET`) against the **raw** request body (mounted with `express.raw()` *before* the global `express.json()` middleware in `app.ts` — order matters). On `payment_intent.succeeded`, checks whether an `Order` already exists for that `stripePaymentIntentId` and short-circuits if so (redelivery is a no-op, including for the `LoyaltyEvents` below). Otherwise creates the `Order` from the PaymentIntent's metadata via `findOneAndUpdate` with `$setOnInsert` + `upsert: true`, and writes the matching `LoyaltyEvents`: an `earn` event for `ceil(chargedAmountCents / 100)` points (the *discounted* amount, i.e. `paymentIntent.amount`), plus a `redeem` event for `-rewardPointsCost` when a reward was applied. `Order.pointsEarned`/`pointsBalanceAfter` are computed from the phone's balance immediately before these events are written.

## Payments (Stripe)

- **Flow:** Cart → `POST /api/orders` creates a PaymentIntent (no Order yet) → frontend confirms payment client-side with Stripe Elements (`stripe.confirmCardPayment`) → on success, frontend polls `GET /api/orders/by-payment-intent/:id` (500ms interval, 8s timeout) until the webhook-created Order appears → navigates to Confirmation. On a Stripe error (e.g. declined card), the error is shown inline on Checkout and nothing is ever persisted.
- **Client:** `@stripe/stripe-js`, loaded via `apps/web/src/stripeClient.ts` (`VITE_STRIPE_PUBLISHABLE_KEY`). Card input is a real Stripe Elements Card Element (`apps/web/src/components/PaymentCardInput.vue`) — the design mock shows a saved-card UI, but Phase 0 has no accounts/saved payment methods, so there's nothing to display as "saved" (see the design handoff README's Implementation Notes).
- **Server:** `stripe` SDK via `apps/api/src/stripeClient.ts` (`STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`).
- **Local dev / webhook delivery:** Stripe can't reach `localhost` directly. Use the Stripe CLI: `stripe listen --forward-to localhost:3001/api/stripe/webhook` (wrapped as `npm run stripe:listen --workspace apps/api`, used by the E2E setup below). `stripe listen --print-secret` deterministically returns the same signing secret for a given API key/device pairing, so it matches `STRIPE_WEBHOOK_SECRET` in `.env` without any extra copy-pasting.

## Frontend

- **Routing:** `vue-router` (`apps/web/src/router`), history mode. Routes: `/` (`MenuView`), `/cart` (`CartView`), `/checkout` (`CheckoutView`), `/confirmation/:paymentIntentId` (`ConfirmationView`).
- **State:** Pinia. `useCartStore` (`apps/web/src/stores/cart.ts`) holds cart lines (`{ itemId, name, quantity, unitPrice }`), `totalItemCount`, `subtotalCents`; `setQuantity(itemId, 0)` removes a line. Contact/pickup form state lives locally in `CheckoutView` (not persisted — no reason to share it beyond that screen).
- **API client:** `apps/web/src/api/{menuItems,orders}.ts`, `fetch`-based, base URL from `VITE_API_URL` (defaults to `http://localhost:3001`).
- **Design tokens:** CSS custom properties in `apps/web/src/styles/tokens.css`, sourced from `docs/design/design_handoff_phase0/README.md`.
- **Rewards/promo stubs:** `apps/web/src/constants.ts#STATIC_REWARDS_POINTS` is a fixed display placeholder rendered in Cart/Checkout/Confirmation; the Cart promo field is visible but non-functional. Real logic ships in Phase 1 — see the design handoff README's Implementation Notes.
- **Components:** `AppHeader` (takes an optional `step` prop to swap nav/cart-pill for a step label, used on Checkout/Confirmation), `CategoryTabs`, `MenuItemCard`, `CartLineItem`, `OrderSummaryCard`, `PaymentCardInput` (`apps/web/src/components`).

## Testing

- `apps/api`: Vitest + Supertest for HTTP, `mongodb-memory-server` for model/integration tests against a real (in-memory) MongoDB instance. Note: the memory server downloads a ~600MB MongoDB binary on first run per machine and caches it — the first local test run is slow, subsequent runs are fast. Order/webhook integration tests make real calls to the Stripe test API and use `stripe.webhooks.generateTestHeaderString` to produce validly-signed webhook payloads — `STRIPE_SECRET_KEY`/`STRIPE_WEBHOOK_SECRET` must be set (loaded from `apps/api/.env` via `setupFiles: ["dotenv/config"]` in `vitest.config.ts`).
- `apps/web`: Vitest + Vue Test Utils for component tests (`apps/web/src/**/*.test.ts`, jsdom environment — excludes `apps/web/e2e`). Stripe.js is mocked in `CheckoutView.test.ts` (via `vi.mock` on `../stripeClient`) since jsdom can't load real Stripe iframes.
- `apps/web` E2E: Playwright (`apps/web/e2e`, config at `apps/web/playwright.config.ts`). `webServer` boots the API against a real, freshly-seeded in-memory MongoDB via `apps/api/src/scripts/e2eServer.ts` (not the same code path as `npm run dev`, which requires a real `GROVE_MONGO_URI`), plus the Vite dev server. Run via `npm run test:e2e --workspace apps/web`; requires `npx playwright install chromium` once per machine. `e2e/checkout.spec.ts` drives the real Stripe Elements card iframe (`iframe[title="Secure card payment input frame"]`) with Stripe's test cards and exercises the full webhook-driven Order-creation path — it's skipped automatically unless `STRIPE_SECRET_KEY` is set, and additionally requires `stripe listen --forward-to localhost:3001/api/stripe/webhook` (`npm run stripe:listen --workspace apps/api`) running alongside for webhook delivery, since Stripe can't reach `localhost` on its own.
