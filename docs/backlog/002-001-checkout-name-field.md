# 002-001 — Checkout Name Field & Seed Backfill

**Status:** Active

## Description

As a customer, I can optionally give my name at checkout. As the system, every downstream admin screen in Phase 2 needs *something* to show for "who placed this order" beyond a bare phone number, and today nothing captures one — this ticket adds that field and backfills the seed data so the admin panel has realistic names from the start.

## Acceptance Criteria

```gherkin
Feature: Optional customer name at checkout

  Scenario: Providing a name
    Given a customer is on the Checkout screen
    When they enter a name and complete payment successfully
    Then the resulting Order stores that name as customerName

  Scenario: Leaving the name blank
    Given a customer is on the Checkout screen
    When they leave the name field empty and complete payment successfully
    Then the resulting Order's customerName is null
    And checkout is not blocked by the missing name

  Scenario: Seeded orders have names
    Given the seed script has run
    Then the synthetic ~30-40 customer order histories include realistic customerName values on their Orders
    And a subset are left with customerName null, to exercise the "no name on file" case in admin screens
```

## Technical Notes

- `Order` schema (`apps/api/src/models/Order.ts`): add `customerName: string | null` (default `null`), written by the Stripe webhook handler alongside the existing `rewardRedeemed`/`pointsEarned`/`pointsBalanceAfter` fields — same place `phone` already lands, sourced from PaymentIntent metadata (`customerName`) the same way cart/phone/pickup already are.
- `POST /api/orders`: accept an optional `name` in the request body, pass it through to PaymentIntent metadata alongside the existing cart/phone/pickup snapshot.
- Checkout UI: add an optional "Name" text input near the existing phone field, no validation beyond normal trimming — not required to submit.
- `apps/api/src/seed/loyaltyHistory.ts`: generate a name per synthetic customer (a small hardcoded first/last name pool is fine — no need for a name-generation library) and leave a subset (e.g. ~15-20%) with no name, matching real-world checkout behavior where the field is skipped.
- No change to `LoyaltyEvent` — it stays phone-only, matching `design.md` §6.
- This is a deliberate, brainstorming-approved deviation from `design.md` §6's `Orders` field list (`items, subtotal, phone, stripePaymentIntentId, status, createdAt` — no name) and from the Phase 2 design handoff, which shows names in the admin mock without any system that captures them. `architecture.md` is updated in this ticket's commit to reflect the new field.

## Test Plan

**Automated:**
- API integration test: submitting checkout with a name persists it on the created Order (via the existing webhook-driven Order-creation test path).
- API integration test: submitting checkout with no name persists `customerName: null`, and the order is created successfully (not blocked).
- Seed script test: `seedLoyaltyHistory` produces Orders with a mix of populated and `null` `customerName`.
- Component test: Checkout renders the optional name field and includes its value in the order-creation request when filled.

**Manual:** None — no live third-party service, payment flow, or unautomatable UI beyond what's already covered by the existing Stripe Elements integration test pattern.

## Story Points

3

## Suggested Implementation Model

**Sonnet** — small schema/field addition following an established pattern (metadata → webhook → Order field), plus seed data generation; not mechanical enough for Haiku given it touches the already-shipped checkout/webhook flow, but no novel design.
