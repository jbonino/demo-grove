# 000-006 — Order Confirmation Screen

**Status:** Done

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

**Verification record (2026-07-17):** Delivered as part of 000-005 rather than as separate work — the Checkout flow needed a landing screen to redirect to on successful payment, so `ConfirmationView.vue` was built and merged alongside it. All three Gherkin scenarios here are already satisfied by that implementation:
- Success indicator, order number (`#` + last 6 chars of order id), pickup time, subtotal, and stubbed rewards value all render — see `ConfirmationView.vue` and its component test `ConfirmationView.test.ts`.
- No "View Order History" action exists anywhere in the view (test asserts absence).
- "Back to Menu" links to `/`; the cart is already cleared in `CheckoutView.vue` on successful payment (before the redirect), so the Menu is reached with an empty cart.
- `e2e/checkout.spec.ts` (Playwright, real Stripe test-mode) drives the full flow through to `/confirmation/...` as its final assertion.

No additional implementation needed. Closing as Done without a separate branch/PR.

## Story Points

3

## Suggested Implementation Model

**Sonnet** — UI-heavy but standard, moderate complexity.
