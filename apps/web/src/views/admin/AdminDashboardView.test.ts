import { beforeEach, describe, expect, it, vi } from "vitest";
import { mount, flushPromises } from "@vue/test-utils";
import { createPinia, setActivePinia } from "pinia";
import { createTestRouter } from "../../test/testRouter";
import * as adminApi from "../../api/admin";
import AdminDashboardView from "./AdminDashboardView.vue";

beforeEach(() => {
  setActivePinia(createPinia());
});

async function mountAdminDashboardView() {
  const router = createTestRouter();
  router.push("/admin");
  await router.isReady();
  const wrapper = mount(AdminDashboardView, { global: { plugins: [router] } });
  await flushPromises();
  return { wrapper, router };
}

describe("AdminDashboardView", () => {
  it("fetches stats on mount and renders the stat cards and recent orders table", async () => {
    vi.spyOn(adminApi, "fetchDashboardStats").mockResolvedValue({
      ordersToday: 5,
      ordersTodayDelta: 2,
      revenueTodayCents: 10000,
      revenueTodayDeltaCents: 500,
      pointsIssued7d: 400,
      pointsRedeemed7d: 3,
      signups7d: 2,
      ordersOutOf7d: 20,
      recentOrders: [
        { id: "order1", customerName: "Jane Doe", createdAt: "2026-07-20T17:00:00.000Z", totalCents: 2000, status: "Completed" },
      ],
    });

    const { wrapper } = await mountAdminDashboardView();

    expect(wrapper.text()).toContain("Orders Today");
    expect(wrapper.text()).toContain("Jane Doe");
    expect(wrapper.find(".admin-nav").exists()).toBe(true);
  });
});
