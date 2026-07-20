<script setup lang="ts">
import { onMounted, ref } from "vue";
import { fetchOrders, fetchOrderDetail, type OrderListDTO, type OrderDetailDTO } from "../../api/admin";
import AdminNav from "../../components/admin/AdminNav.vue";
import OrdersList from "../../components/admin/OrdersList.vue";

const result = ref<OrderListDTO | null>(null);
const selectedOrder = ref<OrderDetailDTO | null>(null);
const page = ref(1);

async function load() {
  result.value = await fetchOrders({ page: page.value });
}

onMounted(load);

async function onSelectOrder(id: string) {
  selectedOrder.value = await fetchOrderDetail(id);
}

function onChangePage(newPage: number) {
  page.value = newPage;
  load();
}
</script>

<template>
  <div class="admin-orders">
    <AdminNav />
    <main class="content">
      <h1>Orders</h1>
      <OrdersList
        v-if="result"
        :orders="result.orders"
        :selected-order="selectedOrder"
        :page="result.page"
        :total-pages="result.totalPages"
        @select-order="onSelectOrder"
        @change-page="onChangePage"
      />
    </main>
  </div>
</template>

<style scoped>
.admin-orders {
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
  .admin-orders {
    flex-direction: column;
  }

  .content {
    padding: 16px;
    padding-bottom: 80px;
  }
}
</style>
