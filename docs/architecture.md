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

## Testing

- `apps/api`: Vitest + Supertest for HTTP, `mongodb-memory-server` for model/integration tests against a real (in-memory) MongoDB instance. Note: the memory server downloads a ~600MB MongoDB binary on first run per machine and caches it — the first local test run is slow, subsequent runs are fast.
- `apps/web`: Vitest + Vue Test Utils for component tests.
