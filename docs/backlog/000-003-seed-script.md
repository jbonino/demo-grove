# 000-003 — Seed Script

**Status:** Backlog

## Description

A script that populates the database with realistic menu data so the storefront has something real to display and demo, instead of an empty menu.

## Acceptance Criteria

```gherkin
Feature: Seed script

  Scenario: Running the seed script populates menu items
    Given an empty database
    When a developer runs the seed script
    Then 15-20 MenuItems exist across 3-4 categories
    And each item has a name, description, price, and category

  Scenario: Seed script is safe to re-run
    Given the database already has seeded menu items
    When a developer runs the seed script again
    Then the menu items are reset to the seed set rather than duplicated
```

## Technical Notes

- Standalone script (e.g. `apps/api/scripts/seed.ts`, run via an npm script)
- Clears existing `MenuItems` before inserting the seed set (simplest way to guarantee idempotency for a single-collection seed)
- Menu content: invented but realistic (e.g. a casual American restaurant) — 3-4 categories such as Appetizers, Mains, Drinks, Desserts
- No `Restaurant` collection — this is single-tenant (per `design.md`), so the restaurant's name/branding is a config value, not seeded data

## Test Plan

**Automated:** A test that runs the seed script against a test DB and asserts the expected item count and category spread.

**Manual:** Run the seed script locally and confirm the menu items are visible once the Menu screen (000-004) exists.

## Story Points

1

## Suggested Implementation Model

**Haiku** — small, mechanical data-population script, no new logic beyond a clear-and-insert.
