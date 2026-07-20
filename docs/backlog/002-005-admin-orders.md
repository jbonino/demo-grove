# 002-005 — Admin Orders List & Detail

**Status:** Active

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
