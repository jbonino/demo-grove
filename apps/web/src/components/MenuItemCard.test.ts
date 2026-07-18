import { describe, expect, it } from "vitest";
import { mount } from "@vue/test-utils";
import MenuItemCard from "./MenuItemCard.vue";

const item = {
  id: "1",
  name: "Burrata & Heirloom Tomato",
  description: "Fresh burrata, heirloom tomatoes",
  priceCents: 1600,
  category: "Starters",
};

describe("MenuItemCard", () => {
  it("shows name, price, and description", () => {
    const wrapper = mount(MenuItemCard, { props: { item } });
    expect(wrapper.text()).toContain("Burrata & Heirloom Tomato");
    expect(wrapper.text()).toContain("$16.00");
    expect(wrapper.text()).toContain("Fresh burrata, heirloom tomatoes");
  });

  it("emits add with the item when the Add button is clicked", async () => {
    const wrapper = mount(MenuItemCard, { props: { item } });
    await wrapper.find(".add-button").trigger("click");
    expect(wrapper.emitted("add")).toEqual([[item]]);
  });
});
