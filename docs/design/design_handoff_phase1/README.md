
# Handoff: Grove Phase 1 — Loyalty & Rewards

## Overview
Layers the points economy onto the Phase 0 ordering flow: earn points on checkout, redeem a reward at checkout, and look up balance/history by phone number. Same "1a rustic farmhouse" visual direction as Phase 0 (deep green / cream / gold).

## About the Design Files
The bundled file (`Grove - Phase 1 Visuals.dc.html`) is a **design reference built in HTML** — a prototype of look, layout, and copy, not production code. Target stack is **Vue.js**, same conventions as Phase 0. Recreate as Vue components/routes; don't port the raw HTML/inline styles.

Contains one turn, ids 1a (desktop) and 1b (mobile). Both are in scope.

## Fidelity
**High-fidelity.** Colors, typography, spacing, and copy are final. Placeholder data (phone number, point totals, order numbers) should be replaced with real values from Phase 1's `LoyaltyEvents`/`Rewards` collections.

## Screens / Views

### 1. Checkout — with rewards (extends Phase 0 checkout)
- New elements inserted between Contact and Payment sections:
  - **Points banner**: light gold background `#fbf3de`, border `#e9d9a8`, radius 6px, padding 14px 18px. Star icon in gold circle `#c9a24b`. Copy: "**{points} points** on file for this number — enough for {n} reward(s) below".
  - **Redeem a Reward** section (DM Serif Display 26px / 18px mobile header). List of reward option rows, radio-style:
    - Available reward: border `#2f4d3a`, filled radio (green dot in green-ringed circle), title 14px/600 `#2b2b26`, points cost 12px `#7a7362`, discount amount right-aligned `#2f4d3a` bold.
    - Locked reward (not enough points): opacity `.55`, empty radio outline `#cbc3ae`, "need X more" appended to points line, right side reads "Locked" in `#9a9182`.
- **Payment section now offers two methods** stacked (12px/10px gap): Apple Pay row (black 38×26px / 34×22px chip, "Apple Pay" label, "Fastest checkout" hint desktop-only) above the Visa card row. Selected method gets `border:#2f4d3a`; unselected `border:#e6dfc9`.
- **Order Summary sidebar**: adds a reward line between itemization and tax (`Reward: {name}` in `#2f4d3a` bold, negative amount), and below Total a small "You'll earn +N pts" line in `#c9a24b`.

### 2. Confirmation — with points earned (extends Phase 0 confirmation)
- Subtext now mentions the reward applied, if any.
- New **points-earned pill**: gold-tinted background `#fbf3de`, border `#e9d9a8`, radius 24px/20px, star icon, copy "+{N} points earned · **{balance} points** balance now".
- Info-card stat row swaps one Phase-0 column: desktop shows Pickup Time / Reward Used / Total / Points Balance (gold value); mobile shows Pickup / Total / Points.
- Secondary action button changes from "View Order History" to **"Check My Rewards"** (links to the Loyalty screen), primary stays "Back to Menu".

### 3. Loyalty Lookup (`/loyalty`) — new screen
- **Purpose**: phone-number lookup of a customer's points balance, lifetime orders, available rewards, and recent point activity — no login required.
- **Header (desktop)**: standard Grove nav bar; "Rewards" nav item is the active tab (gold underline). Cart pill still shown (count 0 if empty).
- **Search**: centered heading "Look up your rewards" (DM Serif Display 32px/20px mobile) + subtext, then a phone-number input (340px desktop / full-width mobile) + "Look Up" button (green fill, same button style as elsewhere).
- **Stat cards** (2-col grid, gap 24px/14px): Points Balance (filled green card `#2f4d3a`, gold label, huge DM Serif Display number in cream) and Lifetime Orders (white card, border `#e6dfc9`, dark number).
- **Available Rewards list**: same reward-row pattern as checkout redemption, but all rows here show locked state (since redemption only happens at checkout) with "need X more" and a "Locked" tag — no radio selector needed on this read-only screen.
- **Recent Activity list**: rows of `Order #{id}` + date (+ optional note e.g. "Redeemed Free Flatbread") on the left, `+{N} pts` in gold on the right, hairline dividers `#e6dfc9` between rows.

## Interactions & Behavior
- Checkout: selecting a reward radio recalculates the order summary (discount line + new total + reduced points-earned estimate) live; locked rewards are not selectable/clickable.
- Checkout: Apple Pay vs card is a mutually-exclusive selection (radio-like row selection, not shown as explicit radio control in mock — treat as single-select).
- Points earned = floor(post-discount subtotal) per the seed "points-per-dollar" rule (see `product-roadmap.md` Phase 1) — issued only on successful payment.
- Confirmation: reward-used stat only shown if a reward was redeemed on that order.
- Loyalty lookup: "Look Up" submits the phone number and populates balance/orders/rewards/activity from the `LoyaltyEvents` ledger; handle "number not found" (no history) as a follow-up empty state — not designed in this mock, flag if needed.
- Reward unlock thresholds and copy ("need X more") should recompute from the live balance vs. each reward's point cost, not hardcoded per customer.

## State Management
- Loyalty: `{ phone, pointsBalance, lifetimeOrders, availableRewards: [{name, cost, discountAmount, unlocked}], activity: [{orderId, date, pointsDelta, note}] }`.
- Checkout: extends Phase 0 checkout state with `selectedRewardId | null`, `paymentMethod: 'apple_pay' | 'card'`, and derived `pointsToEarn`.
- Order (post-submit): extends Phase 0 with `rewardRedeemed: {name, discountAmount} | null`, `pointsEarned`, `pointsBalanceAfter`.

## Design Tokens
Reuses Phase 0 tokens (see Phase 0 handoff if available) — deep green `#2f4d3a`, cream `#faf7f0`, gold `#c9a24b`, ink `#2b2b26`, muted `#7a7362`/`#5c5646`, placeholder `#9a9182`, border `#e6dfc9`, DM Serif Display headings / Work Sans body.

New for Phase 1:
- Gold-tinted banner/pill background: `#fbf3de`, border `#e9d9a8` — used for points/reward callouts.
- Locked-state treatment: `opacity: .55` on the row, muted "Locked" label `#9a9182`.
- Apple Pay chip: solid black `#000` background, white mark, same 38×26px (18×22px mobile) sizing as the card-brand chip for visual parity.

## Assets
No real photography. Reward icon uses an emoji gift 🎁 as placeholder — swap for a proper icon in build. Apple Pay mark is a simplified inline approximation; use Apple's official Apple Pay mark/asset per their brand guidelines in production.

## Files
- `Grove - Phase 1 Visuals.dc.html` — ids **1a** (desktop) and **1b** (mobile), both in scope.
