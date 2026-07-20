<script setup lang="ts">
import type { RecentOrderDTO } from "../../api/admin";

const props = defineProps<{ orders: RecentOrderDTO[] }>();

function formatDollars(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
}

function statusClass(status: RecentOrderDTO["status"]): string {
  return `status-${status.toLowerCase()}`;
}
</script>

<template>
  <table class="recent-orders">
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
      <tr
        v-for="order in props.orders"
        :key="order.id"
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
    </tbody>
  </table>
</template>

<style scoped>
.recent-orders {
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

.status-pill {
  display: inline-block;
  border-radius: 12px;
  padding: 4px 10px;
  font-size: 12px;
}

.status-preparing {
  background: #eaf2ea;
  color: #3d6b4a;
}

.status-ready {
  background: #f2ede2;
  color: #8a7a3d;
}

.status-completed {
  background: #eee;
  color: #7a7362;
}

@media (max-width: 768px) {
  .recent-orders,
  .recent-orders tbody,
  .recent-orders td,
  .recent-orders tr {
    display: block;
  }

  .recent-orders thead {
    display: none;
  }

  tr {
    padding: 12px 16px;
    border-bottom: 1px solid var(--color-border);
  }

  td {
    border-bottom: none;
    padding: 2px 0;
  }
}
</style>
