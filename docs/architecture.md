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
