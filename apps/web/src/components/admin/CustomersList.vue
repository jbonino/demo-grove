<script setup lang="ts">
import type { CustomerRowDTO } from "../../api/admin";

const props = defineProps<{
  customers: CustomerRowDTO[];
  search: string;
  page: number;
  totalPages: number;
}>();

const emit = defineEmits<{
  "update:search": [value: string];
  "change-page": [page: number];
}>();

function onSearchInput(event: Event) {
  emit("update:search", (event.target as HTMLInputElement).value);
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString([], { month: "short", day: "numeric", year: "numeric" });
}
</script>

<template>
  <div class="customers-list">
    <input
      type="search"
      class="search-input"
      placeholder="Search by phone or name"
      :value="props.search"
      @input="onSearchInput"
    >

    <table class="customers-table">
      <thead>
        <tr>
          <th>Name</th>
          <th>Phone</th>
          <th>Points Balance</th>
          <th>Lifetime Orders</th>
          <th>Last Order</th>
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="customer in props.customers"
          :key="customer.phone"
        >
          <td>{{ customer.name }}</td>
          <td>{{ customer.phone }}</td>
          <td class="points">
            {{ customer.pointsBalance }}
          </td>
          <td>{{ customer.lifetimeOrders }}</td>
          <td>{{ formatDate(customer.lastOrderAt) }}</td>
        </tr>
      </tbody>
    </table>

    <div class="pagination">
      <button
        type="button"
        data-testid="prev-page"
        :disabled="props.page <= 1"
        @click="emit('change-page', props.page - 1)"
      >
        Prev
      </button>
      <span>Page {{ props.page }} of {{ props.totalPages }}</span>
      <button
        type="button"
        data-testid="next-page"
        :disabled="props.page >= props.totalPages"
        @click="emit('change-page', props.page + 1)"
      >
        Next
      </button>
    </div>
  </div>
</template>

<style scoped>
.customers-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.search-input {
  align-self: flex-end;
  width: 280px;
  max-width: 100%;
  border: 1px solid var(--color-border);
  border-radius: 20px;
  padding: 8px 16px;
  font-size: 13px;
  font-family: inherit;
}

.customers-table {
  width: 100%;
  border-collapse: collapse;
  background: white;
  border: 1px solid var(--color-border);
  border-radius: 8px;
  overflow: hidden;
}

th {
  text-align: left;
  font-size: 11px;
  text-transform: uppercase;
  color: var(--color-placeholder);
  padding: 12px 16px;
  border-bottom: 1px solid var(--color-border);
}

td {
  font-size: 13px;
  color: var(--color-ink);
  padding: 12px 16px;
  border-bottom: 1px solid var(--color-border);
}

tr:last-child td {
  border-bottom: none;
}

.points {
  color: var(--color-gold);
  font-weight: 600;
}

.pagination {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
  font-size: 13px;
  color: var(--color-muted);
}

.pagination button {
  border: 1px solid var(--color-border);
  background: white;
  border-radius: 4px;
  padding: 6px 14px;
  font-size: 13px;
  cursor: pointer;
}

.pagination button:disabled {
  opacity: 0.4;
  cursor: default;
}

@media (max-width: 768px) {
  .search-input {
    align-self: stretch;
    width: auto;
  }

  .customers-table,
  .customers-table tbody,
  .customers-table td,
  .customers-table tr {
    display: block;
  }

  .customers-table thead {
    display: none;
  }

  .customers-table tr {
    padding: 12px 16px;
    border-bottom: 1px solid var(--color-border);
  }

  .customers-table td {
    border-bottom: none;
    padding: 2px 0;
  }
}
</style>
