# 002-002 — Admin Login & Session

**Status:** Done

## Description

As an operator, I can sign in with a shared password to access the admin panel, stay signed in until I explicitly sign out, and get bounced back to login if I try to reach an admin screen without a session. This is the auth foundation the Dashboard/Customers/Orders screens all sit behind.

## Acceptance Criteria

```gherkin
Feature: Admin authentication

  Scenario: Signing in with the correct password
    Given an operator is on /admin/login
    When they submit the correct shared admin password
    Then a signed session cookie is set
    And they are redirected to the Dashboard

  Scenario: Signing in with the wrong password
    Given an operator is on /admin/login
    When they submit an incorrect password
    Then an inline error is shown
    And no session cookie is set

  Scenario: Accessing an admin route without a session
    Given no valid session cookie is present
    When a request is made to any /admin/* page or /api/admin/* endpoint
    Then the page redirects to /admin/login (or the API returns 401)

  Scenario: Session persists across page loads
    Given an operator has a valid session cookie
    When they reload or navigate directly to an admin URL
    Then they remain signed in, no re-login required

  Scenario: Signing out
    Given an operator is signed in
    When they click "Sign out"
    Then the session cookie is cleared
    And they are returned to /admin/login
```

## Technical Notes

- Shared password read from `GROVE_ADMIN_PASSWORD` env var (add to `apps/api/.env.example`), never hardcoded.
- Session cookie: signed (e.g. `cookie-signature`/Express's built-in signed-cookie support with a `GROVE_SESSION_SECRET` env var), httpOnly, no expiry — cleared only on explicit sign-out. No roles/permissions per `design.md` §3, matching the single-operator scope.
- New route: `POST /api/admin/login` (verifies password, sets cookie), `POST /api/admin/logout` (clears cookie).
- Express middleware guarding `/api/admin/*` routes (used by Dashboard/Customers/Orders API endpoints built in later tickets), returning `401` when the session cookie is missing/invalid.
- Vue router navigation guard on `/admin*` routes (except `/admin/login`) redirecting to login when unauthenticated — checked via a lightweight session-check call or a client-visible (non-httpOnly-dependent) auth state set after login.
- Login screen per design handoff: centered card, single password field, "Sign In" button, inline error on wrong password (not in the original mock — this ticket defines it as a simple text line below the field, reusing the existing form-error style from Checkout).

## Test Plan

**Automated:**
- API integration tests: correct password sets a valid signed cookie; incorrect password returns an error and sets no cookie; a request to a guarded route without a cookie is rejected; a request with a valid cookie passes through; logout clears the cookie.
- Component test: Login form submits password, shows inline error on failure, redirects on success.
- Playwright E2E: `apps/web/e2e/adminLogin.spec.ts` — full login → Dashboard flow against the real API (pulled forward from Phase 3's roadmap scope since this ticket and 002-003 together produce a real Dashboard to assert against; sequenced to land as part of 002-003 once the Dashboard screen exists, not this ticket).

**Manual:** Sign in with correct/incorrect password, reload while signed in, sign out — steps recorded in this ticket file once implemented.

## Story Points

5

## Suggested Implementation Model

**Sonnet** — auth middleware/session wiring is a well-trodden pattern, but touches both API and frontend routing with real security surface (password/cookie handling), warranting more than a mechanical pass.

## Manual Test Record (2026-07-20)

Ran both dev servers (`npm run dev` in `apps/api` and `apps/web`) and exercised the real endpoints with `curl` against the running API:

1. `POST /api/admin/login` with the wrong password → `401`, no `Set-Cookie` header.
2. `POST /api/admin/login` with the correct password (`GROVE_ADMIN_PASSWORD`) → `200`, signed httpOnly `grove_admin_session` cookie set with a ~10-year `Max-Age` (no forced expiry, per the ticket's "stay signed in until explicit sign-out" requirement).
3. `GET /api/admin/session` with the session cookie → `200 { authenticated: true }`.
4. `GET /api/admin/session` with no cookie → `401`.
5. `POST /api/admin/logout` → `200`, cookie cleared (`Expires` set to epoch).
6. `GET /api/admin/session` after logout → `401` again, confirming the session was actually cleared, not just client-side state.
7. Confirmed `Access-Control-Allow-Credentials: true` and an echoed `Access-Control-Allow-Origin` (not `*`) on responses, which is required for the browser to accept/send the cookie across the web (`:5173`) → API (`:3001`) origin split in dev.

Frontend login form (`/admin/login`) → dashboard redirect and inline-error paths are covered by the automated component tests (`AdminLoginView.test.ts`); a full browser click-through and the `/admin` route-guard redirect are deferred to 002-003 per the ticket's Playwright note, once a real Dashboard exists to land on/assert against.

## Verification record (2026-07-20)

- All new tests written test-first (RED confirmed before each implementation): admin login/logout/session API routes and the `requireAdminSession` middleware (`apps/api/src/routes/adminAuth.test.ts`), CORS credentials wiring so the browser will actually store/send the cookie cross-origin, the `adminAuth` Pinia store (`apps/web/src/stores/adminAuth.test.ts`), the `requiresAdminAuth` route-guard predicate (`apps/web/src/router/adminGuard.test.ts`), the `admin` API client (`apps/web/src/api/admin.test.ts`), and `AdminLoginView` (wrong-password inline error, correct-password redirect).
- Full workspace `build`/`lint`/`test` pass: `apps/api` 66 tests (up from 60), `apps/web` 96 tests (up from 80), `packages/shared` unaffected. Lint clean (one auto-fixable Vue formatting warning resolved via `eslint --fix`).
- Added a minimal `AdminDashboardView` placeholder (`apps/web/src/views/admin/AdminDashboardView.vue`) so the login redirect and route guard have a concrete `/admin` destination to test against; 002-003 replaces its content with the real Dashboard.
- Manual end-to-end verification against the real running dev servers — see Manual Test Record above.
