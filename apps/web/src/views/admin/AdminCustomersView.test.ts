import { beforeEach, describe, expect, it, vi } from "vitest";
import { mount, flushPromises } from "@vue/test-utils";
import { createPinia, setActivePinia } from "pinia";
import { createTestRouter } from "../../test/testRouter";
import * as adminApi from "../../api/admin";
import AdminCustomersView from "./AdminCustomersView.vue";

beforeEach(() => {
  setActivePinia(createPinia());
});

async function mountView() {
  const router = createTestRouter();
  router.push("/admin/customers");
  await router.isReady();
  const wrapper = mount(AdminCustomersView, { global: { plugins: [router] } });
  await flushPromises();
  return { wrapper, router };
}

describe("AdminCustomersView", () => {
  it("fetches customers on mount and renders the list", async () => {
    vi.spyOn(adminApi, "fetchCustomers").mockResolvedValue({
      customers: [
        { name: "Jane Doe", phone: "+15551234567", pointsBalance: 120, lifetimeOrders: 4, lastOrderAt: "2026-07-20T17:30:00.000Z" },
      ],
      page: 1,
      totalPages: 1,
    });

    const { wrapper } = await mountView();

    expect(wrapper.text()).toContain("Jane Doe");
    expect(adminApi.fetchCustomers).toHaveBeenCalledWith({ search: "", page: 1 });
  });

  it("refetches with the search term (reset to page 1) when the operator searches", async () => {
    const fetchCustomers = vi.spyOn(adminApi, "fetchCustomers").mockResolvedValue({
      customers: [],
      page: 1,
      totalPages: 1,
    });

    const { wrapper } = await mountView();
    await wrapper.find('input[type="search"]').setValue("jane");
    await flushPromises();

    expect(fetchCustomers).toHaveBeenLastCalledWith({ search: "jane", page: 1 });
  });

  it("refetches the requested page when Next is clicked", async () => {
    const fetchCustomers = vi.spyOn(adminApi, "fetchCustomers").mockResolvedValue({
      customers: [],
      page: 1,
      totalPages: 2,
    });

    const { wrapper } = await mountView();
    await wrapper.find("[data-testid='next-page']").trigger("click");
    await flushPromises();

    expect(fetchCustomers).toHaveBeenLastCalledWith({ search: "", page: 2 });
  });
});
