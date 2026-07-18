# CLAUDE.md
Treat `design.md` as the source of truth for product decisions (referenced by section number, e.g. "§6"), `product-roadmap.md` as the source of truth for sequencing/scope-per-phase, and `architecture.md` as the source of truth for concrete technical details (schemas, stack wiring).

## Phase Workflow
Start phase and create tickets for whole phase.
For UI-heavy tickets (new or multi-section pages), do a mockup/design with claude/design. )
When closing out a phase, conduct a retro.

## Ticket Workflow

Backlog lives in `docs/backlog/`. One file per ticket.

**Filename:** `{phase}-{ticket#}-{feature-name}.md` (e.g. `001-014-feature.md`)
**Branch name:** `feature/{ticket#}-{feature-name}` (matches ticket filename)


### Ticket States
`Backlog` → `Active` → `In Review` → `Done`

### Creating a Ticket
Check `docs/product-roadmap.md` to confirm the feature belongs to the current phase before writing it — don't pull in work from a later phase without explicit instruction.
Use the Superpowers `/brainstorming` skill to develop it. Every ticket must include:
- **Title / feature name**
- **User-facing description** — scope is what the player experiences, not engine internals. Keep short and simple 1-4 sentences
- **Acceptance Criteria in Gherkin** (Given/When/Then)
- **Light technical notes** — enough to point implementation in the right direction; do not write a full spec or over-prescribe implementation
- **Test plan** — call out Automated tests (unit/integration together — don't force a boundary between them where none exists) and Manual steps (with steps) for anything gated on a live third-party service, real payment flow, or UI interaction that can't be driven headlessly. Only add a separate E2E line when there's an actual browser-automatable flow to script (e.g. Playwright) — don't list E2E as a category if it can't actually be automated in this environment, since that just produces a "planned but not run" gap every time.
- **Story point estimate** — Fibonacci (1, 2, 3, 5, 8, 13...)
- **Suggested implementation model** — Haiku for small/mechanical tickets (1-2 points, data/config changes, no new algorithms); Sonnet as the default for typical feature work; Opus for tickets involving a novel algorithm, cross-system architecture, or unusually high ambiguity. State the pick and a one-line reason.
- **Status field**

Before committing the ticket, check whether anything decided during brainstorming contradicts or extends `design.md`, `product-roadmap.md`, or `architecture.md` (e.g. a scoping call that changes a documented mechanic, or a new schema field). If so, update the relevant doc in the same commit — don't let them drift out of sync.

### Starting a Feature
1. Scan `docs/backlog/`, pick the **lowest-numbered** ticket (numeric priority order — do not pick out of order without explicit instruction)
2. Mark it `Active` in the ticket file, commit, push to `main`
3. Checkout `feature/{ticket#}-{feature-name}`
4. For UI-heavy tickets, check `docs/design/` for an existing handoff covering the screen before doing a new mockup/design pass — if a high-fidelity handoff already covers it, build against that instead of re-designing.
5. **Do not write specs or plans* (as /brainstorming trys do to) — the ticket's Gherkin AC *is* the plan.
   If the AC or technical notes leave the implementation approach genuinely unclear, run `/brainstorming` first to resolve that before coding.
   Ask questions if unclean and go straight into Superpowers TDD, using the ticket's Gherkin AC as the spec.

6. Implement, following the ticket's Unit/Integration/E2E test plan
7. If manual testing applies: Document the exact steps in the ticket file (kept as a record even after the PR is reviewed, in case it can be automated later)
8. Update ticket state to `Done` and move to `docs/done/` folder.
9. Push the feature branch, open a PR — include manual testing steps in the PR description for the reviewer
