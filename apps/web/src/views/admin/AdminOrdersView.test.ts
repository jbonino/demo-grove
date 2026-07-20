import { beforeEach, describe, expect, it, vi } from "vitest";
import { mount, flushPromises } from "@vue/test-utils";
import { createPinia, setActivePinia } from "pinia";
import { createTestRouter } from "../../test/testRouter";
import * as adminApi from "../../api/admin";
import AdminOrdersView from "./AdminOrdersView.vue";

beforeEach(() => {
  setActivePinia(createPinia());
});

async function mountView() {
  const router = createTestRouter();
  router.push("/admin/orders");
  await router.isReady();
  const wrapper = mount(AdminOrdersView, { global: { plugins: [router] } });
  await flushPromises();
  return { wrapper, router };
}

describe("AdminOrdersView", () => {
  it("fetches orders on mount and renders the list", async () => {
    vi.spyOn(adminApi, "fetchOrders").mockResolvedValue({
      orders: [
        { id: "order1", customerName: "Jane Doe", createdAt: "2026-07-20T17:00:00.000Z", totalCents: 2400, status: "Completed" },
      ],
      page: 1,
      totalPages: 1,
    });

    const { wrapper } = await mountView();

    expect(wrapper.text()).toContain("Jane Doe");
    expect(adminApi.fetchOrders).toHaveBeenCalledWith({ page: 1 });
  });

  it("fetches order detail and shows it when a row is clicked", async () => {
    vi.spyOn(adminApi, "fetchOrders").mockResolvedValue({
      orders: [
        { id: "order1", customerName: "Jane Doe", createdAt: "2026-07-20T17:00:00.000Z", totalCents: 2400, status: "Completed" },
      ],
      page: 1,
      totalPages: 1,
    });
    const fetchOrderDetail = vi.spyOn(adminApi, "fetchOrderDetail").mockResolvedValue({
      id: "order1",
      customerName: "Jane Doe",
      phone: "+15551234567",
      createdAt: "2026-07-20T17:00:00.000Z",
      items: [{ name: "Burger", quantity: 1, unitPriceCents: 1200 }],
      totalCents: 1200,
      pointsEarned: 12,
      status: "Completed",
    });

    const { wrapper } = await mountView();
    await wrapper.find("tbody tr.order-row").trigger("click");
    await flushPromises();

    expect(fetchOrderDetail).toHaveBeenCalledWith("order1");
    expect(wrapper.text()).toContain("Burger");
  });

  it("refetches the requested page when Next is clicked", async () => {
    const fetchOrders = vi.spyOn(adminApi, "fetchOrders").mockResolvedValue({
      orders: [],
      page: 1,
      totalPages: 2,
    });

    const { wrapper } = await mountView();
    await wrapper.find("[data-testid='next-page']").trigger("click");
    await flushPromises();

    expect(fetchOrders).toHaveBeenLastCalledWith({ page: 2 });
  });
});
