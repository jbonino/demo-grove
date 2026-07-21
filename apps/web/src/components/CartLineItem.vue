<script setup lang="ts">
import { ref } from "vue";
import type { CartLine } from "../stores/cart";

const props = defineProps<{ line: CartLine }>();
const emit = defineEmits<{ setQuantity: [itemId: string, quantity: number] }>();

const imageFailed = ref(false);

function formatPrice(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}
</script>

<template>
  <div class="line-item">
    <img
      v-if="line.imageUrl && !imageFailed"
      class="photo"
      :src="line.imageUrl"
      :alt="line.name"
      loading="lazy"
      @error="imageFailed = true"
    >
    <div
      v-else
      class="photo"
      aria-hidden="true"
    />
    <div class="details">
      <span class="title">{{ line.name }}</span>
      <div class="stepper">
        <button
          type="button"
          aria-label="Decrease quantity"
          @click="emit('setQuantity', props.line.itemId, props.line.quantity - 1)"
        >
          –
        </button>
        <span class="quantity">{{ line.quantity }}</span>
        <button
          type="button"
          aria-label="Increase quantity"
          @click="emit('setQuantity', props.line.itemId, props.line.quantity + 1)"
        >
          +
        </button>
      </div>
    </div>
    <span class="price">{{ formatPrice(line.unitPrice * line.quantity) }}</span>
  </div>
</template>

<style scoped>
.line-item {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px 0;
  border-bottom: 1px solid var(--color-border);
}

.photo {
  width: 76px;
  height: 76px;
  flex-shrink: 0;
  display: block;
  object-fit: cover;
  border-radius: 6px;
  background: repeating-linear-gradient(
    45deg,
    var(--color-border),
    var(--color-border) 6px,
    transparent 6px,
    transparent 12px
  );
}

.details {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.title {
  font-family: var(--font-display);
  font-size: 17px;
  color: var(--color-ink);
}

.stepper {
  display: flex;
  align-items: center;
  gap: 12px;
  border: 1px solid var(--color-border);
  border-radius: 20px;
  padding: 4px 12px;
  width: fit-content;
}

.stepper button {
  position: relative;
  background: none;
  border: none;
  color: var(--color-deep-green);
  font-weight: 700;
  font-size: 16px;
  cursor: pointer;
  line-height: 1;
  padding: 0 4px;
}

.stepper button::after {
  content: "";
  position: absolute;
  top: 50%;
  left: 50%;
  width: 44px;
  height: 44px;
  transform: translate(-50%, -50%);
}

.quantity {
  font-size: 14px;
  min-width: 16px;
  text-align: center;
}

.price {
  font-weight: 600;
  color: var(--color-ink);
  white-space: nowrap;
}

@media (max-width: 768px) {
  .photo {
    width: 56px;
    height: 56px;
  }

  .title {
    font-size: 14px;
  }

  .stepper {
    border-radius: 16px;
  }
}
</style>
