<script setup lang="ts">
import { onMounted, ref } from "vue";
import { fetchDashboardStats, type DashboardStatsDTO } from "../../api/admin";
import AdminNav from "../../components/admin/AdminNav.vue";
import DashboardStatCards from "../../components/admin/DashboardStatCards.vue";
import RecentOrdersTable from "../../components/admin/RecentOrdersTable.vue";

const stats = ref<DashboardStatsDTO | null>(null);
const loading = ref(true);

onMounted(async () => {
  try {
    stats.value = await fetchDashboardStats();
  } finally {
    loading.value = false;
  }
});
</script>

<template>
  <div class="admin-dashboard">
    <AdminNav />
    <main class="content">
      <h1>Dashboard</h1>
      <template v-if="stats">
        <DashboardStatCards :stats="stats" />
        <RecentOrdersTable :orders="stats.recentOrders" />
      </template>
      <p v-else-if="loading">
        Loading…
      </p>
    </main>
  </div>
</template>

<style scoped>
.admin-dashboard {
  display: flex;
  min-height: 100vh;
  background: var(--color-cream);
}

.content {
  flex: 1;
  padding: 36px 40px;
}

h1 {
  font-family: var(--font-display);
  font-size: 26px;
  color: var(--color-ink);
  margin: 0 0 24px;
}

@media (max-width: 768px) {
  .admin-dashboard {
    flex-direction: column;
  }

  .content {
    padding: 16px;
    padding-bottom: 80px;
  }
}
</style>
