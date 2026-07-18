# 000-004 — Menu (Storefront) Screen

**Status:** Done

## Description

As a customer, I can browse today's menu grouped by category and add items to my cart, so I can build my order before checking out. This is the storefront's landing screen.

## Acceptance Criteria

```gherkin
Feature: Menu browsing and add-to-cart

  Scenario: Viewing the menu
    Given menu items exist in the database
    When a customer visits the storefront
    Then they see category tabs and a grid of item cards showing name, price, and description

  Scenario: Filtering by category
    Given the menu is displayed with multiple categories
    When a customer taps a category tab
    Then the item grid filters to only that category's items
    And the tapped tab is visually marked as active

  Scenario: Adding an item to the cart
    Given a customer is viewing the menu
    When they tap "Add" on a menu item
    Then the item is added to their cart
    And the header cart-pill count increments to reflect the new total item count

  Scenario: Responsive layout
    Given a customer on a mobile-width viewport
    When they view the menu
    Then item cards render as a single-column stacked list instead of a 3-column grid
```

## Technical Notes

- Build against the Phase 0 design handoff (`docs/design/design_handoff_phase0/`), screens 2a (desktop) / 2b (mobile) — recreate as Vue components/routes using the project's conventions, not a direct port of the mock's HTML/inline styles
- Fetch menu items from the API (`GET /api/menu-items`, built as part of this ticket)
- Cart state: a composable/store (list of `{ itemId, name, quantity, unitPrice }`) shared with the Cart/Checkout screen (000-005) — this ticket introduces the store, 000-005 extends it
- Design tokens (colors, type, spacing) from the handoff README apply as-is

## Test Plan

**Automated:** Component tests (Vitest + Vue Testing Library) for category filtering and add-to-cart cart-count increment. Playwright E2E covering browse → filter → add-to-cart as the start of the full order flow (extended by 000-005/000-006).

**Manual:** Visually compare the built screen against the 2a (desktop, 1280px) and 2b (mobile, 375px) reference mocks for layout/spacing/type fidelity.

**Verification record (2026-07-17):** Automated — 10 component tests (Vitest + Vue Test Utils) covering category-tab active state/select emit, add-to-cart emit, menu view category filtering, and header cart-pill increment; 1 Playwright E2E test (browse → filter → add-to-cart) run against the real dev stack (API backed by an in-memory MongoDB seeded via `apps/api/src/scripts/e2eServer.ts`, web via Vite dev server) — passed. Full workspace `build`/`lint`/`typecheck`/`test` pass. Manual — screenshotted the built screen at 1280px and 375px viewports via Playwright and compared against the 2a/2b mocks: deep-green header with gold cart pill, serif category tabs with active underline, white item cards with hatched photo placeholders, 3-column desktop grid collapsing to a single-column list with 90×90 horizontal photo rows on mobile — matches the design tokens and layout spec. Found and fixed one integration gap not caught by component tests: the API had no CORS middleware, so cross-origin fetches from the Vite dev server (5173) to the API (3001) were silently failing in a real browser even though jsdom-based tests passed (jsdom doesn't enforce CORS) — added `cors` middleware to `apps/api/src/app.ts`.

## Story Points

5

## Suggested Implementation Model

**Sonnet** — typical UI feature work against a detailed design spec.
