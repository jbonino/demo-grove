# 002-005 — Admin Orders List & Detail

**Status:** Done

## Description

As an operator, I can see all orders in a paged list and drill into any one to see its full itemization, total, and points issued, so I can answer "what did this order actually contain" without a database client.

## Acceptance Criteria

```gherkin
Feature: Admin orders list and detail

  Scenario: Viewing the orders list
    Given an operator is signed in and on /admin/orders
    Then they see a paged table of orders (Order/Customer/Time/Total/Status), most recent first
    And 20 orders are shown per page with Prev/Next controls

  Scenario: Viewing an order's detail (desktop)
    Given an operator is on the Orders screen on desktop
    When they click a row
    Then a detail panel shows that order's number, status, customer name/phone/time, itemized lines, tax, total, and points-issued note
    And the selected row is visually highlighted in the table

  Scenario: Viewing an order's detail (mobile)
    Given an operator is on the Orders screen on mobile
    When they tap a row
    Then that row expands in place to show the same itemization/total/points detail
    And other rows remain collapsed

  Scenario: Paging through orders
    Given there are more orders than fit on one page
    Then Prev/Next controls page through them, most recent first, disabled at the first/last page
```

## Technical Notes

- New guarded routes: `GET /api/admin/orders?page=` (list, paginated, most-recent-first) and `GET /api/admin/orders/:id` (full detail: items with name/qty/price, tax if applicable, total, `pointsEarned`, customer name/phone).
- No aggregation needed here beyond pagination/sort — `Order` documents already carry everything the detail view needs (`items`, `subtotalCents`, `phone`, `customerName`, `pointsEarned`, `status`, `createdAt`); list/detail are straightforward queries against the existing collection.
- Customer column in the list: `customerName` or `"Guest"` fallback, single column, matching Dashboard's pattern (decided in 002-003/brainstorming) — phone is shown in the detail panel/expanded row instead.
- Desktop: two-column layout (1.3fr table / 1fr sticky detail panel), selected-row highlight `#f7f4ec`. Mobile: tap-to-expand inline itemization, no side panel. Status pill colors match Dashboard's Preparing/Ready/Completed tints.
- Pagination: same Prev/Next + page-number footer pattern as 002-004 (20 rows/page), for the same reason (undesigned in the mock, added during Phase 2 brainstorming for the ~150-order seed scale).

## Test Plan

**Automated:**
- API integration tests: orders list returns paginated, most-recent-first results; order detail returns correct itemization/total/points for a given order id; a request for a nonexistent order id returns 404.
- Component tests: table renders rows with correct status pills and "Guest" fallback; clicking a row opens/updates the desktop detail panel; tapping a row expands it in place on mobile; Prev/Next disabled states at list boundaries.

**Manual:** None — fully coverable by automated API/component tests.

## Story Points

5

## Suggested Implementation Model

**Sonnet** — straightforward CRUD-style list/detail screens with pagination and a responsive two-layout design; no novel logic but real screen surface.

## Scope Decision (2026-07-20)

The `Order` model has no tax field anywhere in the system (confirmed by reading `apps/api/src/models/Order.ts` — no Phase 0/1 order ever carried a tax concept). The AC's "tax if applicable" phrasing already anticipates this; the detail view omits a tax line entirely rather than fabricating one. Item names aren't stored on `Order.items` (only `menuItem` ObjectId + `quantity` + `unitPriceCents`), so the detail endpoint looks up names via a `MenuItem.find` keyed by the referenced ids rather than a Mongo `$lookup`/populate pipeline — same one-off-query style as the rest of Phase 2's admin endpoints.

## Manual Test Record (2026-07-20)

Verified against the real running dev servers (API on :3001, web on :5173) and the seeded MongoDB dataset (~150 paid orders), via Playwright screenshots at desktop (1280×900) and mobile (390×844) viewports:

- **Desktop list**: Order/Customer/Time/Total/Status columns, Completed pills, "Page 1 of 6" footer with Prev disabled — matches the design handoff.
- **Desktop detail**: clicking a row opened the sticky right-hand panel with order number, status pill, customer/phone/time subline, itemized line ("3× Seared Sea Scallops — $54.00"), bold total, and a gold "+54 points issued" note.
- **Mobile list**: cards stack cleanly with the bottom tab bar active on Orders.
- **Mobile detail**: tapping a row expanded it in place directly beneath itself, showing the same phone/time subline, itemized line, total, and points note, while every other row stayed collapsed — matches the AC's expand-in-place behavior.
- Confirmed via `curl` that both `GET /api/admin/orders` and `GET /api/admin/orders/:id` require the admin session cookie.

## Verification record (2026-07-20)

- `apps/api`: 97 tests passing (up from 84) — added `admin/orderList.test.ts` (4 tests), `admin/orderDetail.test.ts` (4 tests), `routes/adminOrders.test.ts` (5 tests).
- `apps/web`: 131 tests passing (up from 118) — added `api/admin.test.ts` additions (4 tests), `components/admin/OrdersList.test.ts` (6 tests), `views/admin/AdminOrdersView.test.ts` (3 tests).
- `npm run build --workspaces` and `npm run lint --workspaces` both clean (one build-time fix: `req.params.id` needed `String(...)` coercion to satisfy `tsc`, matching the existing convention in `routes/loyalty.ts`).
- No `architecture.md`/`design.md`/`product-roadmap.md` updates needed — no schema changes; the tax omission is a data-model fact, not a design decision that needs to be recorded upstream.
- This closes out the Phase 2 (Admin Panel) backlog — `docs/backlog/` is now empty.
