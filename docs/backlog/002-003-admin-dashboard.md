# 002-003 — Admin Dashboard

**Status:** Backlog

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
