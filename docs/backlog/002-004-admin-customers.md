# 002-004 — Admin Customers List

**Status:** Active

## Description

As an operator, I can see every customer who's ordered — name, phone, points balance, lifetime orders, last order date — and search by name or phone, so I can look someone up without a database client.

## Acceptance Criteria

```gherkin
Feature: Admin customers list

  Scenario: Viewing the customers list
    Given an operator is signed in and on /admin/customers
    Then they see a table (desktop) or card list (mobile) of every phone number with a paid order
    And each row shows Name (or "Guest"), Phone, Points Balance, Lifetime Orders, and Last Order date

  Scenario: Searching by name or phone
    Given an operator is on the Customers screen
    When they type into the search field
    Then the list filters live to rows whose name or phone contains the query (case-insensitive substring match)

  Scenario: Paging through customers
    Given there are more customers than fit on one page
    Then the list shows 20 customers per page
    And Prev/Next controls with a page indicator let the operator move between pages
    And the Next control is disabled on the last page, Prev disabled on the first
```

## Technical Notes

- New guarded route: `GET /api/admin/customers?search=&page=` returning paginated `{ customers: [{ name, phone, pointsBalance, lifetimeOrders, lastOrderAt }], page, totalPages }`.
- Built via a Mongo aggregation grouping paid `Orders` by `phone`: latest non-null `customerName` (fallback `"Guest"` if none across all their orders), `$count` for lifetime orders, `$max(createdAt)` for last order — then joined against a `LoyaltyEvents` sum (mirroring `getPointsBalance`'s aggregation logic) for points balance. No new `Customer` collection, per Phase 2 brainstorming — keeps balance derivation in one place.
- Search matches against `name` (post-fallback, so `"Guest"` is searchable too) or `phone`, case-insensitive substring, applied server-side before pagination.
- Pagination: 20 rows/page, simple "< Prev  Page X of Y  Next >" footer control — new UI not in the design handoff (which explicitly flagged pagination as undesigned); styled with existing hairline/border/Work Sans 13px tokens. Decided during Phase 2 brainstorming given seed data scale (~30-40 customers fits on 2 pages, exercising the control without needing huge fixture data).
- Desktop table / mobile card layout, search input (pill, 20px radius) per design handoff.

## Test Plan

**Automated:**
- API integration tests: aggregation returns correct name/phone/balance/lifetime-orders/last-order per customer; search filters by name and by phone substring; pagination returns the right page/count and correct `totalPages`; a customer with no `customerName` on any order shows `"Guest"`.
- Component tests: table/card rendering, search-as-you-type filtering, Prev/Next disabled states at list boundaries.

**Manual:** None — fully coverable by automated API/component tests, no third-party service or unautomatable interaction involved.

## Story Points

5

## Suggested Implementation Model

**Sonnet** — a non-trivial aggregation (group + join + search + pagination) plus a full responsive screen; more than mechanical but a well-understood pattern.
