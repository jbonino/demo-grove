<script setup lang="ts">
import { ref } from "vue";
import type { MenuItemDTO } from "@grove/shared";

defineProps<{ item: MenuItemDTO }>();
const emit = defineEmits<{ add: [item: MenuItemDTO] }>();

const ADDED_FEEDBACK_MS = 900;
const justAdded = ref(false);
let revertTimeout: ReturnType<typeof setTimeout> | undefined;

function formatPrice(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}

function handleAdd(item: MenuItemDTO) {
  emit("add", item);
  navigator.vibrate?.(20);
  justAdded.value = true;
  clearTimeout(revertTimeout);
  revertTimeout = setTimeout(() => {
    justAdded.value = false;
  }, ADDED_FEEDBACK_MS);
}
</script>

<template>
  <article class="item-card">
    <div
      class="photo"
      aria-hidden="true"
    />
    <div class="details">
      <div class="title-row">
        <h3 class="title">
          {{ item.name }}
        </h3>
        <span class="price">{{ formatPrice(item.priceCents) }}</span>
      </div>
      <p class="description">
        {{ item.description }}
      </p>
      <button
        type="button"
        class="add-button"
        :class="{ 'is-added': justAdded }"
        @click="handleAdd(item)"
      >
        {{ justAdded ? "Added ✓" : "Add" }}
      </button>
    </div>
  </article>
</template>

<style scoped>
.item-card {
  background: white;
  border: 1px solid var(--color-border);
  border-radius: 6px;
  overflow: hidden;
}

.photo {
  height: 150px;
  background: repeating-linear-gradient(
    45deg,
    var(--color-border),
    var(--color-border) 6px,
    transparent 6px,
    transparent 12px
  );
}

.details {
  padding: 16px;
}

.title-row {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  gap: 12px;
}

.title {
  font-family: var(--font-display);
  font-size: 18px;
  color: var(--color-ink);
  margin: 0;
}

.price {
  font-family: var(--font-body);
  font-size: 14px;
  font-weight: 600;
  color: var(--color-ink);
  white-space: nowrap;
}

.description {
  font-size: 13px;
  color: var(--color-muted);
  margin: 8px 0 12px;
}

.add-button {
  background: var(--color-deep-green);
  color: var(--color-cream);
  font-size: 13px;
  font-weight: 600;
  padding: 8px 16px;
  border: none;
  border-radius: 3px;
  cursor: pointer;
  transition: background-color 0.15s ease, transform 0.15s ease;
}

.add-button.is-added {
  background: var(--color-gold);
  color: var(--color-gold-on-dark);
  transform: scale(1.05);
}

@media (max-width: 768px) {
  .item-card {
    display: flex;
    border-radius: 8px;
  }

  .photo {
    width: 90px;
    height: 90px;
    flex-shrink: 0;
  }

  .title {
    font-size: 15px;
  }
}
</style>
