<script setup lang="ts">
import { useRouter } from "vue-router";
import { useCartStore } from "../stores/cart";
import AppHeader from "../components/AppHeader.vue";
import CartLineItem from "../components/CartLineItem.vue";
import OrderSummaryCard from "../components/OrderSummaryCard.vue";

const cart = useCartStore();
const router = useRouter();

function goToCheckout() {
  router.push({ name: "checkout" });
}
</script>

<template>
  <div class="cart-view">
    <AppHeader />

    <div
      v-if="cart.lines.length === 0"
      class="empty-state"
    >
      <p>Your cart is empty.</p>
      <RouterLink to="/">
        Back to Menu
      </RouterLink>
    </div>

    <div
      v-else
      class="cart-grid"
    >
      <div class="line-items">
        <CartLineItem
          v-for="line in cart.lines"
          :key="line.itemId"
          :line="line"
          @set-quantity="cart.setQuantity"
        />
      </div>
      <OrderSummaryCard
        :subtotal-cents="cart.subtotalCents"
        cta-label="Go to Checkout"
        show-promo
        @cta="goToCheckout"
      />
    </div>
  </div>
</template>

<style scoped>
.empty-state {
  text-align: center;
  padding: 96px 24px;
  color: var(--color-muted);
}

.empty-state a {
  color: var(--color-deep-green);
  font-weight: 600;
}

.cart-grid {
  display: grid;
  grid-template-columns: 1.6fr 1fr;
  gap: 48px;
  padding: 44px 48px;
}

@media (max-width: 768px) {
  .cart-grid {
    grid-template-columns: 1fr;
    gap: 24px;
    padding: 16px 20px;
  }
}
</style>
