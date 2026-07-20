# 000-007 — Menu "All" Filter with Most Popular

**Status:** Done

## Description

As a customer, I can see the whole menu at once — grouped by category with a heading above each group — instead of only ever viewing one category at a time. The menu page now opens on this "All" view by default, with a curated "Most Popular" section pinned at the top, and I can still narrow to a single category the way I always could.

## Acceptance Criteria

```gherkin
Feature: Browsing the full menu via the All filter

  Scenario: Menu opens to All by default
    Given a customer visits the storefront
    When the menu finishes loading
    Then the "All" tab is shown as active
    And every category's items are visible, each under its own category heading

  Scenario: Most Popular section appears at the top of All
    Given the menu is displayed in the All view
    And the menu includes "Braised Short Rib", "Miso-Glazed Salmon", "Truffle Parmesan Fries", and "Chocolate Lava Cake"
    Then a "Most Popular" section appears above the category sections
    And it shows those four items
    And each of those items also still appears under its own category heading further down the page

  Scenario: Filtering to a single category still works
    Given the menu is displayed in the All view
    When a customer taps a category tab (e.g. "Entrées")
    Then the "All" tab is no longer marked active
    And the item grid narrows to only that category's items, matching today's single-category behavior
    And no category headings or Most Popular section are shown

  Scenario: Returning to All from a category
    Given a customer has a single category selected
    When they tap the "All" tab
    Then the view returns to the grouped, all-categories layout with Most Popular at the top
```

## Technical Notes

- `CategoryTabs.vue`: prepend an "All" entry ahead of the real categories; active-state check treats it like any other tab value.
- `MenuView.vue`: `activeCategory` defaults to `"All"` instead of `categories[0]` on load.
  - When `activeCategory === "All"`: render a `groupedCategories` computed (category name + its items, in existing seed/category order) as stacked sections, each with a heading, plus a `Most Popular` section on top built from a hardcoded `MOST_POPULAR_NAMES` constant (`["Braised Short Rib", "Miso-Glazed Salmon", "Truffle Parmesan Fries", "Chocolate Lava Cake"]`) matched by item name. Items in Most Popular are *not* removed from their category section — they appear in both places.
  - When `activeCategory` is a real category: unchanged flat single-category grid (today's behavior).
- Section/heading style: reuse the existing "Section headers" token already used on Checkout — DM Serif Display, 26px desktop / 18px mobile, `#2b2b26`. No new design tokens needed.
- No schema, DTO, or API changes — Most Popular is a frontend-only hardcoded name list, not a `MenuItem` field. (Tradeoff: won't survive re-seeding with different item names; acceptable since there's no menu-editing UI in v1 per `design.md`.)
- Loading skeleton state is unchanged (still a flat grid of skeleton cards regardless of filter).

## Test Plan

**Automated:**
- Component tests (Vitest + Vue Testing Library):
  - Menu defaults to "All" active on load.
  - All view renders every category as a grouped section with a visible heading.
  - Most Popular section renders the 4 hardcoded items when present in the fetched menu.
  - Most Popular items also still appear under their own category section (not removed/deduped).
  - Tapping a category tab narrows to a flat single-category grid, matching existing pre-ticket behavior, with All no longer active.
  - Tapping All from a category tab returns to the grouped view.
  - `CategoryTabs.vue` renders and active-marks the "All" tab correctly.
- Playwright E2E: update the existing browse → filter → add-to-cart flow (from 000-004) to account for All being the default landing state instead of the first category.

**Manual:** None — no live third-party service, payment flow, or unautomatable UI involved.

**Verification record (2026-07-19):** Automated — added 3 new tests to `CategoryTabs.test.ts` (All tab rendering, active state, select emit) and replaced/added tests in `MenuView.test.ts` (defaults to All, grouped headings, single-category narrowing, return-to-All, Most Popular presence/absence, Most Popular items also appear in their category section) — all written test-first, watched fail, then implemented `CategoryTabs.vue` and `MenuView.vue` to pass. Updated the existing `e2e/menu.spec.ts` Playwright test to assert All-as-default and a visible category heading before the filter-by-category flow; ran against the real dev stack (API via `e2e-server`, web via Vite) — passed. Full workspace `build`/`lint`/`typecheck`/`test` pass (14 API test files/52 tests, 19 web test files/79 tests, shared 2 tests). Manual — launched the real dev stack and screenshotted the built screen at 1280px, 375px, and the filtered single-category state via Playwright: Most Popular pinned at top with the 4 curated items, category sections below each with a DM Serif Display heading matching the Checkout screen's existing header style, mobile collapses to single column, filtering to a category tab still shows the flat grid with no headings — matches the design. No console errors observed.

## Story Points

3

## Suggested Implementation Model

**Sonnet** — typical UI feature work extending an existing screen against a detailed AC; no novel algorithm or cross-system design involved.
