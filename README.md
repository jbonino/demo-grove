# Grove

A restaurant ordering + loyalty rewards demo, built as a portfolio piece for an
Owner.com interview. The scope and stack mirror Owner.com's product surface
(commission-free ordering, phone-based loyalty accrual).

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

1. Browse the menu at `/` and add a couple of items to the cart.
2. Open the cart and continue to `/checkout`.
3. Enter a phone number, e.g. `(555) 123-4567`.
4. Pay with the Stripe test card `4242 4242 4242 4242`, any future expiry date, any
   3-digit CVC, and any ZIP.
5. Reach the confirmation screen — it shows the points earned and the new balance for
   that phone number.
6. Visit `/loyalty` and look up the same phone number to see the balance, available
   rewards, and recent activity.

## Demo walkthrough — admin path

1. Visit `/admin` and log in with the admin password (shared separately, not published
   in this repo or on the `/readme` page).
2. View the dashboard: recent orders and loyalty stats at a glance.
3. Open `/admin/customers` to see the customer list with balances.
4. Open `/admin/orders` to see the full orders list.

## Local development

See `apps/api/.env.example` for the full list of required environment variables. Once
`.env` files are set up:

```
npm install
npm run dev
```
