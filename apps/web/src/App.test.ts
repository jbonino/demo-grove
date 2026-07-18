import { describe, expect, it, vi } from "vitest";
import { mount, flushPromises } from "@vue/test-utils";
import { createPinia } from "pinia";
import { createRouter, createWebHistory } from "vue-router";
import * as menuItemsApi from "./api/menuItems";
import MenuView from "./views/MenuView.vue";
import App from "./App.vue";

describe("App", () => {
  it("renders the menu route at /", async () => {
    vi.spyOn(menuItemsApi, "fetchMenuItems").mockResolvedValue([]);

    const router = createRouter({
      history: createWebHistory(),
      routes: [{ path: "/", name: "menu", component: MenuView }],
    });

    const wrapper = mount(App, {
      global: { plugins: [createPinia(), router] },
    });
    await router.isReady();
    await flushPromises();

    expect(wrapper.text()).toContain("Grove");
  });
});
