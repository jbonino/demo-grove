
# Handoff: Grove Phase 2 — Admin Panel

## Overview
Operator-facing admin panel: login, dashboard (order/revenue/loyalty stats at a glance), customers list, orders list + detail view. Same "1a rustic farmhouse" visual direction as Phases 0-1 (deep green / cream / gold).

## About the Design Files
The bundled file (`Grove - Phase 2 Visuals.dc.html`) is a **design reference built in HTML** — a prototype of look, layout, and copy, not production code. Target stack is **Vue.js**, same conventions as Phases 0-1. Recreate as Vue components/routes with the app's existing auth/session handling; don't port the raw HTML/inline styles.

Contains one turn, ids 1a (desktop) and 1b (mobile). Both in scope.

## Fidelity
**High-fidelity.** Colors, typography, spacing given are final. All customer names, order numbers, and stat values are placeholder — wire to real `Orders`/`LoyaltyEvents`/customer data.

## Screens / Views

### 1. Login (`/admin/login`)
- Centered card (380px desktop, full-width mobile) on cream background, no sidebar/nav.
- "Grove Admin" wordmark (DM Serif Display 26px/22px mobile) + "Operator sign-in" subtext.
- Single password field (shared password per roadmap — no username), "Sign In" button (green fill, full-width of card).
- Auth is a shared password + signed cookie session per `product-roadmap.md` Phase 2 — no user accounts/roles.

### 2. Dashboard (`/admin`)
- **Layout (desktop)**: fixed left sidebar (220px, green `#2f4d3a` bg) with "Grove Admin" wordmark, nav items (Dashboard/Customers/Orders — active item gets `rgba(255,255,255,.12)` pill), "Sign out" pushed to bottom. Main content padding 36px 40px.
- **Layout (mobile)**: no sidebar; green header bar with page title; bottom tab bar (Dashboard/Customers/Orders, active item green+bold) fixed under content.
- **Stat cards**: 4-col grid desktop (2-col mobile), white bg, border `#e6dfc9`, radius 8px, padding 20px (14px mobile). Label 12px/10px `#9a9182`, value DM Serif Display 28px/20px `#2b2b26` (Points Issued value in gold `#c9a24b`), small delta/context line below.
  - Cards: Orders Today (+delta vs yesterday), Revenue Today (+delta), Points Issued 7d (+redeemed count), New Loyalty Signups 7d (+of N orders).
- **Recent Orders table** below stats: header row (Order/Customer/Time/Total/Status, uppercase 11px `#9a9182`), rows 13px `#2b2b26`, hairline dividers `#e6dfc9`. Status pill: Preparing = green tint (`#eaf2ea` bg/`#3d6b4a` text), Ready = gold tint (`#f2ede2`/`#8a7a3d`), Completed = neutral (`#eee`/`#7a7362`). Mobile: same rows as stacked cards instead of a table.

### 3. Customers (`/admin/customers`)
- **Layout**: sidebar/tab-bar per above (Customers active). Desktop: page header + right-aligned search input ("Search by phone or name", pill 20px radius). Table columns: Name, Phone, Points Balance (gold, bold), Lifetime Orders, Last Order.
- **Mobile**: search bar full-width above list; each customer is a card (name+phone+order count left, points balance bold gold right).
- No pagination/sort designed yet — flag as follow-up if the customer list is large.

### 4. Orders (`/admin/orders`)
- **Layout (desktop)**: two-column — order table (1.3fr) + detail panel (1fr, sticky) for the selected order. Table row for the currently-open order gets subtle highlight bg `#f7f4ec`.
- **Detail panel**: order number + status pill header, customer/phone/time subline, itemized lines, tax, total (DM Serif Display 18px), and points-issued note in gold.
- **Layout (mobile)**: no side-by-side detail; the "selected"/expanded order card inlines its itemization directly (see mock) — tapping a row expands it in place. Other rows stay collapsed (name/time/total/status only).
- Status pill colors match Dashboard's Recent Orders (Preparing/Ready/Completed).

## Interactions & Behavior
- Login: submitting the correct shared password sets a signed session cookie and redirects to Dashboard; wrong password shows an inline error (not designed in mock — flag as follow-up).
- Sidebar/tab nav switches between Dashboard/Customers/Orders without reloading (client-side routing).
- Dashboard stat cards and Recent Orders are read-only (no drill-in actions designed beyond linking to Orders for "view all", which isn't in the mock — consider adding a "View all orders" link).
- Customers search: filters the table/list live as the operator types (by name or phone substring match).
- Orders list: clicking a row opens/updates the detail panel (desktop) or expands the row (mobile) — does not navigate away from the list.
- Sign out clears the session and returns to Login.
- No admin-editable data anywhere in Phase 2 (menu/rewards editing is explicitly out of scope per roadmap) — this is a read-only visibility layer.

## State Management
- Auth: `{ isAuthenticated, sessionExpiresAt }` — simple boolean gate, no roles/permissions.
- Dashboard: `{ ordersToday, ordersTodayDelta, revenueToday, revenueTodayDelta, pointsIssued7d, pointsRedeemed7d, signups7d, ordersOutOf7d, recentOrders: [...] }`.
- Customers: list of `{ name, phone, pointsBalance, lifetimeOrders, lastOrderAt }`, plus a `searchQuery` filter.
- Orders: list of `{ orderNumber, customerName, time, total, status }`, plus `selectedOrderId` and its full detail `{ items: [{name, qty, price}], tax, total, pointsIssued, customerPhone }`.

## Design Tokens
Reuses Phase 0/1 tokens — deep green `#2f4d3a`, cream `#faf7f0`, gold `#c9a24b`, ink `#2b2b26`, muted `#7a7362`/`#5c5646`, placeholder `#9a9182`, border `#e6dfc9`, DM Serif Display headings / Work Sans body, radius 4px (buttons/inputs) / 8px (cards) / 12px (status pills).

New for Phase 2:
- Sidebar active-item highlight: `rgba(255,255,255,.12)` over the green sidebar bg.
- Status pill tints: Preparing `#eaf2ea`/`#3d6b4a`, Ready `#f2ede2`/`#8a7a3d`, Completed `#eee`/`#7a7362`.
- Selected-row table highlight: `#f7f4ec`.

## Assets
No real photography needed for this phase (no menu imagery in admin views). No icon set used.

## Files
- `Grove - Phase 2 Visuals.dc.html` — ids **1a** (desktop) and **1b** (mobile), both in scope.
