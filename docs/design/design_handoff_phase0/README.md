
# Handoff: Grove Phase 0 Ordering Flow

## Overview
Phase 0 ordering flow for Grove: browse menu → cart → checkout → order confirmation. Direction "1a" (rustic farmhouse) was selected from 3 explored options. Desktop and mobile layouts are both mocked.

## About the Design Files
The bundled file (`Grove - Phase 0 Visuals.dc.html`) is a **design reference built in HTML** — a prototype showing intended look, layout, and copy, not production code. Target stack is **Vue.js**. The task is to recreate these screens as Vue components/routes using the project's existing conventions (component library, router, state management) — do not port the raw HTML/inline styles directly; treat them as the visual and structural spec.

Open the file directly in a browser to view it. It contains two turns: turn 1 (three rejected direction explorations, ids 1a/1b/1c) and turn 2 (the selected direction's full flow, ids 2a desktop / 2b mobile). **Only turn 2 (2a/2b) is in scope for build** — turn 1 is kept for context on why 1a was chosen but should not be implemented.

## Fidelity
**High-fidelity.** Colors, typography, spacing, and copy in the turn-2 screens are final for Phase 0. Menu item photos and any real menu data are placeholders (dashed/hatched rectangles marked "menu item photo") — swap for real photography and live menu content.

## Screens / Views

### 1. Menu (Storefront)
- **Purpose**: Browse today's menu, add items to cart.
- **Layout (desktop, 1280px reference width)**: Sticky header (padding 20px 48px) → category tab row (padding 36px 48px 12px, bottom border) → 3-column grid of item cards (gap 24px, padding 32px 48px 48px).
- **Layout (mobile, 375px reference width)**: Header condensed (16px 20px padding) → horizontally scrollable category tabs → single-column stacked list of item cards (each a horizontal photo+details row, 90×90px photo).
- **Header**: background `#2f4d3a`, text `#faf7f0`. Logo "Grove" in DM Serif Display 26px (20px mobile). Nav links (desktop only): Menu, Rewards, Order History, 14px/500 Work Sans. Cart pill: background `#c9a24b`, text `#2f2410`, 14px/600, "Cart · 3", radius 3px (14px pill on mobile).
- **Category tabs**: DM Serif Display 17px (14px mobile). Active tab: color `#2f4d3a`, 2px bottom border `#2f4d3a`. Inactive: `#9a9182`.
- **Item card**: white bg, 1px border `#e6dfc9`, radius 6px (8px mobile). Photo area 150px tall (desktop) / 90×90px (mobile), placeholder hatch pattern. Title: DM Serif Display 18px `#2b2b26` (15px mobile), price right-aligned same row. Description: Work Sans 13px `#7a7362`. "Add" button: background `#2f4d3a`, text `#faf7f0`, 13px/600, padding 8px 16px, radius 3px.

### 2. Cart
- **Purpose**: Review/adjust selected items, apply promo, proceed to checkout.
- **Layout (desktop)**: Two-column grid (1.6fr / 1fr, gap 48px, padding 44px 48px). Left: cart line items list. Right: sticky order-summary card.
- **Layout (mobile)**: Single column — line items stacked, then summary card below (18px padding, radius 8px).
- **Line item row**: 76×76px (56×56 mobile) hatched photo placeholder, radius 6px; title DM Serif Display 17px (14px mobile) `#2b2b26`; modifier note 12px `#7a7362`; quantity stepper (pill, 1px border `#e6dfc9`, radius 20px/16px, "–", count, "+" in `#2f4d3a` bold); price right-aligned 600 weight.
- **Promo field** (desktop only in mock): dashed border `#c9a24b` input + "Apply" button (outline `#2f4d3a`).
- **Order Summary card**: white, border `#e6dfc9`, radius 8px, padding 28px (18px mobile). Rows: Subtotal, Tax, Rewards points (gold `#c9a24b` text), divider, then Total in DM Serif Display 20px (17px mobile). CTA button full-width: background `#2f4d3a`, text `#faf7f0`, 14–15px/600, radius 4px, "Go to Checkout".

### 3. Checkout
- **Purpose**: Confirm contact info, pickup time, and payment; place order.
- **Layout (desktop)**: Header shows "Step 2 of 3 · Checkout" (no nav/cart pill). Two-column grid (1.6fr/1fr, gap 48px): left = Contact / Pickup Time / Payment sections stacked; right = order summary sidebar (same card pattern as Cart, but line items itemized instead of promo field, CTA reads "Place Order").
- **Layout (mobile)**: Single column, sections stacked, CTA at bottom reads "Place Order · $34.88" (price inline).
- **Section headers**: DM Serif Display 26px (18px mobile) `#2b2b26`.
- **Contact fields**: 2-column grid (name, phone) on desktop, stacked on mobile. Input style: 1px border `#e6dfc9`, radius 4px, padding 13px 16px (12px 14px mobile), white bg.
- **Pickup time**: pill toggle group. Selected: filled `#2f4d3a` bg / `#faf7f0` text. Unselected: white bg, border `#e6dfc9`, text `#5c5646`. Radius 20px (18px mobile).
- **Payment**: card row with border `#2f4d3a` (selected state), radius 6px, padding 16px 18px (14px mobile). Contains a small card-brand chip (e.g. "VISA", dark bg `#2b2b26`, radius 3px) + masked number "•••• 4242" + "Change" link (desktop only) in `#c9a24b`.

### 4. Confirmation
- **Purpose**: Confirm order placed, show pickup ETA and summary, offer next actions.
- **Layout**: Centered column, header reads "Order Confirmed" (no nav). Desktop padding 64px 48px; mobile 44px 24px.
- **Success icon**: 64px (52px mobile) circle, background `#c9a24b`, white checkmark stroke `#2f4d3a` (SVG check, stroke-width 2.5).
- **Heading**: DM Serif Display 32px (22px mobile) `#2b2b26`, "You're all set, {name}".
- **Subtext**: 15px (13px mobile) `#7a7362`, order number + pickup phone confirmation copy.
- **Info card**: white, border `#e6dfc9`, radius 8px, padding 28px 40px (18px mobile), 4 stat columns (desktop) / 3 (mobile): Pickup Time, Location (desktop only), Total, Rewards (gold value `#c9a24b`). Label 12px `#9a9182`, value DM Serif Display 19px (15px mobile) `#2b2b26`.
- **Actions (desktop)**: two buttons side by side — "View Order History" (outline `#2f4d3a`) and "Back to Menu" (filled `#2f4d3a`/`#faf7f0`). **Actions (mobile)**: single full-width "Back to Menu" button.

## Interactions & Behavior
- Menu → tapping a category tab filters the grid to that category (no transition specified; instant swap is fine).
- "Add" on a menu item adds to cart and increments the header cart-pill count.
- Cart quantity stepper: "–"/"+" adjust line-item quantity; removing to 0 removes the line item. Empty-cart state is not yet designed — flag if needed.
- Promo "Apply" validates a code and updates the summary total (validation/error states not yet designed).
- Cart "Go to Checkout" → navigates to Checkout screen.
- Checkout pickup-time toggle: "ASAP" vs "Schedule for later" — selecting "Schedule" should reveal a time picker (not designed in this mock; flag as a follow-up).
- Checkout "Place Order" → submits order, navigates to Confirmation screen with order number, ETA, and total populated from the actual order.
- Confirmation "Back to Menu" returns to Menu screen; "View Order History" (desktop) navigates to an order-history view (not designed in Phase 0).
- Responsive: mobile breakpoint mock shown at 375px reference width; desktop at 1280px reference width. Actual breakpoint (e.g. `<768px`) should follow the codebase's existing responsive conventions.

## State Management
- Cart: list of `{ itemId, name, modifiers, quantity, unitPrice }`, derived subtotal/tax/total, applied promo code.
- Checkout: contact `{ name, phone }`, pickup `{ mode: 'asap'|'scheduled', time }`, selected payment method.
- Order (post-submit): `{ orderNumber, pickupEta, total, rewardsPointsEarned, locationName }`.
- Menu: active category filter, per-item quantity-in-cart (for header count).

## Design Tokens

**Colors**
- Deep green (primary/header/CTA): `#2f4d3a`
- Cream (page background): `#faf7f0`
- Gold (accent/rewards/success): `#c9a24b`
- Gold text-on-dark: `#2f2410`
- Ink (headings/body text): `#2b2b26`
- Muted body text: `#7a7362` / `#5c5646`
- Placeholder/disabled text: `#9a9182`
- Border/hairline: `#e6dfc9`
- Header text on green: `#faf7f0` / muted `#e4e0d2`

**Typography**
- Display/headings: `DM Serif Display`, serif — sizes 32/30/26/20/19/18/17 (desktop) scaling down ~15–20% on mobile
- Body/UI: `Work Sans`, sans-serif — sizes 15/14/13/12/11, weights 400/500/600/700

**Radius**: 3px (small buttons/pills), 4px (buttons/inputs), 6–8px (cards), 20px+ (pills), 28px (mobile frame corner — mock-only, not a real device)

**Spacing**: Desktop outer padding 44–64px horizontal/vertical on screen containers; card internal padding 28px; grid gaps 24–48px. Mobile outer padding 16–24px; grid/list gaps 16–20px.

**Shadows**: cards use a subtle `0 1px 3px rgba(0,0,0,.08)` (see `.dv-card` — this class itself is presentation scaffolding for this doc, not part of the product UI).

## Assets
No real photography included — all "menu item photo" / "hero food photo" areas are hatched placeholder rectangles. Source real menu photography before build. No icon set used beyond one inline checkmark SVG (confirmation screen).

## Files
- `Grove - Phase 0 Visuals.dc.html` — contains all explored options. Build only the screens under option ids **2a** (desktop) and **2b** (mobile); ids 1a/1b/1c are earlier rejected directions kept for reference only.

## Implementation Notes / Scope Decisions (resolved 2026-07-17)

The mock includes some elements and gaps that cut across phase boundaries per `product-roadmap.md`. Resolved as follows for Phase 0 tickets:

- **Rewards points line (Cart/Confirmation) & promo code field (Cart):** these are Phase 1 (Loyalty & Rewards) features. Build the visual layout as designed so it matches the mock, but the rewards value is a static placeholder and the promo field is non-functional (visible, not wired to real logic) until Phase 1 tickets implement the underlying logic.
- **Empty-cart state (not designed in mock):** ship a simple, undesigned default — centered message + "Back to Menu" link, styled with the existing design tokens. No separate design pass needed.
- **"Schedule for later" time picker (not designed in mock):** ship a simple, undesigned default — a basic time input or dropdown of time slots, styled with the existing design tokens. No separate design pass needed.
- **"View Order History" button (Confirmation, desktop):** removed from Phase 0 build. Order history is a later, undesigned feature — add the button back when that view exists.
- **Checkout "Payment" section (masked card + "Change" link):** the mock depicts a saved-card UI, but Phase 0 has no accounts or saved-payment-method persistence — there's nothing to display as "saved." Built instead as a real Stripe Elements card input (number/expiry/CVC), styled with the same bordered/rounded chrome as the mock. Revisit the masked/"Change" treatment if saved cards are ever added post-Phase-0.
