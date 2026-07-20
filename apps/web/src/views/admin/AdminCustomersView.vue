<script setup lang="ts">
import { onMounted, ref, watch } from "vue";
import { fetchCustomers, type CustomerListDTO } from "../../api/admin";
import AdminNav from "../../components/admin/AdminNav.vue";
import CustomersList from "../../components/admin/CustomersList.vue";

const result = ref<CustomerListDTO | null>(null);
const search = ref("");
const page = ref(1);

async function load() {
  result.value = await fetchCustomers({ search: search.value, page: page.value });
}

onMounted(load);

watch(search, () => {
  page.value = 1;
  load();
});

function onChangePage(newPage: number) {
  page.value = newPage;
  load();
}
</script>

<template>
  <div class="admin-customers">
    <AdminNav />
    <main class="content">
      <h1>Customers</h1>
      <CustomersList
        v-if="result"
        :customers="result.customers"
        :search="search"
        :page="result.page"
        :total-pages="result.totalPages"
        @update:search="search = $event"
        @change-page="onChangePage"
      />
    </main>
  </div>
</template>

<style scoped>
.admin-customers {
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
  .admin-customers {
    flex-direction: column;
  }

  .content {
    padding: 16px;
    padding-bottom: 80px;
  }
}
</style>
