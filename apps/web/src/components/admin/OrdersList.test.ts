import { describe, expect, it } from "vitest";
import { mount } from "@vue/test-utils";
import OrdersList from "./OrdersList.vue";

const orders = [
  { id: "order1", customerName: "Jane Doe", createdAt: "2026-07-20T17:30:00.000Z", totalCents: 2400, status: "Completed" as const },
  { id: "order2", customerName: "Guest", createdAt: "2026-07-20T16:00:00.000Z", totalCents: 1200, status: "Completed" as const },
];

const detail = {
  id: "order1",
  customerName: "Jane Doe",
  phone: "+15551234567",
  createdAt: "2026-07-20T17:30:00.000Z",
  items: [{ name: "Burger", quantity: 2, unitPriceCents: 1200 }],
  totalCents: 2400,
  pointsEarned: 24,
  status: "Completed" as const,
};

describe("OrdersList", () => {
  it("renders a row per order with customer, time, total, and status pill", () => {
    const wrapper = mount(OrdersList, {
      props: { orders, selectedOrder: null, page: 1, totalPages: 1 },
    });
    const rows = wrapper.findAll("tbody tr.order-row");
    expect(rows).toHaveLength(2);
    expect(rows[0].text()).toContain("Jane Doe");
    expect(rows[0].text()).toContain("$24.00");
    expect(rows[1].text()).toContain("Guest");
    expect(wrapper.findAll(".status-pill")).toHaveLength(2);
  });

  it("emits select-order with the order id when a row is clicked", async () => {
    const wrapper = mount(OrdersList, {
      props: { orders, selectedOrder: null, page: 1, totalPages: 1 },
    });
    await wrapper.findAll("tbody tr.order-row")[0].trigger("click");
    expect(wrapper.emitted("select-order")?.[0]).toEqual(["order1"]);
  });

  it("highlights the selected row", () => {
    const wrapper = mount(OrdersList, {
      props: { orders, selectedOrder: detail, page: 1, totalPages: 1 },
    });
    const rows = wrapper.findAll("tbody tr.order-row");
    expect(rows[0].classes()).toContain("selected");
    expect(rows[1].classes()).not.toContain("selected");
  });

  it("shows itemized detail (items, total, points earned) when an order is selected", () => {
    const wrapper = mount(OrdersList, {
      props: { orders, selectedOrder: detail, page: 1, totalPages: 1 },
    });
    expect(wrapper.text()).toContain("Burger");
    expect(wrapper.text()).toContain("+15551234567");
    expect(wrapper.text()).toContain("24");
  });

  it("shows the page indicator and disables Prev/Next at boundaries", () => {
    const wrapper = mount(OrdersList, {
      props: { orders, selectedOrder: null, page: 1, totalPages: 2 },
    });
    expect(wrapper.text()).toContain("Page 1 of 2");
    expect(wrapper.find("[data-testid='prev-page']").attributes("disabled")).toBeDefined();
    expect(wrapper.find("[data-testid='next-page']").attributes("disabled")).toBeUndefined();
  });

  it("emits change-page when Next is clicked", async () => {
    const wrapper = mount(OrdersList, {
      props: { orders, selectedOrder: null, page: 1, totalPages: 2 },
    });
    await wrapper.find("[data-testid='next-page']").trigger("click");
    expect(wrapper.emitted("change-page")?.[0]).toEqual([2]);
  });
});
