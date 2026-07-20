<script setup lang="ts">
import type { DashboardStatsDTO } from "../../api/admin";

const props = defineProps<{ stats: DashboardStatsDTO }>();

function formatDollars(cents: number): string {
  const sign = cents < 0 ? "-" : "";
  return `${sign}$${(Math.abs(cents) / 100).toFixed(2)}`;
}

function formatSignedDelta(value: number): string {
  return value >= 0 ? `+${value}` : `${value}`;
}

function formatSignedDollarDelta(cents: number): string {
  return cents >= 0 ? `+${formatDollars(cents)}` : formatDollars(cents);
}
</script>

<template>
  <div class="stat-cards">
    <div class="stat-card">
      <span class="label">Orders Today</span>
      <span class="value">{{ props.stats.ordersToday }}</span>
      <span class="context">{{ formatSignedDelta(props.stats.ordersTodayDelta) }} vs. yesterday</span>
    </div>
    <div class="stat-card">
      <span class="label">Revenue Today</span>
      <span class="value">{{ formatDollars(props.stats.revenueTodayCents) }}</span>
      <span class="context">{{ formatSignedDollarDelta(props.stats.revenueTodayDeltaCents) }} vs. yesterday</span>
    </div>
    <div class="stat-card">
      <span class="label">Points Issued (7d)</span>
      <span class="value gold">{{ props.stats.pointsIssued7d }}</span>
      <span class="context">{{ props.stats.pointsRedeemed7d }} redeemed</span>
    </div>
    <div class="stat-card">
      <span class="label">New Loyalty Signups (7d)</span>
      <span class="value">{{ props.stats.signups7d }}</span>
      <span class="context">of {{ props.stats.ordersOutOf7d }} orders</span>
    </div>
  </div>
</template>

<style scoped>
.stat-cards {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
  margin-bottom: 32px;
}

.stat-card {
  display: flex;
  flex-direction: column;
  gap: 4px;
  background: white;
  border: 1px solid var(--color-border);
  border-radius: 8px;
  padding: 20px;
}

.label {
  font-size: 12px;
  text-transform: uppercase;
  color: var(--color-placeholder);
}

.value {
  font-family: var(--font-display);
  font-size: 28px;
  color: var(--color-ink);
}

.value.gold {
  color: var(--color-gold);
}

.context {
  font-size: 12px;
  color: var(--color-muted);
}

@media (max-width: 768px) {
  .stat-cards {
    grid-template-columns: 1fr 1fr;
    gap: 14px;
  }

  .stat-card {
    padding: 14px;
  }

  .value {
    font-size: 20px;
  }
}
</style>
