<script setup lang="ts">
import { ref, watch } from "vue";
import { useCartStore } from "../stores/cart";

withDefaults(defineProps<{ step?: string }>(), { step: undefined });

const PULSE_DURATION_MS = 400;
const cart = useCartStore();
const isPulsing = ref(false);
let pulseTimeout: ReturnType<typeof setTimeout> | undefined;

watch(
  () => cart.totalItemCount,
  (count, previousCount) => {
    if (count > previousCount) {
      isPulsing.value = true;
      clearTimeout(pulseTimeout);
      pulseTimeout = setTimeout(() => {
        isPulsing.value = false;
      }, PULSE_DURATION_MS);
    }
  },
);
</script>

<template>
  <header class="app-header">
    <RouterLink
      to="/"
      class="logo"
    >
      Grove
    </RouterLink>

    <span
      v-if="step"
      class="step"
    >{{ step }}</span>
    <nav
      v-else
      class="nav-links"
    >
      <RouterLink to="/">
        Menu
      </RouterLink>
      <RouterLink
        to="/loyalty"
        class="rewards-tab"
      >
        Rewards
      </RouterLink>
      <RouterLink
        to="/readme"
        class="readme-tab"
      >
        Readme
      </RouterLink>
    </nav>

    <RouterLink
      v-if="!step"
      to="/cart"
      class="cart-pill"
      :class="{ 'is-pulsing': isPulsing }"
    >
      Cart · {{ cart.totalItemCount }}
    </RouterLink>
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
  color: var(--color-cream);
  text-decoration: none;
}

.step {
  font-size: 14px;
  font-weight: 500;
  color: var(--color-header-muted);
}

.nav-links {
  display: flex;
  gap: 24px;
  font-size: 14px;
  font-weight: 500;
  color: var(--color-header-muted);
}

.nav-links a {
  color: inherit;
  text-decoration: none;
}

.rewards-tab.router-link-active {
  color: var(--color-cream);
  border-bottom: 2px solid var(--color-gold);
  padding-bottom: 2px;
}

.nav-links a.readme-tab {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  color: var(--color-gold);
  border: 1px solid var(--color-gold);
  border-radius: 999px;
  padding: 4px 12px;
}

.readme-tab::before {
  content: "";
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--color-gold);
}

.nav-links a.readme-tab:hover,
.nav-links a.readme-tab.router-link-active {
  background: var(--color-gold);
  color: var(--color-gold-on-dark);
}

.readme-tab:hover::before,
.readme-tab.router-link-active::before {
  background: var(--color-gold-on-dark);
}

.cart-pill {
  background: var(--color-gold);
  color: var(--color-gold-on-dark);
  font-size: 14px;
  font-weight: 600;
  padding: 6px 14px;
  border-radius: 3px;
  text-decoration: none;
}

.cart-pill.is-pulsing {
  animation: cart-pill-pulse 0.4s ease;
}

@keyframes cart-pill-pulse {
  0% {
    transform: scale(1);
  }
  40% {
    transform: scale(1.15);
  }
  100% {
    transform: scale(1);
  }
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
