import { describe, expect, it } from "vitest";
import { mount } from "@vue/test-utils";
import RecentOrdersTable from "./RecentOrdersTable.vue";

const recentOrders = [
  {
    id: "order1",
    customerName: "Jane Doe",
    createdAt: "2026-07-20T17:30:00.000Z",
    totalCents: 3400,
    status: "Completed" as const,
  },
  {
    id: "order2",
    customerName: "Guest",
    createdAt: "2026-07-20T16:00:00.000Z",
    totalCents: 1200,
    status: "Completed" as const,
  },
];

describe("RecentOrdersTable", () => {
  it("renders a row per order with customer, time, and total", () => {
    const wrapper = mount(RecentOrdersTable, { props: { orders: recentOrders } });
    const rows = wrapper.findAll("tbody tr");
    expect(rows).toHaveLength(2);
    expect(rows[0].text()).toContain("Jane Doe");
    expect(rows[0].text()).toContain("$34.00");
    expect(rows[1].text()).toContain("Guest");
  });

  it("shows a Completed status pill with the completed styling class", () => {
    const wrapper = mount(RecentOrdersTable, { props: { orders: recentOrders } });
    const pills = wrapper.findAll(".status-pill");
    expect(pills).toHaveLength(2);
    expect(pills[0].text()).toBe("Completed");
    expect(pills[0].classes()).toContain("status-completed");
  });
});
