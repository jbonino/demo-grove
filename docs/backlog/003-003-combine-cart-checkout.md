# 003-003 — Combine Cart & Checkout

**Status:** Backlog

## Description

As a customer, I place my order in one screen instead of two. Adding an item takes me straight to `/checkout`, where I can adjust quantities, fill in contact/pickup details, redeem a reward, and pay — all on one page. The separate Cart screen goes away.

## Acceptance Criteria

```gherkin
Feature: Combined cart and checkout

  Scenario: Going straight to the combined screen
    Given a customer has at least one item in their cart
    When they tap the cart pill or "Add to Cart"
    Then they land on "/checkout" showing their order line items above the contact/pickup/payment sections

  Scenario: Adjusting quantities on the combined screen
    Given a customer is on the "/checkout" screen with items in their cart
    When they use the "+"/"-" stepper on a line item
    Then the quantity and order summary total update accordingly
    And reducing a line item's quantity to 0 removes it from the cart

  Scenario: Emptying the cart from the combined screen
    Given a customer removes their last item via the stepper while on "/checkout"
    Then they see the empty-cart message and a link back to the Menu, in place of the checkout form

  Scenario: Empty cart, direct navigation
    Given a customer's cart has no items
    When they navigate to "/checkout" directly
    Then they see the same empty-cart state described above

  Scenario: Old cart links still work
    Given a customer or link still points at "/cart"
    When they load that URL
    Then they are redirected to "/checkout"

  Scenario: Placing an order
    Given a customer has adjusted quantities, filled in contact info, pickup time, and a valid test-mode card
    When they tap "Place Order"
    Then the existing order/payment flow proceeds unchanged (per 000-005 and 001-002)
```

## Technical Notes

- Fold `CartLineItem` rendering (with its existing `@set-quantity="cart.setQuantity"` wiring) into `CheckoutView.vue` as a new "Your Order" section at the top of `.sections`, above Contact.
- Empty-cart guard covers the whole form, not just the line-items section — no `phone`/`payment` sections render with zero items.
- Delete `CartView.vue` and its route; add `{ path: "/cart", redirect: "/checkout" }` in `router/index.ts` (and `test/testRouter.ts`).
- `AppHeader.vue` cart-pill target changes from `/cart` to `/checkout`.
- Step label changes from "Step 2 of 3 · Checkout" to "Step 1 of 2 · Order" (flow is now Menu → Order → Confirmation).
- Update `design.md` §4 screens list to drop the standalone `cart` entry.
- No backend/API changes — this is UI-only reshuffling of existing components.

## Test Plan

**Automated:** Merge `CartView.test.ts`'s cases (stepper increment/decrement/remove-at-zero, empty-cart state) into `CheckoutView.test.ts`, alongside its existing checkout-validation and payment-success/failure tests. Add a router test asserting `/cart` redirects to `/checkout`. `CartLineItem.test.ts` and `cart.test.ts` (store) are unaffected.

**Automated E2E:** Update `e2e/checkout.spec.ts` to drive quantity adjustment directly on `/checkout` instead of visiting a separate `/cart` page first; keep the existing success/declined-card assertions.

**Manual:** None beyond the above — no new third-party/live-service surface (Stripe flow is unchanged, just relocated on the page).

## Story Points

3

## Suggested Implementation Model

**Haiku** — mechanical relocation of existing, already-tested components and a route redirect; no new algorithms or cross-system design.

## Status

Backlog
