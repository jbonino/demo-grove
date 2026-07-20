import { beforeEach, describe, expect, it, vi } from "vitest";
import { mount, flushPromises } from "@vue/test-utils";
import { createPinia, setActivePinia } from "pinia";
import * as adminApi from "../../api/admin";
import { createTestRouter } from "../../test/testRouter";
import AdminNav from "./AdminNav.vue";

beforeEach(() => {
  setActivePinia(createPinia());
});

async function mountAdminNav(startPath = "/admin") {
  const router = createTestRouter();
  router.push(startPath);
  await router.isReady();
  const wrapper = mount(AdminNav, { global: { plugins: [router] } });
  return { wrapper, router };
}

describe("AdminNav", () => {
  it("links to Dashboard, Customers, and Orders", async () => {
    const { wrapper } = await mountAdminNav();
    const hrefs = wrapper.findAll("a").map((a) => a.attributes("href"));
    expect(hrefs).toContain("/admin");
    expect(hrefs).toContain("/admin/customers");
    expect(hrefs).toContain("/admin/orders");
  });

  it("marks the current route's nav item active", async () => {
    const { wrapper } = await mountAdminNav("/admin/customers");
    const activeLink = wrapper.find("a.active");
    expect(activeLink.attributes("href")).toBe("/admin/customers");
  });

  it("signs out and redirects to login when Sign out is clicked", async () => {
    vi.spyOn(adminApi, "adminLogout").mockResolvedValue();
    const { wrapper, router } = await mountAdminNav();

    await wrapper.find(".sign-out").trigger("click");
    await flushPromises();

    expect(adminApi.adminLogout).toHaveBeenCalled();
    expect(router.currentRoute.value.name).toBe("admin-login");
  });
});
