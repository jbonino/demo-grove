import { beforeEach, describe, expect, it, vi } from "vitest";
import { mount, flushPromises } from "@vue/test-utils";
import { createPinia, setActivePinia } from "pinia";
import * as menuItemsApi from "../api/menuItems";
import MenuView from "./MenuView.vue";

const mockItems = [
  { id: "1", name: "Burrata & Heirloom Tomato", description: "desc", priceCents: 1600, category: "Starters" },
  { id: "2", name: "Tuna Tartare", description: "desc", priceCents: 1900, category: "Starters" },
  { id: "3", name: "Braised Short Rib", description: "desc", priceCents: 3400, category: "Entrées" },
];

beforeEach(() => {
  setActivePinia(createPinia());
  vi.spyOn(menuItemsApi, "fetchMenuItems").mockResolvedValue(mockItems);
});

describe("MenuView", () => {
  it("shows category tabs and item cards for the active category", async () => {
    const wrapper = mount(MenuView);
    await flushPromises();

    expect(wrapper.findAll(".tab")).toHaveLength(2);
    expect(wrapper.text()).toContain("Burrata & Heirloom Tomato");
    expect(wrapper.text()).toContain("Tuna Tartare");
    expect(wrapper.text()).not.toContain("Braised Short Rib");
  });

  it("filters the grid when a category tab is selected", async () => {
    const wrapper = mount(MenuView);
    await flushPromises();

    await wrapper.findAll(".tab")[1].trigger("click");

    expect(wrapper.text()).toContain("Braised Short Rib");
    expect(wrapper.text()).not.toContain("Burrata & Heirloom Tomato");
  });

  it("increments the header cart-pill count when adding an item", async () => {
    const wrapper = mount(MenuView);
    await flushPromises();

    expect(wrapper.find(".cart-pill").text()).toContain("Cart · 0");

    await wrapper.find(".add-button").trigger("click");

    expect(wrapper.find(".cart-pill").text()).toContain("Cart · 1");
  });
});
