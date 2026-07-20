# Grove

A restaurant ordering + loyalty rewards demo, built as a demo for interviews. Built in a
single work day, agentically — see [Build process](#build-process) below.

Live demo: https://grove-jbonino.fly.dev — the deployed app also serves this same
overview and walkthrough at [`/readme`](https://grove-jbonino.fly.dev/readme), reachable
without repo access.

## Concept

Browse a menu → add to cart → check out with a phone number and Stripe payment → earn
loyalty points automatically → look up balance and progress toward a reward by phone
number → redeem at a later checkout. An admin panel shows recent orders, customers, and
loyalty stats.

## Stack & architecture

- **Frontend:** Vue 3 + TypeScript, Vite
- **Backend:** Express + TypeScript
- **Database:** MongoDB (Atlas)
- **Payments:** Stripe (test mode)
- Monorepo (npm workspaces): `apps/api`, `apps/web`, `packages/shared` for shared
  types/DTOs.
- Single Fly.io app serves both the built frontend and the API from one Express process
  (same origin, no CORS).

See `docs/design.md` for product decisions and `docs/architecture.md` for schema/stack
wiring details.

## Demo walkthrough — customer path

1. Browse the menu at [`/`](https://grove-jbonino.fly.dev/) and add a couple of items to
   the cart.
2. Open the cart and continue to
   [`/checkout`](https://grove-jbonino.fly.dev/checkout).
3. Enter a phone number, e.g. `(555) 123-4567`.
4. Pay with the Stripe test card `4242 4242 4242 4242`, any future expiry date, any
   3-digit CVC, and any ZIP.
5. Reach the confirmation screen — it shows the points earned and the new balance for
   that phone number.
6. Visit [`/loyalty`](https://grove-jbonino.fly.dev/loyalty) and look up the same phone
   number to see the balance, available rewards, and recent activity.

## Demo walkthrough — admin path

1. Visit [`/admin`](https://grove-jbonino.fly.dev/admin) and log in with the admin
   password: `grove`.
2. View the dashboard: recent orders and loyalty stats at a glance.
3. Open [`/admin/customers`](https://grove-jbonino.fly.dev/admin/customers) to see the
   customer list with balances.
4. Open [`/admin/orders`](https://grove-jbonino.fly.dev/admin/orders) to see the full
   orders list.

## Build process

Grove was built agentically in a single work day, end to end: schema and API design, the
ordering and loyalty flows, the admin panel, Stripe integration, tests, and deployment.
Implementation was split by ticket complexity between Claude Haiku (small/mechanical
tickets — data and config changes) and Claude Sonnet (typical feature work), keeping the
whole build on low usage rather than defaulting every ticket to the largest model.
UI-heavy tickets were mocked up with [claude.ai/design](https://claude.ai/design) before
implementation.

The `docs/` folder is the project's source of truth and working memory, not an
afterthought:

- `docs/design.md` — product decisions (referenced by section, e.g. §6), the source
  other docs and tickets point back to.
- `docs/product-roadmap.md` — phase sequencing and what's in/out of scope per phase.
- `docs/architecture.md` — concrete technical details: schemas, stack wiring, how the
  pieces fit together.
- `docs/backlog/` — one file per not-yet-built ticket, each with Gherkin acceptance
  criteria, technical notes, a test plan, a story-point estimate, and a suggested
  implementation model.
- `docs/done/` — the same tickets, moved here on completion with a record of what was
  actually tested.
- `docs/design/` — high-fidelity UI mockups/handoffs, produced with claude.ai/design
  before implementing UI-heavy tickets.
- `docs/retros/` — a short retro written at the close of each phase.

This structure and the phase/ticket workflow that drives it are a project-specific,
modified version of the [Superpowers](https://github.com/obra/superpowers) Claude Code
plugin — its skills for brainstorming, TDD, systematic debugging, and structured code
review, adapted with a ticket/backlog/phase workflow layered on top (see `CLAUDE.md` in
the repo root).

## Test coverage

- **113** Vitest + Supertest tests in `apps/api` — loyalty math, order/payment flow, and
  API routes.
- **140** Vitest + Vue Test Utils component tests in `apps/web`.
- Playwright E2E (`apps/web/e2e`) driving the real Stripe Elements card iframe against a
  live webhook-driven backend: the critical customer path (browse → checkout →
  confirmation, including a reward-redemption case) and admin login → dashboard.

Everything was TDD'd — tests written before the implementation they cover.

## Contact

jbonino@protonmail.com

## Local development

See `apps/api/.env.example` for the full list of required environment variables. Once
`.env` files are set up:

```
npm install
npm run dev
```
