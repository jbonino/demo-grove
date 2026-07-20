# 002-003 — Admin Dashboard

**Status:** Done

## Description

As an operator, once I'm signed in I land on a dashboard showing today's orders/revenue, recent loyalty activity, and a Recent Orders table — enough to see how the restaurant is doing without touching the database.

## Acceptance Criteria

```gherkin
Feature: Admin dashboard

  Scenario: Viewing today's stats
    Given an operator is signed in and on the Dashboard
    Then they see Orders Today with its delta vs. yesterday
    And Revenue Today with its delta vs. yesterday
    And Points Issued (7d) with the redeemed count
    And New Loyalty Signups (7d) with "of N orders" context

  Scenario: Viewing recent orders
    Given an operator is on the Dashboard
    Then a Recent Orders table shows Order/Customer/Time/Total/Status for the most recent paid orders
    And each row's Customer column shows the order's customerName, or "Guest" if none was captured
    And each row's Status is shown as a colored pill (Preparing/Ready/Completed)

  Scenario: Navigating from the sidebar/tab bar
    Given an operator is on any admin screen
    When they select Customers or Orders from the sidebar (desktop) or tab bar (mobile)
    Then they navigate to that screen without a full page reload

  Scenario: Signing out from the Dashboard
    Given an operator is on the Dashboard
    When they click "Sign out"
    Then they are signed out and returned to /admin/login
```

## Technical Notes

- New guarded route: `GET /api/admin/dashboard` returning `{ ordersToday, ordersTodayDelta, revenueToday, revenueTodayDelta, pointsIssued7d, pointsRedeemed7d, signups7d, ordersOutOf7d, recentOrders: [...] }` per the design handoff's State Management section.
- "Today"/"yesterday" computed server-side in the server's local time (no timezone handling needed for a single-restaurant demo).
- "New Loyalty Signups 7d": a phone counts as a signup if its earliest paid Order's `createdAt` falls within the last 7 days (aggregation: `$group` by phone on `Orders`, take `$min(createdAt)`, filter to last 7 days). "of N orders" = total paid orders placed in that same 7-day window. Decided during Phase 2 brainstorming since there's no explicit signup event in the data model.
- Recent Orders `Customer` column: `customerName` from `Order`, or the literal string `"Guest"` when `null` — decided during brainstorming to keep the single-column mock layout unchanged (Phone is not shown here; it's available via the Orders screen's detail panel).
- Sidebar (desktop, 220px, `#2f4d3a`) / bottom tab bar (mobile) + route-based active-state highlighting per the design handoff tokens (`rgba(255,255,255,.12)` active pill).
- Stat card / status-pill colors per design handoff's Design Tokens section (Preparing/Ready/Completed tints, gold `Points Issued` value).
- This ticket also includes `apps/web/e2e/adminLogin.spec.ts` (login → Dashboard), since it's the first point in the build where a real Dashboard exists to assert against — pulled forward from Phase 3 per Phase 2 brainstorming. Requires 002-002 (auth) to be complete first. `product-roadmap.md`'s Phase 3 scope is updated in this ticket's commit to remove the now-redundant "admin login → dashboard" E2E line.

## Test Plan

**Automated:**
- API integration tests: dashboard aggregation returns correct values for orders-today/revenue-today/deltas, points issued/redeemed over 7d, and the signups-7d calculation against seeded/fixture data (including a customer whose first order is inside vs. outside the 7-day window).
- Component tests: stat cards render values/deltas/labels correctly; Recent Orders table renders rows with correct status pill styling and the "Guest" fallback.
- Playwright E2E: `adminLogin.spec.ts` — sign in with the correct password and assert the Dashboard renders (stat cards + Recent Orders visible).

**Manual:** Desktop and mobile layout check (sidebar vs. tab bar) — steps recorded in this ticket file once implemented.

## Story Points

5

## Suggested Implementation Model

**Sonnet** — a real aggregation query (signups/deltas) plus a full screen with responsive layout; enough logic and surface to warrant the default tier.

## Scope Decision (2026-07-20)

The design mock's Recent Orders status pill shows **Preparing/Ready/Completed**, but `Order.status` is only `pending`/`paid`/`failed` (payment status — there's no kitchen/fulfillment workflow anywhere in the data model, and `Order` documents are only ever created already `paid` by the Stripe webhook). This mismatch wasn't caught during Phase 2 brainstorming and blocks both this ticket and 002-005.

Asked the user directly: chose to always render **Completed** for every (paid) order, since Phase 2 is explicitly a read-only visibility layer with no operator action that could ever move an order to Preparing/Ready. A time-based heuristic or a real `fulfillmentStatus` field were the other options considered, but both would fabricate variety/state this app has no way to actually produce or change. 002-005 should follow the same convention.

## Manual Test Record (2026-07-20)

Ran the real seed script (`npm run seed --workspace apps/api`) against the dev MongoDB, started both dev servers, and captured Playwright screenshots at desktop (1440×900) and mobile (390×844) viewports of `/admin` after signing in with the real `GROVE_ADMIN_PASSWORD`:

- **Desktop:** fixed 220px green sidebar with wordmark, active-item highlight, and Sign out; 4-column stat card grid; Recent Orders table with header row, hairline dividers, and gray "Completed" status pills — matches the design handoff.
- **Mobile:** sidebar replaced by a green header + fixed bottom tab bar (Dashboard/Customers/Orders/Sign out); stat cards collapse to a 2-column grid; Recent Orders becomes a stacked card list with the table header hidden.
- Caught and fixed a real bug during this check: a CSS specificity issue (`.recent-orders thead` beat the plain `thead { display: none }` override) left the table header rendering as five empty stacked rows on mobile. Fixed by scoping the `display: none` rule to `.recent-orders thead` and dropping `thead`/`th` from the bulk `display: block` list.
- Confirmed the fixed bottom tab bar doesn't permanently clip the last Recent Orders card — scrolling to the bottom clears it with room to spare (screenshotted at both the top and fully-scrolled positions).
- Signed out from the Dashboard and confirmed it returns to `/admin/login`.

## Verification record (2026-07-20)

- All new tests written test-first (RED confirmed before each implementation): `getDashboardStats` aggregation (`apps/api/src/admin/dashboardStats.test.ts` — today/yesterday order+revenue counts and deltas, 7d points issued/redeemed, 7d signups vs. total orders-in-window, Guest fallback, Completed status, 5-item recent-orders cap), the guarded `GET /api/admin/dashboard` route (`apps/api/src/routes/adminDashboard.test.ts`), CORS credentials (added to 002-002's suite), the `admin` API client's `fetchDashboardStats` (`apps/web/src/api/admin.test.ts`), `AdminNav` (nav links, active-state, sign-out redirect), `DashboardStatCards`, `RecentOrdersTable` (Guest fallback + status pill), and `AdminDashboardView` (fetch-on-mount + render).
- Full workspace `build`/`lint`/`test` pass: `apps/api` 74 tests (up from 66), `apps/web` 108 tests (up from 96), `packages/shared` unaffected. Lint clean (two auto-fixable Vue formatting warnings resolved via `eslint --fix`).
- Added `apps/web/e2e/adminLogin.spec.ts` (pulled forward from Phase 3 per the ticket's technical notes) covering both the correct-password → Dashboard-renders path and the wrong-password → inline-error path; ran via `npx playwright test` against the real dev servers — both passed.
- Added minimal `AdminCustomersView`/`AdminOrdersView` placeholders and their routes so `AdminNav`'s Customers/Orders links have real destinations to navigate to; 002-004/002-005 replace their content.
- Manual desktop/mobile layout verification via real screenshots — see Manual Test Record above, including a real bug found and fixed during that check.
