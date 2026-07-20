# 002-002 — Admin Login & Session

**Status:** Active

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
