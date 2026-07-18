# 001-001 — Loyalty Data Model & Accrual/Redemption Logic

**Status:** Active

## Description

As the system, I track a customer's loyalty points as an auditable ledger and let a checkout redeem an available reward as a discount, or accrue points on a successful payment. This is the backend foundation Phase 1's checkout and lookup screens build on: the `LoyaltyEvents`/`Rewards` collections, the balance/redemption logic wired into the existing order + webhook flow, and expanded seed data so the demo has loyalty history from the start.

## Acceptance Criteria

```gherkin
Feature: Loyalty ledger, accrual, and redemption

  Scenario: Earning points on a successful payment
    Given a customer completes checkout with no reward applied
    When the Stripe webhook confirms payment and the Order is created
    Then a LoyaltyEvent of type "earn" is written for that phone number
    And its points equal ceil(subtotalCents / 100) — i.e. one point per dollar of the (undiscounted) subtotal, rounded up

  Scenario: Redeeming a reward at checkout
    Given a phone number's current balance covers a reward's pointsCost
    When checkout is submitted with that rewardId
    Then the PaymentIntent amount is server-recomputed as subtotal minus the reward's discount amount
    And on successful payment, a "redeem" LoyaltyEvent (negative points) and an "earn" LoyaltyEvent (on the discounted subtotal) are both written alongside the Order
    And the Order records which reward was redeemed

  Scenario: Rejecting an unaffordable reward
    Given a phone number's current balance does not cover a reward's pointsCost
    When checkout is submitted with that rewardId anyway
    Then the API rejects the request before creating a PaymentIntent
    And no LoyaltyEvent or Order is created

  Scenario: Balance is derived, not stored
    Given a phone number has a mix of earn and redeem LoyaltyEvents
    When its balance is computed
    Then it equals the sum of all matching LoyaltyEvents.points (earn positive, redeem negative)
    And no separate mutable balance counter exists anywhere

  Scenario: Idempotent webhook redelivery
    Given a webhook event for an already-processed PaymentIntent is redelivered
    When it's handled again
    Then no duplicate LoyaltyEvents are created (same idempotency guarantee as the existing Order upsert)

  Scenario: Seeded rewards catalog
    Given the seed script has run
    Then a small fixed Rewards catalog exists (e.g. "Free appetizer — 300 pts", "$10 off — 500 pts")

  Scenario: Seeded customer loyalty history
    Given the seed script has run
    Then ~30-40 customers exist with realistic phone numbers and order/LoyaltyEvent history
    And some are seeded near a reward's point threshold and some have past redemptions, so the demo has texture from the start
```

## Technical Notes

- New models: `LoyaltyEvent` (`phone`, `orderId: ObjectId | null`, `type: "earn" | "redeem"`, `points: number`, `createdAt`) and `Reward` (`name`, `pointsCost`, `description`), per `design.md` §6.
- Extend `POST /api/orders` to accept an optional `rewardId`; validate affordability against the live-computed balance (sum of that phone's LoyaltyEvents) before creating the PaymentIntent, and recompute the charge amount server-side — never trust a client-sent discount.
- Extend the Stripe webhook handler: alongside the existing `findOneAndUpdate` upsert that creates the Order, write the `earn` (and `redeem`, if applicable) LoyaltyEvents in the same handler, keyed so redelivery is a no-op — mirrors the existing `stripePaymentIntentId` idempotency pattern.
- Points accrual is `Math.ceil(discountedSubtotalCents / 100)` (ceiling, not floor — a deliberate deviation from the design handoff README's "floor" note, decided during Phase 1 brainstorming).
- Add a `GET /api/rewards` endpoint (full catalog) — consumed by both the checkout reward-selection UI (001-002) and the `/loyalty` screen (001-003).
- Expand `apps/api/src/scripts/seed.ts` to generate the ~30-40 customer loyalty histories called for in `design.md` §5.

## Test Plan

**Automated:** Unit tests for balance derivation (sum of mixed earn/redeem events) and the ceil-based points calculation (including cent-rounding edge cases). Integration tests extending the existing order/webhook suite: reward redemption discounts the PaymentIntent amount correctly, an unaffordable reward is rejected pre-PaymentIntent, webhook redelivery doesn't duplicate LoyaltyEvents, and both earn+redeem events are written correctly on a redeemed order.

**Manual:** None — this ticket has no UI surface; behavior is fully exercised by automated API/integration tests.

## Story Points

8

## Suggested Implementation Model

**Sonnet** — the ledger/balance logic and redemption validation are well-established patterns (server-side recompute, idempotent upsert) rather than a novel algorithm, but there's enough surface (two new models, webhook changes, seed data) to be more than mechanical.
