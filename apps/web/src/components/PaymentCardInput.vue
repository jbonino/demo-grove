<script setup lang="ts">
import { onMounted, onUnmounted, ref } from "vue";
import type { Stripe, StripeCardElement, StripeElements } from "@stripe/stripe-js";
import { getStripe } from "../stripeClient";

const emit = defineEmits<{
  ready: [stripe: Stripe, elements: StripeElements, card: StripeCardElement];
}>();

const cardRef = ref<HTMLDivElement | null>(null);
let card: StripeCardElement | undefined;

onMounted(async () => {
  const stripe = await getStripe();
  if (!stripe || !cardRef.value) {
    return;
  }
  const elements = stripe.elements();
  card = elements.create("card", {
    style: {
      base: {
        fontSize: "16px",
      },
    },
  });
  card.mount(cardRef.value);
  emit("ready", stripe, elements, card);
});

onUnmounted(() => {
  card?.unmount();
});
</script>

<template>
  <div
    ref="cardRef"
    class="card-input"
    data-testid="card-input"
  />
</template>

<style scoped>
.card-input {
  border: 1px solid var(--color-deep-green);
  border-radius: 6px;
  padding: 16px 18px;
  background: white;
}

@media (max-width: 768px) {
  .card-input {
    padding: 14px;
  }
}
</style>
