# Grove — Product Roadmap

Sequencing and scope-per-phase for Grove (see `design.md` for product vision, `architecture.md` for technical details). Each phase ends with a working, demoable state — no phase should leave the app unable to run end-to-end.

---

## Phase 0 — Foundation & Ordering

Scaffold the monorepo and get a customer from menu to paid order.

- Monorepo setup: `apps/api` (Express + TS), `apps/web` (Vue 3 + TS + Vite), `packages/shared` (shared types/DTOs)
- MongoDB connection + `MenuItems`/`Orders` collections
- Seed script: 1 restaurant, ~15-20 menu items across 3-4 categories
- Storefront: menu browsing, cart
- Checkout: phone number capture, Stripe (test mode) payment, `Order` creation
- Order confirmation screen

**Exit criteria:** a customer can browse the menu, add items to a cart, and complete a paid order locally, start to finish.

## Phase 1 — Loyalty & Rewards

Layer the points economy onto the ordering flow already built.

- `LoyaltyEvents` ledger + `Rewards` collection (seeded catalog)
- Points-per-dollar accrual wired into checkout (issued on successful payment)
- Reward redemption at checkout (discounts the charge when phone number has enough points)
- `/loyalty` phone lookup screen (balance, history, available rewards)
- Seed data expanded: ~30-40 customers with realistic order/loyalty history

**Exit criteria:** a customer can earn points on an order, look up their balance by phone, and redeem a reward on a later order.

## Phase 2 — Admin Panel

Give an operator visibility into what Phases 0-1 built.

- Admin login (shared password, signed cookie session)
- Dashboard: recent orders + loyalty stats at a glance
- Customers list (with point balances)
- Orders list (with detail view)

**Exit criteria:** an operator can log in and see all orders, customers, and loyalty activity without touching the database directly.

## Phase 3 — Deploy & Polish

Make the demo reachable and interview-ready.

- Fly.io deployment: `apps/api` and built `apps/web` as separate Fly apps
- MongoDB Atlas (free tier) wired as the production database
- Seed script run against production data
- Real Apple Pay at checkout (Stripe Payment Request Button + domain association), now that a live HTTPS URL exists to verify against — the Phase 1 mock included an Apple Pay row that was cut to card-only pending this
- Playwright E2E: critical customer path (browse → checkout → confirmation), admin login → dashboard
- README / demo walkthrough script for the interview

**Exit criteria:** a live URL exists, the full customer and admin paths work on it, and there's a documented walkthrough ready to run.

---

## Out of Scope (all phases)

Multi-tenant support, admin-editable menu/rewards, marketing automation, smart upselling/ML, POS/delivery integrations, tiered loyalty. See `design.md` §8 for rationale — these are deliberate cuts to keep the demo buildable, and are natural "what's next" talking points.
