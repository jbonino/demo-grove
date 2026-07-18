import { describe, expect, it, vi } from "vitest";
import { mount, flushPromises } from "@vue/test-utils";
import { createPinia } from "pinia";
import * as menuItemsApi from "./api/menuItems";
import { createTestRouter } from "./test/testRouter";
import App from "./App.vue";

describe("App", () => {
  it("renders the menu route at /", async () => {
    vi.spyOn(menuItemsApi, "fetchMenuItems").mockResolvedValue([]);

    const router = createTestRouter();
    const wrapper = mount(App, {
      global: { plugins: [createPinia(), router] },
    });
    await router.isReady();
    await flushPromises();

    expect(wrapper.text()).toContain("Grove");
  });
});
