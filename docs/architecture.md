# Grove — Architecture

Technical reference for implementation details that don't belong in `design.md` (product vision) or `product-roadmap.md` (phase sequencing). This doc grows as tickets are implemented — treat it as the current source of truth for how the system is actually built, updated whenever a ticket's implementation settles something not yet documented here.

---

## Stack

- **Frontend:** Vue 3 + TypeScript, Vite
- **Backend:** Express + TypeScript
- **Database:** MongoDB (Atlas free tier)
- **Payments:** Stripe (test mode)
- **Deployment:** Fly.io (single app — Express serves both the API and the built `apps/web` static assets)

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

`customerName: string | null` (default `null`) — optional name captured at checkout (002-001), used by the Phase 2 admin panel since there's no `Customer` collection or account system to source a name from otherwise. Deliberately not in `design.md` §6's original field list; added during Phase 2 brainstorming once the admin design handoff turned out to need a name and nothing in the system captured one.

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
- `GET /api/rewards` — returns `{ balance: number | null, rewards: RewardOptionDTO[] }` (`packages/shared`), rewards sorted by `pointsCost` ascending. Accepts an optional `?phone=` query param: when present, `balance` is the phone's live points balance (`getPointsBalance`) and each reward's `unlocked`/`pointsNeeded` are computed against it; when absent, `balance` is `null` and every reward is `unlocked: false` with `pointsNeeded` equal to its `pointsCost`. Checkout (001-002) reuses `getPointsBalance` here rather than duplicating the aggregation — 001-003's `GET /api/loyalty/:phone` computes `unlocked` the same way so both screens agree.
- `POST /api/stripe/webhook` — verifies the Stripe signature (`stripe-signature` header, `STRIPE_WEBHOOK_SECRET`) against the **raw** request body (mounted with `express.raw()` *before* the global `express.json()` middleware in `app.ts` — order matters). On `payment_intent.succeeded`, checks whether an `Order` already exists for that `stripePaymentIntentId` and short-circuits if so (redelivery is a no-op, including for the `LoyaltyEvents` below). Otherwise creates the `Order` from the PaymentIntent's metadata via `findOneAndUpdate` with `$setOnInsert` + `upsert: true`, and writes the matching `LoyaltyEvents`: an `earn` event for `ceil(chargedAmountCents / 100)` points (the *discounted* amount, i.e. `paymentIntent.amount`), plus a `redeem` event for `-rewardPointsCost` when a reward was applied. `Order.pointsEarned`/`pointsBalanceAfter` are computed from the phone's balance immediately before these events are written.

## Payments (Stripe)

- **Flow:** Cart → `POST /api/orders` creates a PaymentIntent (no Order yet) → frontend confirms payment client-side with Stripe Elements (`stripe.confirmCardPayment`) → on success, frontend polls `GET /api/orders/by-payment-intent/:id` (500ms interval, 8s timeout) until the webhook-created Order appears → navigates to Confirmation. On a Stripe error (e.g. declined card), the error is shown inline on Checkout and nothing is ever persisted.
- **Client:** `@stripe/stripe-js`, loaded via `apps/web/src/stripeClient.ts` (`VITE_STRIPE_PUBLISHABLE_KEY`). Card input is a real Stripe Elements Card Element (`apps/web/src/components/PaymentCardInput.vue`) — the design mock shows a saved-card UI, but Phase 0 has no accounts/saved payment methods, so there's nothing to display as "saved" (see the design handoff README's Implementation Notes).
- **Server:** `stripe` SDK via `apps/api/src/stripeClient.ts` (`STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`).
- **Local dev / webhook delivery:** Stripe can't reach `localhost` directly. Use the Stripe CLI: `stripe listen --forward-to localhost:3001/api/stripe/webhook` (wrapped as `npm run stripe:listen --workspace apps/api`, used by the E2E setup below). `stripe listen --print-secret` deterministically returns the same signing secret for a given API key/device pairing, so it matches `STRIPE_WEBHOOK_SECRET` in `.env` without any extra copy-pasting.
- **Single dev command:** `npm run dev` at the repo root (via `concurrently`) runs the API, the web dev server, and `stripe:listen` together in one terminal, labeled/colored per process — replaces running the three separately. `npm run dev:api` / `dev:web` still exist for running one in isolation.

## Frontend

- **Routing:** `vue-router` (`apps/web/src/router`), history mode. Routes: `/` (`MenuView`), `/cart` (`CartView`), `/checkout` (`CheckoutView`), `/confirmation/:paymentIntentId` (`ConfirmationView`), `/loyalty` (`LoyaltyView` — placeholder stub added in 001-002 so Confirmation's "Check My Rewards" link and the AC's navigation test have a real route to resolve to; 001-003 replaces its content with the full Loyalty Lookup screen).
- **State:** Pinia. `useCartStore` (`apps/web/src/stores/cart.ts`) holds cart lines (`{ itemId, name, quantity, unitPrice }`), `totalItemCount`, `subtotalCents`; `setQuantity(itemId, 0)` removes a line. Contact/pickup form state lives locally in `CheckoutView` (not persisted — no reason to share it beyond that screen). Checkout also holds reward-selection state locally (`pointsBalance`, `rewardOptions`, `selectedRewardId`) — refetched from `GET /api/rewards?phone=` on phone-field blur, not persisted.
- **API client:** `apps/web/src/api/{menuItems,orders,rewards}.ts`, `fetch`-based, base URL from `VITE_API_URL` (defaults to `http://localhost:3001`).
- **Design tokens:** CSS custom properties in `apps/web/src/styles/tokens.css`, sourced from `docs/design/design_handoff_phase0/README.md`.
- **Rewards UI (001-002):** Checkout shows a `PointsBanner` (balance + how many rewards it covers) once a phone with a positive balance is entered, and a `RewardList` (locked/unlocked rows, single-select) once any rewards are returned for that phone. Selecting an unlocked reward updates `OrderSummaryCard`'s discount line, total, and "you'll earn +N pts" estimate (a client-side mirror of the server's formula in `POST /api/orders`) and is sent as `rewardId` when placing the order. Confirmation shows a `PointsEarnedPill` (points earned + resulting balance) and a "Reward Used" info-card column, shown only when `Order.rewardRedeemed` is set; its "Total" is the actual charged amount (`subtotalCents` minus the redeemed reward's `discountAmountCents`), not the pre-discount `subtotalCents`. This replaced the old Phase 0 `apps/web/src/constants.ts#STATIC_REWARDS_POINTS` stub, which has been removed.
- **Components:** `AppHeader` (takes an optional `step` prop to swap nav/cart-pill for a step label, used on Checkout/Confirmation), `CategoryTabs`, `MenuItemCard`, `CartLineItem`, `OrderSummaryCard`, `PaymentCardInput`, `PointsBanner`, `RewardList`, `PointsEarnedPill` (`apps/web/src/components`).

## Testing

- `apps/api`: Vitest + Supertest for HTTP, `mongodb-memory-server` for model/integration tests against a real (in-memory) MongoDB instance. Note: the memory server downloads a ~600MB MongoDB binary on first run per machine and caches it — the first local test run is slow, subsequent runs are fast. Order/webhook integration tests make real calls to the Stripe test API and use `stripe.webhooks.generateTestHeaderString` to produce validly-signed webhook payloads — `STRIPE_SECRET_KEY`/`STRIPE_WEBHOOK_SECRET` must be set (loaded from `apps/api/.env` via `setupFiles: ["dotenv/config"]` in `vitest.config.ts`).
- `apps/web`: Vitest + Vue Test Utils for component tests (`apps/web/src/**/*.test.ts`, jsdom environment — excludes `apps/web/e2e`). Stripe.js is mocked in `CheckoutView.test.ts` (via `vi.mock` on `../stripeClient`) since jsdom can't load real Stripe iframes.
- `apps/web` E2E: Playwright (`apps/web/e2e`, config at `apps/web/playwright.config.ts`). `webServer` boots the API against a real, freshly-seeded in-memory MongoDB via `apps/api/src/scripts/e2eServer.ts` (not the same code path as `npm run dev`, which requires a real `GROVE_MONGO_URI`), plus the Vite dev server. `e2eServer.ts` also seeds the reward catalog and two fixed loyalty phones for reward-redemption tests: `E2E_REWARDS_PHONE` (`+15559998888`, 400 pts — can redeem the cheapest reward) and `E2E_LOCKED_ONLY_PHONE` (`+15559997777`, 100 pts — all rewards locked). Run via `npm run test:e2e --workspace apps/web`; requires `npx playwright install chromium` once per machine. `e2e/checkout.spec.ts` drives the real Stripe Elements card iframe (`iframe[title="Secure card payment input frame"]`) with Stripe's test cards and exercises the full webhook-driven Order-creation path, including a reward-redemption scenario using `E2E_REWARDS_PHONE` — it's skipped automatically unless `STRIPE_SECRET_KEY` is set, and additionally requires `stripe listen --forward-to localhost:3001/api/stripe/webhook` (`npm run stripe:listen --workspace apps/api`) running alongside for webhook delivery, since Stripe can't reach `localhost` on its own.
