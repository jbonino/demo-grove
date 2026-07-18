<script setup lang="ts">
defineProps<{
  pointsBalance: number;
  lifetimeOrders: number;
}>();
</script>

<template>
  <div class="stat-cards">
    <div class="stat-card points-balance">
      <span class="label">Points Balance</span>
      <span class="value">{{ pointsBalance }}</span>
    </div>
    <div class="stat-card lifetime-orders">
      <span class="label">Lifetime Orders</span>
      <span class="value">{{ lifetimeOrders }}</span>
    </div>
  </div>
</template>

<style scoped>
.stat-cards {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
  margin: 0 0 32px;
}

.stat-card {
  display: flex;
  flex-direction: column;
  gap: 8px;
  border-radius: 8px;
  padding: 24px;
}

.points-balance {
  background: var(--color-deep-green);
}

.points-balance .label {
  color: var(--color-gold);
}

.points-balance .value {
  color: var(--color-cream);
}

.lifetime-orders {
  background: white;
  border: 1px solid var(--color-border);
}

.lifetime-orders .label {
  color: var(--color-placeholder);
}

.lifetime-orders .value {
  color: var(--color-ink);
}

.label {
  font-size: 12px;
  text-transform: uppercase;
  letter-spacing: 0.02em;
}

.value {
  font-family: var(--font-display);
  font-size: 40px;
}

@media (max-width: 768px) {
  .stat-cards {
    gap: 14px;
  }

  .value {
    font-size: 28px;
  }
}
</style>
