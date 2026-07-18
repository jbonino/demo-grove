<script setup lang="ts">
import { onMounted, ref } from "vue";
import { useRoute } from "vue-router";
import { fetchOrderByPaymentIntent, type OrderDTO } from "../api/orders";
import AppHeader from "../components/AppHeader.vue";
import PointsEarnedPill from "../components/PointsEarnedPill.vue";

const route = useRoute();
const order = ref<OrderDTO | null>(null);
const loading = ref(true);

const customerName = typeof route.query.name === "string" ? route.query.name : "";

function formatPrice(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}

function orderNumber(id: string): string {
  return `#${id.slice(-6).toUpperCase()}`;
}

function pickupLabel(orderDto: OrderDTO): string {
  return orderDto.pickup.mode === "asap" ? "ASAP" : (orderDto.pickup.time ?? "");
}

function chargedTotalCents(orderDto: OrderDTO): number {
  return Math.max(orderDto.subtotalCents - (orderDto.rewardRedeemed?.discountAmountCents ?? 0), 0);
}

onMounted(async () => {
  const paymentIntentId = route.params.paymentIntentId as string;
  order.value = await fetchOrderByPaymentIntent(paymentIntentId);
  loading.value = false;
});
</script>

<template>
  <div class="confirmation-view">
    <AppHeader step="Order Confirmed" />

    <div class="content">
      <p v-if="loading">
        Loading your order…
      </p>
      <p v-else-if="!order">
        We couldn't find that order.
      </p>
      <template v-else>
        <div
          class="success-icon"
          aria-hidden="true"
        >
          <svg
            viewBox="0 0 24 24"
            width="28"
            height="28"
            fill="none"
            stroke="#2f4d3a"
            stroke-width="2.5"
          >
            <path
              d="M5 13l4 4L19 7"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
        </div>
        <h1>You're all set<span v-if="customerName">, {{ customerName }}</span></h1>
        <p class="subtext">
          Order {{ orderNumber(order.id) }} confirmed for {{ order.phone }}
        </p>

        <PointsEarnedPill
          :points-earned="order.pointsEarned"
          :balance="order.pointsBalanceAfter"
        />

        <div class="info-card">
          <div class="stat">
            <span class="label">Pickup Time</span>
            <span class="value">{{ pickupLabel(order) }}</span>
          </div>
          <div
            v-if="order.rewardRedeemed"
            class="stat desktop-only"
          >
            <span class="label">Reward Used</span>
            <span class="value">{{ order.rewardRedeemed.name }}</span>
          </div>
          <div
            v-else
            class="stat desktop-only"
          >
            <span class="label">Location</span>
            <span class="value">Grove</span>
          </div>
          <div class="stat">
            <span class="label">Total</span>
            <span class="value">{{ formatPrice(chargedTotalCents(order)) }}</span>
          </div>
          <div class="stat">
            <span class="label">Points Balance</span>
            <span class="value rewards">{{ order.pointsBalanceAfter }}</span>
          </div>
        </div>

        <RouterLink
          to="/"
          class="back-button"
        >
          Back to Menu
        </RouterLink>
        <RouterLink
          to="/loyalty"
          class="rewards-link"
        >
          Check My Rewards
        </RouterLink>
      </template>
    </div>
  </div>
</template>

<style scoped>
.content {
  max-width: 560px;
  margin: 0 auto;
  padding: 64px 48px;
  text-align: center;
}

.success-icon {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background: var(--color-gold);
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 24px;
}

h1 {
  font-family: var(--font-display);
  font-size: 32px;
  color: var(--color-ink);
  margin: 0 0 12px;
}

.subtext {
  font-size: 15px;
  color: var(--color-muted);
  margin: 0 0 32px;
}

.info-card {
  background: white;
  border: 1px solid var(--color-border);
  border-radius: 8px;
  padding: 28px 40px;
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  margin-bottom: 32px;
}

.stat {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.label {
  font-size: 12px;
  color: var(--color-placeholder);
  text-transform: uppercase;
  letter-spacing: 0.02em;
}

.value {
  font-family: var(--font-display);
  font-size: 19px;
  color: var(--color-ink);
}

.value.rewards {
  color: var(--color-gold);
}

.back-button {
  display: inline-block;
  background: var(--color-deep-green);
  color: var(--color-cream);
  border-radius: 4px;
  padding: 14px 32px;
  font-weight: 600;
  font-size: 15px;
  text-decoration: none;
}

.rewards-link {
  display: inline-block;
  margin-left: 16px;
  border: 1px solid var(--color-deep-green);
  color: var(--color-deep-green);
  border-radius: 4px;
  padding: 14px 32px;
  font-weight: 600;
  font-size: 15px;
  text-decoration: none;
}

@media (max-width: 768px) {
  .content {
    padding: 44px 24px;
  }

  .success-icon {
    width: 52px;
    height: 52px;
  }

  h1 {
    font-size: 22px;
  }

  .subtext {
    font-size: 13px;
  }

  .info-card {
    grid-template-columns: repeat(3, 1fr);
    padding: 18px;
  }

  .desktop-only {
    display: none;
  }

  .value {
    font-size: 15px;
  }

  .back-button {
    display: block;
  }
}
</style>
