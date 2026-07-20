<script setup lang="ts">
import type { OrderRowDTO, OrderDetailDTO } from "../../api/admin";

const props = defineProps<{
  orders: OrderRowDTO[];
  selectedOrder: OrderDetailDTO | null;
  page: number;
  totalPages: number;
}>();

const emit = defineEmits<{
  "select-order": [id: string];
  "change-page": [page: number];
}>();

function formatDollars(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
}

function statusClass(status: OrderRowDTO["status"]): string {
  return `status-${status.toLowerCase()}`;
}
</script>

<template>
  <div class="orders-list">
    <div class="orders-main">
      <table class="orders-table">
        <thead>
          <tr>
            <th>Order</th>
            <th>Customer</th>
            <th>Time</th>
            <th>Total</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          <template
            v-for="order in props.orders"
            :key="order.id"
          >
            <tr
              class="order-row"
              :class="{ selected: order.id === props.selectedOrder?.id }"
              @click="emit('select-order', order.id)"
            >
              <td>#{{ order.id.slice(-6).toUpperCase() }}</td>
              <td>{{ order.customerName }}</td>
              <td>{{ formatTime(order.createdAt) }}</td>
              <td>{{ formatDollars(order.totalCents) }}</td>
              <td>
                <span
                  class="status-pill"
                  :class="statusClass(order.status)"
                >{{ order.status }}</span>
              </td>
            </tr>
            <tr
              v-if="props.selectedOrder && order.id === props.selectedOrder.id"
              class="mobile-detail-row"
            >
              <td colspan="5">
                <div class="detail-content">
                  <p class="detail-subline">
                    {{ props.selectedOrder.phone }} &middot; {{ formatTime(props.selectedOrder.createdAt) }}
                  </p>
                  <ul class="detail-items">
                    <li
                      v-for="item in props.selectedOrder.items"
                      :key="item.name"
                    >
                      {{ item.quantity }}&times; {{ item.name }} — {{ formatDollars(item.unitPriceCents * item.quantity) }}
                    </li>
                  </ul>
                  <p class="detail-total">
                    Total: {{ formatDollars(props.selectedOrder.totalCents) }}
                  </p>
                  <p class="detail-points">
                    +{{ props.selectedOrder.pointsEarned }} points issued
                  </p>
                </div>
              </td>
            </tr>
          </template>
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

    <aside
      v-if="props.selectedOrder"
      class="detail-panel"
    >
      <h2>Order #{{ props.selectedOrder.id.slice(-6).toUpperCase() }}</h2>
      <span class="status-pill status-completed">{{ props.selectedOrder.status }}</span>
      <p class="detail-subline">
        {{ props.selectedOrder.customerName }} &middot; {{ props.selectedOrder.phone }} &middot; {{ formatTime(props.selectedOrder.createdAt) }}
      </p>
      <ul class="detail-items">
        <li
          v-for="item in props.selectedOrder.items"
          :key="item.name"
        >
          {{ item.quantity }}&times; {{ item.name }} — {{ formatDollars(item.unitPriceCents * item.quantity) }}
        </li>
      </ul>
      <p class="detail-total">
        Total: {{ formatDollars(props.selectedOrder.totalCents) }}
      </p>
      <p class="detail-points">
        +{{ props.selectedOrder.pointsEarned }} points issued
      </p>
    </aside>
  </div>
</template>

<style scoped>
.orders-list {
  display: grid;
  grid-template-columns: 1.3fr 1fr;
  gap: 24px;
  align-items: start;
}

.orders-table {
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

.order-row {
  cursor: pointer;
}

.order-row.selected {
  background: #f7f4ec;
}

.status-pill {
  display: inline-block;
  border-radius: 12px;
  padding: 4px 10px;
  font-size: 12px;
}

.status-completed {
  background: #eee;
  color: #7a7362;
}

.detail-panel {
  position: sticky;
  top: 24px;
  background: white;
  border: 1px solid var(--color-border);
  border-radius: 8px;
  padding: 20px;
}

.detail-panel h2 {
  font-family: var(--font-display);
  font-size: 18px;
  margin: 0 0 8px;
  color: var(--color-ink);
}

.detail-subline {
  font-size: 13px;
  color: var(--color-muted);
}

.detail-items {
  list-style: none;
  margin: 12px 0;
  padding: 0;
  font-size: 13px;
  color: var(--color-ink);
}

.detail-total {
  font-family: var(--font-display);
  font-size: 18px;
  color: var(--color-ink);
}

.detail-points {
  color: var(--color-gold);
  font-size: 13px;
}

.mobile-detail-row {
  display: none;
}

.pagination {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
  font-size: 13px;
  color: var(--color-muted);
  margin-top: 16px;
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
  .orders-list {
    display: block;
  }

  .detail-panel {
    display: none;
  }

  .mobile-detail-row {
    display: table-row;
  }

  .orders-table,
  .orders-table tbody,
  .orders-table td,
  .orders-table tr {
    display: block;
  }

  .orders-table thead {
    display: none;
  }

  .order-row {
    padding: 12px 16px;
    border-bottom: 1px solid var(--color-border);
  }

  .order-row td {
    border-bottom: none;
    padding: 2px 0;
  }

  .mobile-detail-row td {
    border-bottom: 1px solid var(--color-border);
    padding: 12px 16px;
  }
}
</style>
