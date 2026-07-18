# 000-006 — Order Confirmation Screen

**Status:** Backlog

## Description

As a customer, after placing an order I see a confirmation screen with my order number, pickup time, and total, so I know my order was received and when to pick it up.

## Acceptance Criteria

```gherkin
Feature: Order confirmation

  Scenario: Viewing confirmation after a successful order
    Given a customer has just completed checkout with a successful payment
    When they land on the Confirmation screen
    Then they see a success indicator, the order number, pickup time, and total
    And they see a stubbed rewards value (real logic ships in Phase 1)

  Scenario: No order history link in Phase 0
    Given a customer is viewing the Confirmation screen
    Then no "View Order History" action is shown
    (removed per docs/design/design_handoff_phase0/README.md — feature not built until later)

  Scenario: Returning to the menu
    Given a customer is viewing the Confirmation screen
    When they tap "Back to Menu"
    Then they are navigated to the Menu screen with an empty cart
```

## Technical Notes

- Build against the Phase 0 design handoff Confirmation section (screen 2a/2b)
- Populated from the `Order` response returned by the checkout flow (000-005) — order number, pickup ETA, total
- Rewards value is a static placeholder, consistent with the stubbed rewards/promo treatment in 000-005
- "View Order History" button is omitted entirely (per the resolved design scope note), not shown-disabled

## Test Plan

**Automated:** Component test rendering the Confirmation screen with mock order data, asserting all fields display and the history button is absent. Playwright E2E extends 000-004/000-005's flow through to confirmation as the final step of the full order journey.

**Manual:** Visual comparison against the 2a/2b Confirmation mock.

## Story Points

3

## Suggested Implementation Model

**Sonnet** — UI-heavy but standard, moderate complexity.
