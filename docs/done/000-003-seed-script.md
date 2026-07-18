# 000-003 — Seed Script

**Status:** Done

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
- Menu content: invented but realistic, upscale contemporary American to match the design handoff's visual tone (deep green/gold palette, serif display type) — 4 categories: Starters, Entrées, Sides, Desserts
- No `Restaurant` collection — this is single-tenant (per `design.md`), so the restaurant's name/branding is a config value, not seeded data

## Test Plan

**Automated:** A test that runs the seed script against a test DB and asserts the expected item count and category spread.

**Manual:** Run the seed script locally and confirm the menu items are visible once the Menu screen (000-004) exists.

**Verification record (2026-07-17):** Automated tests cover the seed logic (`seedMenuItems()`, called by both the CLI script and the test) against a real MongoDB instance (`mongodb-memory-server`): 19 items across 4 categories (Starters, Entrées, Sides, Desserts — upscale contemporary American, matching the design handoff's visual tone), each with name/description/price/category, and re-running resets rather than duplicates. Full workspace `build`/`lint`/`typecheck`/`test` pass. Manual run of `npm run seed --workspace apps/api` against a local/Atlas MongoDB instance and visual confirmation is deferred to 000-004 as originally scoped (no Docker daemon available in this environment to spin up a standalone Mongo for a CLI smoke test right now).

## Story Points

1

## Suggested Implementation Model

**Haiku** — small, mechanical data-population script, no new logic beyond a clear-and-insert.
