import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
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

  describe("added feedback", () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it("shows 'Added ✓' on the button right after clicking Add", async () => {
      const wrapper = mount(MenuItemCard, { props: { item } });
      const button = wrapper.find(".add-button");
      await button.trigger("click");
      expect(button.text()).toBe("Added ✓");
    });

    it("reverts the button back to 'Add' after the feedback window elapses", async () => {
      const wrapper = mount(MenuItemCard, { props: { item } });
      const button = wrapper.find(".add-button");
      await button.trigger("click");
      expect(button.text()).toBe("Added ✓");
      vi.advanceTimersByTime(900);
      await wrapper.vm.$nextTick();
      expect(button.text()).toBe("Add");
    });
  });

  describe("photo", () => {
    it("shows an image when the item has an imageUrl", () => {
      const itemWithPhoto = { ...item, imageUrl: "https://example.com/photo.jpg" };
      const wrapper = mount(MenuItemCard, { props: { item: itemWithPhoto } });
      const img = wrapper.find("img.photo");
      expect(img.exists()).toBe(true);
      expect(img.attributes("src")).toBe("https://example.com/photo.jpg");
      expect(img.attributes("alt")).toBe(itemWithPhoto.name);
    });

    it("shows the placeholder when the item has no imageUrl", () => {
      const wrapper = mount(MenuItemCard, { props: { item } });
      expect(wrapper.find("img.photo").exists()).toBe(false);
      expect(wrapper.find("div.photo").exists()).toBe(true);
    });

    it("falls back to the placeholder if the image fails to load", async () => {
      const itemWithPhoto = { ...item, imageUrl: "https://example.com/broken.jpg" };
      const wrapper = mount(MenuItemCard, { props: { item: itemWithPhoto } });
      await wrapper.find("img.photo").trigger("error");
      expect(wrapper.find("img.photo").exists()).toBe(false);
      expect(wrapper.find("div.photo").exists()).toBe(true);
    });
  });

  describe("haptic feedback", () => {
    it("vibrates when the Add button is clicked, if the browser supports it", async () => {
      const vibrate = vi.fn();
      vi.stubGlobal("navigator", { ...navigator, vibrate });
      const wrapper = mount(MenuItemCard, { props: { item } });
      await wrapper.find(".add-button").trigger("click");
      expect(vibrate).toHaveBeenCalledWith(20);
      vi.unstubAllGlobals();
    });

    it("does not throw when navigator.vibrate is unsupported", async () => {
      const navigatorWithoutVibrate = { ...navigator };
      delete (navigatorWithoutVibrate as { vibrate?: unknown }).vibrate;
      vi.stubGlobal("navigator", navigatorWithoutVibrate);
      const wrapper = mount(MenuItemCard, { props: { item } });
      await expect(wrapper.find(".add-button").trigger("click")).resolves.not.toThrow();
      vi.unstubAllGlobals();
    });
  });
});
