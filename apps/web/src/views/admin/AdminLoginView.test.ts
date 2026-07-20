import { beforeEach, describe, expect, it, vi } from "vitest";
import { mount, flushPromises } from "@vue/test-utils";
import { createPinia, setActivePinia } from "pinia";
import { createTestRouter } from "../../test/testRouter";
import * as adminApi from "../../api/admin";
import AdminLoginView from "./AdminLoginView.vue";

beforeEach(() => {
  setActivePinia(createPinia());
});

async function mountAdminLoginView() {
  const router = createTestRouter();
  router.push("/admin/login");
  await router.isReady();

  const wrapper = mount(AdminLoginView, { global: { plugins: [router] } });
  await flushPromises();
  return { wrapper, router };
}

describe("AdminLoginView", () => {
  it("shows an inline error and does not navigate when the password is wrong", async () => {
    vi.spyOn(adminApi, "adminLogin").mockRejectedValue(new Error("Incorrect password"));
    const { wrapper, router } = await mountAdminLoginView();

    await wrapper.find('input[type="password"]').setValue("wrong-password");
    await wrapper.find("form").trigger("submit");
    await flushPromises();

    expect(wrapper.text()).toContain("Incorrect password");
    expect(router.currentRoute.value.name).toBe("admin-login");
  });

  it("redirects to the admin dashboard when the password is correct", async () => {
    vi.spyOn(adminApi, "adminLogin").mockResolvedValue();
    const { wrapper, router } = await mountAdminLoginView();

    await wrapper.find('input[type="password"]').setValue("correct-password");
    await wrapper.find("form").trigger("submit");
    await flushPromises();

    expect(router.currentRoute.value.name).toBe("admin-dashboard");
  });
});
