<script setup lang="ts">
import AppHeader from "../components/AppHeader.vue";
</script>

<template>
  <div class="readme-view">
    <AppHeader step="README" />

    <div class="content">
      <h1>Grove</h1>
      <p class="subtext">
        A restaurant ordering + loyalty rewards demo, built as a portfolio piece for an
        Owner.com interview. The scope and stack mirror Owner.com's product surface
        (commission-free ordering, phone-based loyalty accrual).
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
          <li>Browse the menu at <code>/</code> and add a couple of items to the cart.</li>
          <li>Open the cart and continue to <code>/checkout</code>.</li>
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
            Visit <code>/loyalty</code> and look up the same phone number to see the
            balance, available rewards, and recent activity.
          </li>
        </ol>
      </section>

      <section>
        <h2>Demo walkthrough — admin path</h2>
        <ol>
          <li>
            Visit <code>/admin</code> and log in with the admin password (shared
            separately, not published on this page).
          </li>
          <li>View the dashboard: recent orders and loyalty stats at a glance.</li>
          <li>Open <code>/admin/customers</code> to see the customer list with balances.</li>
          <li>Open <code>/admin/orders</code> to see the full orders list.</li>
        </ol>
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

@media (max-width: 768px) {
  .content {
    padding: 32px 20px;
  }

  h1 {
    font-size: 24px;
  }
}
</style>
