<script setup lang="ts">
import type { RewardOptionDTO } from "@grove/shared";

const props = defineProps<{
  rewards: RewardOptionDTO[];
  selectedId: string | null;
}>();

const emit = defineEmits<{ select: [rewardId: string] }>();

function formatPrice(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}

function onRowClick(reward: RewardOptionDTO) {
  if (reward.unlocked) {
    emit("select", reward.id);
  }
}
</script>

<template>
  <ul class="reward-list">
    <li
      v-for="reward in props.rewards"
      :key="reward.id"
      class="reward-row"
      :class="{ locked: !reward.unlocked, selected: reward.id === props.selectedId }"
      @click="onRowClick(reward)"
    >
      <span
        class="radio"
        aria-hidden="true"
      />
      <div class="details">
        <span class="name">{{ reward.name }}</span>
        <span class="points">
          {{ reward.pointsCost }} pts
          <template v-if="!reward.unlocked">· need {{ reward.pointsNeeded }} more</template>
        </span>
      </div>
      <span
        v-if="reward.unlocked"
        class="discount"
      >-{{ formatPrice(reward.discountAmountCents) }}</span>
      <span
        v-else
        class="locked-label"
      >Locked</span>
    </li>
  </ul>
</template>

<style scoped>
.reward-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.reward-row {
  display: flex;
  align-items: center;
  gap: 12px;
  border: 1px solid var(--color-deep-green);
  border-radius: 6px;
  padding: 12px 16px;
  cursor: pointer;
}

.reward-row.locked {
  opacity: 0.55;
  cursor: default;
  border-color: var(--color-border);
}

.radio {
  width: 16px;
  height: 16px;
  border-radius: 50%;
  border: 2px solid var(--color-deep-green);
  flex-shrink: 0;
}

.reward-row.locked .radio {
  border-color: var(--color-muted-2);
}

.reward-row.selected .radio {
  background: var(--color-deep-green);
}

.details {
  display: flex;
  flex-direction: column;
  flex: 1;
  gap: 2px;
}

.name {
  font-size: 14px;
  font-weight: 600;
  color: var(--color-ink);
}

.points {
  font-size: 12px;
  color: var(--color-muted-2);
}

.discount {
  font-weight: 700;
  color: var(--color-deep-green);
}

.locked-label {
  font-size: 12px;
  color: #9a9182;
}
</style>
