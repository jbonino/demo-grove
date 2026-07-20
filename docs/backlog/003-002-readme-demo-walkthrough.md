# 003-002 — In-App /readme Page + Demo Walkthrough

## User-facing description

Anyone with just the live URL (e.g. an interviewer, since the repo is private) can visit `/readme` and find a short project/architecture overview plus a scripted walkthrough of both the customer and admin paths they can follow themselves. The repo's root `README.md` mirrors the same content for anyone who does have repo access.

## Acceptance Criteria

```gherkin
Feature: /readme page documents the project and demo walkthrough

  Scenario: /readme is reachable without repo access
    Given the deployed app
    When someone visits /readme directly (no repo access, just the URL)
    Then they see the project concept, stack, and architecture at a glance

  Scenario: /readme scripts the customer path
    Given the /readme page's walkthrough section
    When someone follows it step by step against the live app
    Then they browse the menu, add to cart, check out with a Stripe test card, and reach the confirmation screen with points earned

  Scenario: /readme scripts the admin path
    Given the /readme page's walkthrough section
    When someone follows it step by step against the live app
    Then they log into /admin and view the dashboard, customers list, and orders list

  Scenario: Repo README mirrors the in-app page
    Given the repo's root README.md
    When someone with repo access opens it
    Then it contains the same project overview and walkthrough content as /readme
```

## Technical notes

- New Vue route `/readme` (`apps/web/src/views/ReadmeView.vue`) — a plain content page, not part of the customer/admin nav, linkable directly. Static content (no API calls): project concept/stack summary + the same walkthrough steps as the README.
- Root `README.md`: concept summary (from `design.md` §1-2), stack/architecture summary (from `design.md` §7 / `architecture.md`), link to the live URL's `/readme` page. Written as the same source content as `ReadmeView.vue` — write once, keep both in sync (a shared markdown snippet or just careful copy-paste is fine at this scale; no need for a build-time content pipeline).
- Walkthrough script: concrete numbered steps for the customer path (browse → cart → checkout with a specific Stripe test card number → confirmation → loyalty lookup) and the admin path (login with the shared password → dashboard → customers → orders).
- Depends on 003-001 being deployed so the URL and steps can be verified against the real thing rather than written speculatively.

## Test plan

- **Automated:** a component test asserting `/readme` renders (route resolves, key content present) — consistent with existing `apps/web` component test coverage.
- **Manual:** follow the `/readme` page's own walkthrough script top to bottom against the live URL exactly as written; confirm every step works as described and fix any step that doesn't match reality. Spot-check the root `README.md` matches.

## Story point estimate

3

## Suggested implementation model

Sonnet — mostly content assembly, but adding a new route/view and keeping two copies of the content in sync is more than a purely mechanical doc task.

## Status

Backlog
