# 003-004 — Menu Item Images

**Status:** Backlog

## Description

As a customer, I see a real photo for each menu item instead of the current striped placeholder, so the Menu feels less like a wireframe and more like a real restaurant's site.

## Acceptance Criteria

```gherkin
Feature: Menu item photos

  Scenario: Item with a photo
    Given a menu item has an imageUrl in seed data
    When a customer views the Menu
    Then that item's card shows the photo instead of the placeholder

  Scenario: Item without a photo
    Given a menu item has no imageUrl (no suitable match was found)
    When a customer views the Menu
    Then that item's card shows the existing striped placeholder, unchanged from today

  Scenario: Broken image URL
    Given a menu item's imageUrl fails to load
    When the browser reports the image error
    Then the card falls back to the striped placeholder instead of showing a broken-image icon

  Scenario: Photo credits
    Given the Menu includes photos sourced from Wikimedia Commons
    When a customer visits "/readme"
    Then a "Photo credits" section lists each photographed item's author and license
```

## Technical Notes

- Add `imageUrl?: string` to `MenuItemDoc` (`apps/api/src/models/MenuItem.ts`) and `MenuItemDTO` (`packages/shared/src/index.ts`); no schema-level `imageCredit` field needed on the document — credits are static content on `/readme`, not served via the API.
- Source images via Wikimedia Commons search (`commons.wikimedia.org/w/api.php?action=query&list=search...`, no API key required), preferring CC0/public-domain results. Use the `Special:FilePath/File:<name>` direct link as `imageUrl` (stable, no extra redirect lookup at runtime).
- Update `apps/api/src/seed/menuItems.ts` with `imageUrl` per item found; leave it undefined for any item without a decent match rather than forcing a bad one — the placeholder fallback is intentional, acceptable UI for those items.
- `MenuItemCard.vue`: replace the empty `.photo` div with a conditional `<img :src="item.imageUrl" :alt="item.name" loading="lazy" @error="...">` when `imageUrl` is set, falling back to the current striped placeholder div otherwise (including on `@error`, via a local "failed to load" ref).
- Record each sourced image's author/license while curating (needed for the `/readme` credits section) rather than re-deriving it later.

## Test Plan

**Automated:** `MenuItemCard.test.ts` — renders `<img>` when `imageUrl` present, renders placeholder when absent, falls back to placeholder on `@error`. `menuItems.test.ts` (seed) — spot-check that seeded items have well-formed `imageUrl` values where present.

**Manual:** Visually confirm the Menu screen at 1280px and mobile width — photos load, aspect ratio/cropping looks acceptable, placeholder items don't look out of place next to photographed ones. Confirm the `/readme` credits section renders and links resolve.

## Story Points

5

## Suggested Implementation Model

**Sonnet** — mostly mechanical, but curating 19 real, verifiable image matches (not just wiring up UI) involves judgment calls a smaller model would rush.

## Status

Backlog
