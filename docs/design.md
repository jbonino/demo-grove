# Grove — Design Doc

## 1. Concept

Grove is a restaurant ordering + loyalty rewards demo: a single restaurant's online ordering flow paired with a phone-number-based points program, plus an admin panel for viewing orders, customers, and loyalty stats. It's built as a portfolio piece for an Owner.com interview — the scope and stack (Vue, Express, MongoDB, TypeScript, Stripe) are chosen to mirror Owner.com's actual product surface (commission-free ordering, phone-based loyalty accrual) and tech stack, so it doubles as a natural artifact to walk through in the interview.

## 2. Core Loop

Browse menu → add to cart → checkout (phone number + Stripe payment) → points auto-accrue → look up balance / see progress toward a reward → return and redeem → order again.

## 3. Systems

**Ordering & Menu**
- Menu items: name, description, price, category. Cart is client-side, no account required to build one.
- Checkout requires phone number, cart items, and a successful Stripe (test mode) payment.
- A successful payment creates an `Order` and issues loyalty points in the same flow — not a separate manual step.
- Payment method is card only (see §8 — real Apple Pay is out of scope).

**Loyalty & Rewards**
- 1 point per $1 of pre-tax subtotal, credited on successful payment.
- Small fixed reward catalog (e.g. "Free appetizer — 300 pts", "$10 off — 500 pts"), seeded, not admin-editable in v1.
- Redemption happens at checkout: if the phone number has enough points, one reward can be applied, discounting the charge.
- Balance is derived from a `LoyaltyEvent` ledger (earn/redeem entries), not a mutable counter — keeps history auditable.

**Admin/Operator Tools**
- Single shared admin password (signed cookie session), no per-admin user table — single-restaurant scope doesn't need one.
- Dashboard: recent orders, customer list with balances, loyalty stats (points issued vs. redeemed, top customers).
- No menu-editing UI in v1 (menu is seeded).

## 4. User Journeys & Screens

**Customer:** storefront → cart → checkout (phone + pay) → confirmation (points earned, new balance) → later, look up balance by phone → see progress toward a reward → reorder, redeem at checkout.

**Admin:** log in → dashboard (orders + loyalty stats at a glance) → drill into customers or individual orders.

**Screens:** `/` (menu), cart, `/checkout`, `/confirmation`, `/loyalty` (phone lookup), `/admin/login`, `/admin`, `/admin/customers`, `/admin/orders`.

## 5. Content

- 1 restaurant, ~15-20 menu items across 3-4 categories.
- ~30-40 seeded customers with realistic phone numbers, order history, and loyalty history (some near a reward threshold, some with past redemptions) so the demo has texture from the start.

## 6. Data Model (MongoDB)

| Collection | Key fields |
|---|---|
| `MenuItems` | name, description, price, category |
| `Orders` | items (menu item ref + qty + price snapshot), subtotal, phone, customerName (optional, added Phase 2 for admin display), stripePaymentIntentId, status, createdAt |
| `LoyaltyEvents` | phone, orderId (nullable), type (`earn`/`redeem`), points, createdAt |
| `Rewards` | name, pointsCost, description |

Balance for a phone number = sum of matching `LoyaltyEvents.points` (earn positive, redeem negative).

## 7. Technical Overview

- **Monorepo** (npm workspaces): `apps/api` (Express + TS), `apps/web` (Vue 3 + TS, Vite), `packages/shared` (shared types/DTOs).
- **API:** REST/JSON. Stripe webhook verifies signatures before writing; idempotent on `stripePaymentIntentId`.
- **Auth:** admin-only, signed cookie; customers identified by phone number, not credentials.
- **Testing:** Vitest + supertest for loyalty math and order/payment flow; Playwright E2E for the critical customer path (browse → checkout → confirmation) and admin login → dashboard.
- **Deployment:** a single Fly.io app serving both the API and the built `apps/web` static assets (same origin, no CORS); MongoDB via Atlas free tier. A live URL is a Phase 3 exit requirement.

Full stack wiring, routes, and schema details live in `architecture.md` as they're implemented.

## 8. Out of Scope / Future Vision

Multi-tenant (multiple restaurants), admin-editable menu/rewards, marketing automation (win-back SMS/email), smart upselling/ML recommendations, POS/delivery integrations, tiered loyalty status, real Apple Pay/Google Pay at checkout (card only for the demo). Deferred deliberately to keep the demo buildable — worth naming as "what's next" in the interview.
