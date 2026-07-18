<script setup lang="ts">
import type { MenuItemDTO } from "@grove/shared";

defineProps<{ item: MenuItemDTO }>();
const emit = defineEmits<{ add: [item: MenuItemDTO] }>();

function formatPrice(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
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
        @click="emit('add', item)"
      >
        Add
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
