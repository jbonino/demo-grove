<script setup lang="ts">
import type { LoyaltyActivityEntry } from "../api/loyalty";

defineProps<{
  activity: LoyaltyActivityEntry[];
}>();

function formatDate(date: string): string {
  return new Date(date).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}

function formatDelta(pointsDelta: number): string {
  return pointsDelta > 0 ? `+${pointsDelta}` : `${pointsDelta}`;
}
</script>

<template>
  <ul class="activity-list">
    <li
      v-for="entry in activity"
      :key="`${entry.orderId ?? 'adjustment'}-${entry.date}`"
      class="activity-row"
    >
      <div class="details">
        <span class="order">
          <template v-if="entry.orderId">Order #{{ entry.orderId }}</template>
          <template v-else>Balance adjustment</template>
          · {{ formatDate(entry.date) }}
        </span>
        <span
          v-if="entry.note"
          class="note"
        >{{ entry.note }}</span>
      </div>
      <span class="delta">{{ formatDelta(entry.pointsDelta) }} pts</span>
    </li>
  </ul>
</template>

<style scoped>
.activity-list {
  list-style: none;
  margin: 0;
  padding: 0;
}

.activity-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 14px 0;
  border-bottom: 1px solid var(--color-border);
}

.activity-row:last-child {
  border-bottom: none;
}

.details {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.order {
  font-size: 14px;
  color: var(--color-ink);
}

.note {
  font-size: 12px;
  color: var(--color-muted-2);
}

.delta {
  font-weight: 700;
  color: var(--color-gold);
  flex-shrink: 0;
}
</style>
