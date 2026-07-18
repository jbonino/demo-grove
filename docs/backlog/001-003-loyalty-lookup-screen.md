# 001-003 — Loyalty Lookup Screen

**Status:** Backlog

## Description

As a customer, I can look up my points balance, order history, available rewards, and recent point activity by phone number, without needing an account. New `/loyalty` screen per the Phase 1 design mock (screen 1a/1b).

## Acceptance Criteria

```gherkin
Feature: Loyalty phone lookup

  Scenario: Looking up a known phone number
    Given a phone number has existing order and loyalty history
    When a customer enters it on /loyalty and taps "Look Up"
    Then they see their points balance, lifetime order count, available rewards, and recent point activity

  Scenario: Reward list on the lookup screen
    Given a customer has looked up their balance
    Then all rewards are shown in the same row style as checkout's redemption list
    But all rows are read-only (locked/"need X more" state, no radio selector) since redemption only happens at checkout

  Scenario: Recent activity list
    Given a customer has looked up their balance
    Then recent activity shows each order's id, date, points delta, and an optional note (e.g. "Redeemed Free Flatbread")

  Scenario: Looking up an unknown phone number
    Given a phone number has no order or loyalty history
    When a customer looks it up
    Then they see a simple "no rewards history found for this number" message in place of the stat cards/activity list
    (undesigned default per the Phase 1 design handoff — same treatment as Phase 0's undesigned states)

  Scenario: Reward thresholds recompute live
    Given a customer's balance changes between visits
    When they look up their number again
    Then "need X more" copy and locked/unlocked state reflect the current balance vs. each reward's live pointsCost, not a cached value
```

## Technical Notes

- Build against the Phase 1 design handoff, Loyalty Lookup section (screen 1a/1b) — nav bar with "Rewards" tab active, phone input + "Look Up" button, stat cards (Points Balance filled-green card, Lifetime Orders white card), reward list, recent activity list.
- New endpoint: `GET /api/loyalty/:phone` returning `{ pointsBalance, lifetimeOrders, availableRewards: [{name, cost, discountAmount, unlocked}], activity: [{orderId, date, pointsDelta, note}] }` — balance computed the same way as 001-001's ledger sum; reuse that helper rather than duplicating the aggregation.
- `unlocked` on each reward is derived server-side from the phone's current balance vs. the reward's `pointsCost`, matching 001-002's checkout logic so both screens agree.
- New route `/loyalty` in `apps/web/src/router`, reachable from the header nav's "Rewards" tab and from Confirmation's "Check My Rewards" button (001-002).

## Test Plan

**Automated:** Integration test for `GET /api/loyalty/:phone` covering a phone with mixed history, a phone with no history (empty-state shape), and reward unlock-threshold correctness. Component tests for the lookup form, stat cards, reward list (all-locked read-only rendering), and activity list. Playwright E2E: look up a seeded phone number with history and confirm balance/rewards/activity render.

**Manual:** Look up a phone number with no history and confirm the undesigned empty-state message renders cleanly at both desktop and mobile widths (no design reference exists for this state).

## Story Points

5

## Suggested Implementation Model

**Sonnet** — a new screen and endpoint, but the balance/reward logic reuses 001-001's patterns; no novel algorithm.
