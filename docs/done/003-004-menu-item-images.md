# 003-004 — Menu Item Images

**Status:** Done

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
    When someone with repo access opens "CREDITS.md"
    Then it lists each photographed item's author, license, and source link
    (ticket 003-002's /readme page doesn't exist yet; move this content there once it ships)
```

## Technical Notes

- Add `imageUrl?: string` to `MenuItemDoc` (`apps/api/src/models/MenuItem.ts`) and `MenuItemDTO` (`packages/shared/src/index.ts`); no schema-level `imageCredit` field needed on the document — credits live in `CREDITS.md`, not served via the API.
- Source images via Wikimedia Commons search (`commons.wikimedia.org/w/api.php?action=query&list=search...`, no API key required), preferring CC0/CC-BY/public-domain results. Use a 500px-wide thumbnail URL (`/thumb/.../500px-<file>`) as `imageUrl`, not the full-resolution original — some source photos are 4000px+.
- Update `apps/api/src/seed/menuItems.ts` with `imageUrl` per item found; leave it undefined for any item without a decent match rather than forcing a bad one — the placeholder fallback is intentional, acceptable UI for those items.
- `MenuItemCard.vue`: replace the empty `.photo` div with a conditional `<img :src="item.imageUrl" :alt="item.name" loading="lazy" @error="...">` when `imageUrl` is set, falling back to the current striped placeholder div otherwise (including on `@error`, via a local "failed to load" ref).
- Add `CREDITS.md` at repo root listing each photographed item's file name, author, license, and Commons source link.

## Test Plan

**Automated:** `MenuItemCard.test.ts` — renders `<img>` when `imageUrl` present, renders placeholder when absent, falls back to placeholder on `@error`. `menuItems.test.ts` (seed) — spot-check that seeded items have well-formed `imageUrl` values where present.

**Manual:** Visually confirm the Menu screen at 1280px and mobile width — photos load, aspect ratio/cropping looks acceptable, placeholder items don't look out of place next to photographed ones. Confirm `CREDITS.md` links resolve.

**Verification record (2026-07-20):**
- **Automated:** `MenuItemCard.test.ts` (3 new tests: image shown when `imageUrl` present, placeholder shown when absent, falls back to placeholder on `@error`) — 9/9 pass. `MenuItem.test.ts` (2 new tests for optional `imageUrl` on the schema) — 6/6 pass. `menuItems.test.ts` route (2 new tests: `imageUrl` included/omitted in the DTO) — 4/4 pass. `menuItems.test.ts` seed (1 new test: ≥15 items have a well-formed `https://` `imageUrl`) — 3/3 pass. Full workspace: apps/api 113/113, apps/web 133/133.
- **Sourcing:** Queried Wikimedia Commons' public search API (no key required) for all 19 seeded items; 18 resolved to a real, verifiable CC0/CC-BY/CC-BY-SA photo (500px thumbnail URLs, HEAD-checked to confirm they resolve). "Roasted Bone Marrow" had no decent match (only medical bone-marrow imagery on Commons) and intentionally keeps the placeholder — matches the AC's "item without a photo" scenario.
- **Manual:** Re-seeded the local dev DB and screenshotted the Menu screen at 1280px and 390px (mobile) with the real API — all 18 photos render correctly cropped, Roasted Bone Marrow shows the striped placeholder as expected, no layout breakage in either width. `CREDITS.md` written with all 18 attributions and links to their Commons file pages.
- Full workspace `build` and `lint` pass clean (pre-existing `vue/one-component-per-file` warnings in `apps/api/src/app.test.ts` are unrelated to this change).

## Story Points

5

## Suggested Implementation Model

**Sonnet** — mostly mechanical, but curating 19 real, verifiable image matches (not just wiring up UI) involves judgment calls a smaller model would rush.

## Status

Done
