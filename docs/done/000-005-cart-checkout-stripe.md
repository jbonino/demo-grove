# 000-005 — Cart, Checkout & Stripe Payment

**Status:** Done

## Description

As a customer, I can review and adjust my cart, provide contact and pickup details, and pay to place my order. Covers the Cart and Checkout screens and the real payment integration that turns a cart into a paid `Order`.

## Acceptance Criteria

```gherkin
Feature: Cart review and checkout

  Scenario: Adjusting cart quantities
    Given a customer has items in their cart
    When they use the "+"/"-" stepper on a line item
    Then the quantity and order summary total update accordingly
    And reducing a line item's quantity to 0 removes it from the cart

  Scenario: Empty cart state
    Given a customer's cart has no items
    When they view the Cart screen
    Then they see a simple message and a link back to the Menu
    (undesigned default per docs/design/design_handoff_phase0/README.md)

  Scenario: Proceeding to checkout
    Given a customer has at least one item in their cart
    When they tap "Go to Checkout"
    Then they see the Checkout screen with contact, pickup time, and payment sections

  Scenario: Pickup time selection
    Given a customer is on the Checkout screen
    When they select "Schedule for later" instead of "ASAP"
    Then a simple time picker appears to choose a pickup time
    (undesigned default per docs/design/design_handoff_phase0/README.md)

  Scenario: Placing an order
    Given a customer has filled in contact info, pickup time, and a valid test-mode card
    When they tap "Place Order"
    Then a Stripe test-mode payment is processed
    And an Order is created recording the items, subtotal, phone, and Stripe payment intent id
    And the customer is navigated to the Confirmation screen

  Scenario: Payment failure
    Given a customer submits an invalid or declined test card
    When the payment fails
    Then they see an error message and remain on the Checkout screen
    And no Order is created

  Scenario: Stubbed rewards/promo UI
    Given a customer is viewing the Cart or Checkout screen
    Then a "Rewards points" line and a promo code field are visible per the design mock
    But they are non-functional placeholders (real logic ships in Phase 1)
```

## Technical Notes

- Build against the Phase 0 design handoff, Cart and Checkout sections of screens 2a/2b
- Stripe integration: Stripe Elements embedded card form (matches the mock's inline card-on-file UI, not a redirect-based Checkout Session) + PaymentIntents API
- `POST /api/orders` creates a PaymentIntent and, on confirmed success (via Stripe webhook, signature-verified), creates the `Order` — idempotent on `stripePaymentIntentId` so webhook redelivery doesn't double-create orders
- Cart/checkout state extends the store introduced in 000-004
- Rewards/promo elements render per the mock but are inert (no wired logic) per the resolved scope note in the design handoff README

## Test Plan

**Automated:** Unit tests for cart total calculation (subtotal, quantity edge cases). Integration tests for the order API — PaymentIntent creation, webhook signature verification, idempotent Order creation, failure path. Playwright E2E for the full happy path (cart → checkout → successful test-card payment) using a Stripe test card.

**Manual:** Run the checkout flow with a real Stripe test card (e.g. `4242 4242 4242 4242`) and a declined test card, confirming both the success and failure paths end-to-end. Also manually verify the empty-cart state and the schedule-time picker, since neither has a design reference to compare against.

**Verification record (2026-07-17):**
- **Automated (apps/api):** 21 tests. `orders.test.ts` and `stripeWebhook.test.ts` make real calls to the Stripe test API — a genuine PaymentIntent is created and its amount matches the server-recomputed subtotal (not client-trusted prices); the webhook handler is exercised with `stripe.webhooks.generateTestHeaderString`-signed payloads, verifying both a valid-signature success path (Order created, status `paid`) and an invalid-signature rejection (400, no Order). A same-PaymentIntent redelivery test confirms exactly one Order is ever created (idempotency), backed by a unique+sparse index on `stripePaymentIntentId`.
- **Automated (apps/web):** 33 component/store tests, including cart quantity stepper (increment/decrement/remove-at-zero), empty-cart state, Cart→Checkout navigation, Checkout validation, and — with Stripe.js mocked — both the payment-success (cart cleared, navigates to Confirmation) and payment-failure (inline error, stays on Checkout) paths.
- **Automated E2E (Playwright, real Stripe):** `e2e/checkout.spec.ts` drives the actual Stripe Elements card iframe with Stripe's test cards against the full real stack — API backed by a freshly-seeded in-memory MongoDB (`e2eServer.ts`) and `stripe listen --forward-to localhost:3001/api/stripe/webhook` (`stripe:listen` npm script) for webhook delivery, both orchestrated automatically as Playwright `webServer` entries when `apps/api/.env` has `STRIPE_SECRET_KEY` set (skipped otherwise). Verified `4242 4242 4242 4242` → real PaymentIntent → real webhook → Order created → Confirmation screen, and `4000 0000 0000 0002` (declined) → inline error, stays on Checkout. Ran clean from a cold start (`npx playwright test`, no servers pre-started): 3/3 passed.
- **Manual:** Screenshotted the empty-cart state (`/cart` with no items) and the "Schedule for later" time picker (Checkout) at 1280px — both render cleanly with the established design tokens. The success/declined-card paths above were verified against real Stripe infrastructure via the Playwright run rather than separately by hand, which is a stronger check than manual clicking would have been.
- Full workspace `build`/`lint`/`typecheck`/`test` pass.

## Story Points

8

## Suggested Implementation Model

**Sonnet** — the largest ticket in the phase (UI + Stripe integration + webhook idempotency), but the approach is well-established rather than novel.
