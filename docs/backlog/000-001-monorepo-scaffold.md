# 000-001 — Monorepo Scaffold

**Status:** Backlog

## Description

Foundational project setup: an npm-workspaces monorepo with an Express API, a Vue storefront, and a shared TypeScript types package, all wired to build, lint, and test. No product behavior yet — this ticket makes every later ticket possible to build and run.

## Acceptance Criteria

```gherkin
Feature: Monorepo scaffold

  Scenario: Installing and building the workspace
    Given a clean checkout of the repo
    When a developer runs the install and build commands
    Then apps/api, apps/web, and packages/shared all build without errors

  Scenario: Running the dev servers
    Given the workspace is installed
    When a developer starts the api and web dev servers
    Then the API responds on its configured port
    And the web app serves a blank placeholder page on its configured port

  Scenario: Lint and typecheck pass
    Given the workspace is installed
    When a developer runs lint and typecheck across all workspaces
    Then both complete with zero errors on the initial scaffold
```

## Technical Notes

- npm workspaces: `apps/api` (Express + TypeScript), `apps/web` (Vue 3 + TypeScript + Vite), `packages/shared` (shared types/DTOs, consumed by both apps via workspace reference)
- Shared TS config (base `tsconfig.json` extended by each workspace)
- ESLint + Prettier shared config at the root
- Vitest configured in both `apps/api` and `apps/web`
- `apps/web` gets a placeholder root route only — no real screens yet (those come in later tickets)

## Test Plan

**Automated:** CI-style script running `install`, `build`, `lint`, `typecheck`, `test` across all workspaces (test suites are empty/trivial at this stage but the runner must be wired).

**Manual:** None — no user-facing surface yet.

## Story Points

2

## Suggested Implementation Model

**Haiku** — pure scaffolding/config, no algorithms, low ambiguity.
