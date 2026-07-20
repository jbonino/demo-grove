import { beforeEach, describe, expect, it, vi } from "vitest";
import { mount, flushPromises } from "@vue/test-utils";
import { createPinia, setActivePinia } from "pinia";
import * as menuItemsApi from "../api/menuItems";
import { createTestRouter } from "../test/testRouter";
import MenuView from "./MenuView.vue";

const mockItems = [
  { id: "1", name: "Burrata & Heirloom Tomato", description: "desc", priceCents: 1600, category: "Starters" },
  { id: "2", name: "Tuna Tartare", description: "desc", priceCents: 1900, category: "Starters" },
  { id: "3", name: "Herb-Crusted Rack of Lamb", description: "desc", priceCents: 3400, category: "Entrées" },
];

const mockItemsWithPopular = [
  ...mockItems,
  { id: "4", name: "Braised Short Rib", description: "desc", priceCents: 3400, category: "Entrées" },
  { id: "5", name: "Miso-Glazed Salmon", description: "desc", priceCents: 3200, category: "Entrées" },
  { id: "6", name: "Truffle Parmesan Fries", description: "desc", priceCents: 900, category: "Sides" },
  { id: "7", name: "Chocolate Lava Cake", description: "desc", priceCents: 1200, category: "Desserts" },
];

beforeEach(() => {
  setActivePinia(createPinia());
  vi.spyOn(menuItemsApi, "fetchMenuItems").mockResolvedValue(mockItems);
});

async function mountMenuView() {
  const router = createTestRouter();
  router.push("/");
  await router.isReady();
  return mount(MenuView, { global: { plugins: [router] } });
}

describe("MenuView", () => {
  it("defaults to the All tab, showing every category grouped under its own heading", async () => {
    const wrapper = await mountMenuView();
    await flushPromises();

    expect(wrapper.findAll(".tab")).toHaveLength(3);
    expect(wrapper.findAll(".tab")[0].classes()).toContain("active");
    expect(wrapper.text()).toContain("Burrata & Heirloom Tomato");
    expect(wrapper.text()).toContain("Tuna Tartare");
    expect(wrapper.text()).toContain("Herb-Crusted Rack of Lamb");

    const headings = wrapper.findAll(".category-heading").map((h) => h.text());
    expect(headings).toEqual(["Starters", "Entrées"]);
  });

  it("narrows to a flat single-category grid when a category tab is selected, with no headings", async () => {
    const wrapper = await mountMenuView();
    await flushPromises();

    await wrapper.findAll(".tab")[2].trigger("click");

    expect(wrapper.findAll(".tab")[0].classes()).not.toContain("active");
    expect(wrapper.findAll(".tab")[2].classes()).toContain("active");
    expect(wrapper.text()).toContain("Herb-Crusted Rack of Lamb");
    expect(wrapper.text()).not.toContain("Burrata & Heirloom Tomato");
    expect(wrapper.findAll(".category-heading")).toHaveLength(0);
  });

  it("returns to the grouped All view when the All tab is re-selected", async () => {
    const wrapper = await mountMenuView();
    await flushPromises();

    await wrapper.findAll(".tab")[2].trigger("click");
    await wrapper.findAll(".tab")[0].trigger("click");

    expect(wrapper.text()).toContain("Burrata & Heirloom Tomato");
    expect(wrapper.text()).toContain("Herb-Crusted Rack of Lamb");
    expect(wrapper.findAll(".category-heading")).toHaveLength(2);
  });

  it("shows a Most Popular section above the category sections in the All view", async () => {
    vi.spyOn(menuItemsApi, "fetchMenuItems").mockResolvedValue(mockItemsWithPopular);
    const wrapper = await mountMenuView();
    await flushPromises();

    const popularSection = wrapper.find(".most-popular");
    expect(popularSection.exists()).toBe(true);
    expect(popularSection.text()).toContain("Braised Short Rib");
    expect(popularSection.text()).toContain("Miso-Glazed Salmon");
    expect(popularSection.text()).toContain("Truffle Parmesan Fries");
    expect(popularSection.text()).toContain("Chocolate Lava Cake");

    // Most Popular items still appear under their own category section too
    const entreesSection = wrapper.findAll(".category-section").find((s) => s.text().includes("Entrées"));
    expect(entreesSection?.text()).toContain("Braised Short Rib");
    expect(entreesSection?.text()).toContain("Miso-Glazed Salmon");
  });

  it("omits the Most Popular section when none of the curated items are on the menu", async () => {
    const wrapper = await mountMenuView();
    await flushPromises();

    expect(wrapper.find(".most-popular").exists()).toBe(false);
  });

  it("increments the header cart-pill count when adding an item", async () => {
    const wrapper = await mountMenuView();
    await flushPromises();

    expect(wrapper.find(".cart-pill").text()).toContain("Cart · 0");

    await wrapper.find(".add-button").trigger("click");

    expect(wrapper.find(".cart-pill").text()).toContain("Cart · 1");
  });

  describe("loading state", () => {
    it("shows skeleton placeholders while menu items are loading", async () => {
      let resolveFetch!: (items: typeof mockItems) => void;
      vi.spyOn(menuItemsApi, "fetchMenuItems").mockReturnValue(
        new Promise((resolve) => {
          resolveFetch = resolve;
        }),
      );

      const wrapper = await mountMenuView();

      expect(wrapper.findAll(".skeleton-card").length).toBeGreaterThan(0);
      expect(wrapper.find(".add-button").exists()).toBe(false);

      resolveFetch(mockItems);
      await flushPromises();
    });

    it("hides skeleton placeholders once menu items have loaded", async () => {
      const wrapper = await mountMenuView();
      await flushPromises();

      expect(wrapper.findAll(".skeleton-card")).toHaveLength(0);
      expect(wrapper.text()).toContain("Burrata & Heirloom Tomato");
    });
  });
});
