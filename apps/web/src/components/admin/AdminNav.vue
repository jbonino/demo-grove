<script setup lang="ts">
import { useRoute, useRouter } from "vue-router";
import { useAdminAuthStore } from "../../stores/adminAuth";

const route = useRoute();
const router = useRouter();
const auth = useAdminAuthStore();

const navItems = [
  { name: "admin-dashboard", path: "/admin", label: "Dashboard" },
  { name: "admin-customers", path: "/admin/customers", label: "Customers" },
  { name: "admin-orders", path: "/admin/orders", label: "Orders" },
];

async function onSignOut() {
  await auth.logout();
  router.push({ name: "admin-login" });
}
</script>

<template>
  <nav class="admin-nav">
    <div class="wordmark">
      Grove Admin
    </div>
    <ul class="nav-links">
      <li
        v-for="item in navItems"
        :key="item.name"
      >
        <router-link
          :to="item.path"
          class="nav-link"
          :class="{ active: route.name === item.name }"
        >
          {{ item.label }}
        </router-link>
      </li>
    </ul>
    <button
      type="button"
      class="sign-out"
      @click="onSignOut"
    >
      Sign out
    </button>
  </nav>
</template>

<style scoped>
.admin-nav {
  display: flex;
  flex-direction: column;
  height: 100%;
  width: 220px;
  background: var(--color-deep-green);
  padding: 24px 16px;
  box-sizing: border-box;
}

.wordmark {
  font-family: var(--font-display);
  font-size: 20px;
  color: var(--color-cream);
  margin-bottom: 32px;
}

.nav-links {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 4px;
  flex: 1;
}

.nav-link {
  display: block;
  padding: 10px 14px;
  border-radius: 6px;
  color: var(--color-cream);
  text-decoration: none;
  font-size: 14px;
}

.nav-link.active {
  background: rgba(255, 255, 255, 0.12);
  font-weight: 600;
}

.sign-out {
  border: none;
  background: none;
  color: var(--color-cream);
  opacity: 0.8;
  font-size: 14px;
  cursor: pointer;
  text-align: left;
  padding: 10px 14px;
}

@media (max-width: 768px) {
  .admin-nav {
    width: 100%;
    height: auto;
    flex-direction: row;
    align-items: center;
    padding: 12px 16px;
    position: fixed;
    bottom: 0;
    left: 0;
    z-index: 10;
  }

  .wordmark {
    display: none;
  }

  .nav-links {
    flex-direction: row;
    flex: 1;
    justify-content: space-around;
  }

  .sign-out {
    padding: 6px 10px;
  }
}
</style>
