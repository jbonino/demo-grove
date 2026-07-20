<script setup lang="ts">
import AppHeader from "../components/AppHeader.vue";
</script>

<template>
  <div class="readme-view">
    <AppHeader step="README" />

    <div class="content">
      <h1>Grove</h1>
      <p class="subtext">
        A restaurant ordering + loyalty rewards demo, built as a demo for interviews.
        Built in a single work day, agentically — see
        <a href="#build-process">Build process</a> below.
      </p>

      <section>
        <h2>Concept</h2>
        <p>
          Browse a menu &rarr; add to cart &rarr; check out with a phone number and Stripe
          payment &rarr; earn loyalty points automatically &rarr; look up balance and progress
          toward a reward by phone number &rarr; redeem at a later checkout. An admin panel
          shows recent orders, customers, and loyalty stats.
        </p>
      </section>

      <section>
        <h2>Stack &amp; architecture</h2>
        <ul>
          <li><strong>Frontend:</strong> Vue 3 + TypeScript, Vite</li>
          <li><strong>Backend:</strong> Express + TypeScript</li>
          <li><strong>Database:</strong> MongoDB (Atlas)</li>
          <li><strong>Payments:</strong> Stripe (test mode)</li>
          <li>
            Monorepo (npm workspaces): <code>apps/api</code>, <code>apps/web</code>,
            <code>packages/shared</code> for shared types/DTOs.
          </li>
          <li>
            Single Fly.io app serves both the built frontend and the API from one Express
            process (same origin, no CORS).
          </li>
        </ul>
      </section>

      <section>
        <h2>Demo walkthrough — customer path</h2>
        <ol>
          <li>
            Browse the menu at <RouterLink
              to="/"
              class="path-link"
            >
              /
            </RouterLink> and add a couple of items to the cart.
          </li>
          <li>
            Open the cart and continue to <RouterLink
              to="/checkout"
              class="path-link"
            >
              /checkout
            </RouterLink>.
          </li>
          <li>Enter a phone number, e.g. <code>(555) 123-4567</code>.</li>
          <li>
            Pay with the Stripe test card <code>4242 4242 4242 4242</code>, any future
            expiry date, any 3-digit CVC, and any ZIP.
          </li>
          <li>
            Reach the confirmation screen — it shows the points earned and the new balance
            for that phone number.
          </li>
          <li>
            Visit <RouterLink
              to="/loyalty"
              class="path-link"
            >
              /loyalty
            </RouterLink> and look up the same phone number to see the balance,
            available rewards, and recent activity.
          </li>
        </ol>
      </section>

      <section>
        <h2>Demo walkthrough — admin path</h2>
        <ol>
          <li>
            Visit <RouterLink
              to="/admin"
              class="path-link"
            >
              /admin
            </RouterLink> and log in with the admin password (shared separately,
            not published on this page).
          </li>
          <li>View the dashboard: recent orders and loyalty stats at a glance.</li>
          <li>
            Open <RouterLink
              to="/admin/customers"
              class="path-link"
            >
              /admin/customers
            </RouterLink> to see the customer list with balances.
          </li>
          <li>
            Open <RouterLink
              to="/admin/orders"
              class="path-link"
            >
              /admin/orders
            </RouterLink> to see the full orders list.
          </li>
        </ol>
      </section>

      <section id="build-process">
        <h2>Build process</h2>
        <p>
          Grove was built agentically in a single work day, end to end: schema and API
          design, the ordering and loyalty flows, the admin panel, Stripe integration,
          tests, and deployment. Implementation was split by ticket complexity between
          Claude Haiku (small/mechanical tickets — data and config changes) and Claude
          Sonnet (typical feature work), keeping the whole build on low usage rather than
          defaulting every ticket to the largest model.
        </p>
        <p>
          The <code>docs/</code> folder is the project's source of truth and working
          memory, not an afterthought:
        </p>
        <ul>
          <li><code>docs/design.md</code> — product decisions (referenced by section, e.g. &sect;6), the source other docs and tickets point back to.</li>
          <li><code>docs/product-roadmap.md</code> — phase sequencing and what's in/out of scope per phase.</li>
          <li><code>docs/architecture.md</code> — concrete technical details: schemas, stack wiring, how the pieces fit together.</li>
          <li><code>docs/backlog/</code> — one file per not-yet-built ticket, each with Gherkin acceptance criteria, technical notes, a test plan, a story-point estimate, and a suggested implementation model.</li>
          <li><code>docs/done/</code> — the same tickets, moved here on completion with a record of what was actually tested.</li>
          <li><code>docs/design/</code> — high-fidelity UI mockups/handoffs, produced with claude.ai/design before implementing UI-heavy tickets.</li>
          <li><code>docs/retros/</code> — a short retro written at the close of each phase.</li>
        </ul>
        <p>
          This structure and the phase/ticket workflow that drives it are a
          project-specific, modified version of the
          <a
            href="https://github.com/obra/superpowers"
            target="_blank"
            rel="noopener"
          >Superpowers</a> Claude Code plugin — its skills for brainstorming, TDD,
          systematic debugging, and structured code review, adapted with a
          ticket/backlog/phase workflow layered on top (see <code>CLAUDE.md</code> in the
          repo root).
        </p>
      </section>

      <section>
        <h2>Test coverage</h2>
        <ul>
          <li>
            <strong>113</strong> Vitest + Supertest tests in <code>apps/api</code> —
            loyalty math, order/payment flow, and API routes.
          </li>
          <li>
            <strong>140</strong> Vitest + Vue Test Utils component tests in
            <code>apps/web</code>.
          </li>
          <li>
            Playwright E2E (<code>apps/web/e2e</code>) driving the real Stripe Elements
            card iframe against a live webhook-driven backend: the critical customer
            path (browse &rarr; checkout &rarr; confirmation, including a
            reward-redemption case) and admin login &rarr; dashboard.
          </li>
        </ul>
        <p>
          Everything was TDD'd — tests written before the implementation they cover.
        </p>
      </section>

      <section>
        <h2>Contact</h2>
        <p>
          <a href="mailto:jbonino@protonmail.com">jbonino@protonmail.com</a>
        </p>
      </section>
    </div>
  </div>
</template>

<style scoped>
.content {
  max-width: 720px;
  margin: 0 auto;
  padding: 56px 48px;
}

h1 {
  font-family: var(--font-display);
  font-size: 32px;
  color: var(--color-ink);
  margin: 0 0 8px;
}

.subtext {
  font-size: 15px;
  color: var(--color-muted);
  margin: 0 0 32px;
}

section {
  margin-bottom: 32px;
}

h2 {
  font-family: var(--font-display);
  font-size: 22px;
  color: var(--color-ink);
  margin: 0 0 12px;
}

p,
li {
  font-size: 15px;
  line-height: 1.6;
  color: var(--color-ink);
}

ul,
ol {
  padding-left: 20px;
  margin: 0;
}

li + li {
  margin-top: 6px;
}

code {
  background: var(--color-border);
  border-radius: 3px;
  padding: 2px 5px;
  font-size: 14px;
}

.path-link {
  background: var(--color-border);
  border-radius: 3px;
  padding: 2px 5px;
  font-size: 14px;
  font-family: monospace;
  color: var(--color-deep-green);
  text-decoration: none;
}

.path-link:hover {
  text-decoration: underline;
}

a {
  color: var(--color-deep-green);
}

@media (max-width: 768px) {
  .content {
    padding: 32px 20px;
  }

  h1 {
    font-size: 24px;
  }
}
</style>
