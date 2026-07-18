<script setup lang="ts">
import { STATIC_REWARDS_POINTS } from "../constants";

const props = defineProps<{
  subtotalCents: number;
  ctaLabel: string;
  ctaDisabled?: boolean;
  showPromo?: boolean;
  itemized?: { name: string; quantity: number; unitPrice: number }[];
}>();

const emit = defineEmits<{ cta: [] }>();

function formatPrice(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}
</script>

<template>
  <div class="summary-card">
    <ul
      v-if="itemized"
      class="itemized"
    >
      <li
        v-for="line in itemized"
        :key="line.name"
      >
        <span>{{ line.quantity }}× {{ line.name }}</span>
        <span>{{ formatPrice(line.unitPrice * line.quantity) }}</span>
      </li>
    </ul>

    <div
      v-if="showPromo"
      class="promo"
    >
      <input
        type="text"
        placeholder="Promo code"
      >
      <button type="button">
        Apply
      </button>
    </div>

    <div class="row">
      <span>Subtotal</span>
      <span>{{ formatPrice(props.subtotalCents) }}</span>
    </div>
    <div class="row">
      <span>Tax</span>
      <span>{{ formatPrice(0) }}</span>
    </div>
    <div class="row rewards">
      <span>Rewards points</span>
      <span>+{{ STATIC_REWARDS_POINTS }}</span>
    </div>
    <div class="divider" />
    <div class="row total">
      <span>Total</span>
      <span>{{ formatPrice(props.subtotalCents) }}</span>
    </div>

    <button
      type="button"
      class="cta"
      :disabled="props.ctaDisabled"
      @click="emit('cta')"
    >
      {{ props.ctaLabel }}
    </button>
  </div>
</template>

<style scoped>
.summary-card {
  background: white;
  border: 1px solid var(--color-border);
  border-radius: 8px;
  padding: 28px;
}

.itemized {
  list-style: none;
  margin: 0 0 16px;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
  font-size: 14px;
}

.itemized li {
  display: flex;
  justify-content: space-between;
}

.promo {
  display: flex;
  gap: 8px;
  margin-bottom: 20px;
}

.promo input {
  flex: 1;
  border: 1px dashed var(--color-gold);
  border-radius: 4px;
  padding: 10px 12px;
}

.promo button {
  border: 1px solid var(--color-deep-green);
  color: var(--color-deep-green);
  background: none;
  border-radius: 4px;
  padding: 0 16px;
  cursor: pointer;
}

.row {
  display: flex;
  justify-content: space-between;
  font-size: 14px;
  color: var(--color-muted-2);
  padding: 6px 0;
}

.row.rewards {
  color: var(--color-gold);
}

.divider {
  border-top: 1px solid var(--color-border);
  margin: 12px 0;
}

.row.total {
  font-family: var(--font-display);
  font-size: 20px;
  color: var(--color-ink);
}

.cta {
  width: 100%;
  margin-top: 20px;
  background: var(--color-deep-green);
  color: var(--color-cream);
  border: none;
  border-radius: 4px;
  padding: 14px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
}

.cta:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

@media (max-width: 768px) {
  .summary-card {
    padding: 18px;
  }

  .promo {
    display: none;
  }

  .row.total {
    font-size: 17px;
  }
}
</style>
