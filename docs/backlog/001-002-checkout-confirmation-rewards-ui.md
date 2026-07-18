# 001-002 — Checkout & Confirmation: Rewards UI

**Status:** Backlog

## Description

As a customer, I see my points balance and available rewards at checkout, can pick one reward to redeem, and see what I earned once my order is placed. Extends the Phase 0 Checkout and Confirmation screens with the points/reward elements from the Phase 1 design mock (screens 1a/1b), wired to the accrual/redemption API built in 001-001.

## Acceptance Criteria

```gherkin
Feature: Rewards at checkout and confirmation

  Scenario: Points banner shown at checkout
    Given a customer enters a phone number with a positive points balance
    When they view the Checkout screen
    Then a points banner shows their balance and how many rewards it's enough for

  Scenario: Selecting an available reward
    Given a customer's balance covers at least one reward
    When they select that reward from the "Redeem a Reward" list
    Then the Order Summary sidebar shows a reward discount line, an updated total, and an updated "you'll earn +N pts" estimate

  Scenario: Locked rewards are not selectable
    Given a reward's pointsCost exceeds the customer's current balance
    When they view the "Redeem a Reward" list
    Then that reward row appears locked (muted, "need X more" copy) and is not selectable

  Scenario: Placing an order with a redeemed reward
    Given a customer has selected an available reward and a valid test card
    When they tap "Place Order"
    Then the discounted amount is charged via Stripe
    And the Confirmation screen shows the reward that was applied

  Scenario: Points-earned pill on confirmation
    Given an order was successfully placed
    When the customer reaches the Confirmation screen
    Then a points-earned pill shows the points earned on this order and the resulting balance
    And the info-card stat row includes a "Reward Used" column only if a reward was redeemed on that order

  Scenario: "Check My Rewards" navigation
    Given a customer is on the Confirmation screen
    When they tap "Check My Rewards"
    Then they are navigated to the /loyalty screen

  Scenario: Card-only payment (Apple Pay cut from this phase)
    Given a customer is on the Checkout screen
    Then only the card payment method is shown
    (Apple Pay from the design mock is deferred to Phase 3 — see product-roadmap.md; real Apple Pay needs domain verification against a live HTTPS URL, which doesn't exist until Phase 3)
```

## Technical Notes

- Build against the Phase 1 design handoff (`docs/design/design_handoff_phase1/`), Checkout and Confirmation sections — Apple Pay row from the mock is intentionally excluded per the Phase 1 brainstorming decision (now reflected in `design.md` §3 and `product-roadmap.md` Phase 3).
- Fetches the reward catalog via `GET /api/rewards` and the phone's live balance (reuse the `/api/loyalty/:phone` read added in 001-003, or compute inline — coordinate with that ticket to avoid duplicating the balance query) to render locked/unlocked state and "need X more" copy live, not hardcoded.
- Reward selection is client-side UI state only; the actual discount is computed server-side by `POST /api/orders` (001-001) — the sidebar's live total update is an optimistic client-side estimate matching the same formula the server uses.
- Replaces the Phase 0 stubbed `STATIC_REWARDS_POINTS` placeholder (`apps/web/src/constants.ts`) with real data.
- Confirmation screen conditionally renders the "Reward Used" stat column only when `Order.rewardRedeemed` is set, per the mock's note that it's order-dependent.

## Test Plan

**Automated:** Component tests for the reward list (locked vs. available rendering, radio selection, live total recalculation) and the points banner/pill. Integration/component test confirming a redeemed-reward order flows through to the correct Confirmation display. Extend the existing Playwright checkout E2E with a reward-redemption path using a phone number seeded (001-001) with enough points.

**Manual:** Run checkout with a phone number that has zero points (no banner/rewards shown), a phone number with a locked-only reward, and a phone number that can redeem — confirm all three render correctly end-to-end with a real Stripe test card.

## Story Points

5

## Suggested Implementation Model

**Sonnet** — UI wiring against an already-built API, following established Phase 0 checkout/confirmation patterns; no new algorithms.
