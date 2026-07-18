<script setup lang="ts">
import { useCartStore } from "../stores/cart";

const cart = useCartStore();
</script>

<template>
  <header class="app-header">
    <span class="logo">Grove</span>
    <nav class="nav-links">
      <span>Menu</span>
      <span>Rewards</span>
      <span>Order History</span>
    </nav>
    <span class="cart-pill">Cart · {{ cart.totalItemCount }}</span>
  </header>
</template>

<style scoped>
.app-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
  background: var(--color-deep-green);
  color: var(--color-cream);
  padding: 20px 48px;
}

.logo {
  font-family: var(--font-display);
  font-size: 26px;
}

.nav-links {
  display: flex;
  gap: 24px;
  font-size: 14px;
  font-weight: 500;
  color: var(--color-header-muted);
}

.cart-pill {
  background: var(--color-gold);
  color: var(--color-gold-on-dark);
  font-size: 14px;
  font-weight: 600;
  padding: 6px 14px;
  border-radius: 3px;
}

@media (max-width: 768px) {
  .app-header {
    padding: 16px 20px;
  }

  .logo {
    font-size: 20px;
  }

  .nav-links {
    display: none;
  }

  .cart-pill {
    border-radius: 14px;
  }
}
</style>
