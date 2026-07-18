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
- `stripePaymentIntentId: string | null` (nullable until 000-005 wires Stripe)
- `status: "pending" | "paid" | "failed"` (default `"pending"`)
- `createdAt: Date` (default now)

## API Routes

- `GET /health` — returns `200 { ok: true }` if the DB connection is live, `503 { ok: false }` otherwise.
- `GET /api/menu-items` — returns all `MenuItem` documents as `MenuItemDTO[]` (`packages/shared`), sorted by category then name. CORS is enabled (`cors` middleware) so the Vite dev server (5173) can call the API (3001) cross-origin in local dev.

## Frontend

- **Routing:** `vue-router` (`apps/web/src/router`), history mode. `/` → `MenuView`.
- **State:** Pinia. `useCartStore` (`apps/web/src/stores/cart.ts`) holds cart lines (`{ itemId, name, quantity, unitPrice }`) and `totalItemCount`; shared across views, extended by 000-005 for checkout.
- **API client:** `apps/web/src/api/menuItems.ts` calls the API via `fetch`, base URL from `VITE_API_URL` (defaults to `http://localhost:3001`).
- **Design tokens:** CSS custom properties in `apps/web/src/styles/tokens.css`, sourced from `docs/design/design_handoff_phase0/README.md`.
- **Components:** `AppHeader`, `CategoryTabs`, `MenuItemCard` (`apps/web/src/components`), consumed by `MenuView` (`apps/web/src/views`).

## Testing

- `apps/api`: Vitest + Supertest for HTTP, `mongodb-memory-server` for model/integration tests against a real (in-memory) MongoDB instance. Note: the memory server downloads a ~600MB MongoDB binary on first run per machine and caches it — the first local test run is slow, subsequent runs are fast.
- `apps/web`: Vitest + Vue Test Utils for component tests (`apps/web/src/**/*.test.ts`, jsdom environment — excludes `apps/web/e2e`).
- `apps/web` E2E: Playwright (`apps/web/e2e`, config at `apps/web/playwright.config.ts`). `webServer` boots the API against a real, freshly-seeded in-memory MongoDB via `apps/api/src/scripts/e2eServer.ts` (not the same code path as `npm run dev`, which requires a real `GROVE_MONGO_URI`), plus the Vite dev server. Run via `npm run test:e2e --workspace apps/web`; requires `npx playwright install chromium` once per machine.
