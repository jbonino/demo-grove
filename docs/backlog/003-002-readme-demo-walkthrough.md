# 003-002 — README + Demo Walkthrough

## User-facing description

Anyone opening the repo (e.g. an interviewer) finds a README with a short project/architecture overview, the live URLs, and a scripted walkthrough of both the customer and admin paths they can follow themselves.

## Acceptance Criteria

```gherkin
Feature: README documents the project and demo walkthrough

  Scenario: README exists with project overview
    Given the repo's root README.md
    When someone opens it
    Then it describes the project concept, stack, and architecture at a glance

  Scenario: README scripts the customer path
    Given the README's walkthrough section
    When someone follows it step by step against the live URL
    Then they browse the menu, add to cart, check out with a Stripe test card, and reach the confirmation screen with points earned

  Scenario: README scripts the admin path
    Given the README's walkthrough section
    When someone follows it step by step against the live URL
    Then they log into /admin and view the dashboard, customers list, and orders list
```

## Technical notes

- Root `README.md`: concept summary (from `design.md` §1-2), stack/architecture summary (from `design.md` §7 / `architecture.md`), link to the live URL (003-001).
- Walkthrough script: concrete numbered steps for the customer path (browse → cart → checkout with a specific Stripe test card number → confirmation → loyalty lookup) and the admin path (login with the shared password → dashboard → customers → orders).
- Depends on 003-001 being deployed so the URL and steps can be verified against the real thing rather than written speculatively.

## Test plan

- **Automated:** none — this is a documentation deliverable.
- **Manual:** follow the README's own walkthrough script top to bottom against the live URLs exactly as written; confirm every step works as described and fix any step that doesn't match reality.

## Story point estimate

2

## Suggested implementation model

Haiku — mechanical assembly of already-decided facts (concept, stack, URLs, steps) into a doc; no new decisions or algorithms involved.

## Status

Backlog
