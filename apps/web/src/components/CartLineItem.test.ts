import { describe, expect, it } from "vitest";
import { mount } from "@vue/test-utils";
import CartLineItem from "./CartLineItem.vue";

const line = { itemId: "1", name: "Burrata & Heirloom Tomato", quantity: 2, unitPrice: 1600 };

describe("CartLineItem", () => {
  it("shows name, quantity, and line total", () => {
    const wrapper = mount(CartLineItem, { props: { line } });
    expect(wrapper.text()).toContain("Burrata & Heirloom Tomato");
    expect(wrapper.text()).toContain("2");
    expect(wrapper.text()).toContain("$32.00");
  });

  it("emits setQuantity incremented when + is clicked", async () => {
    const wrapper = mount(CartLineItem, { props: { line } });
    await wrapper.find('[aria-label="Increase quantity"]').trigger("click");
    expect(wrapper.emitted("setQuantity")).toEqual([["1", 3]]);
  });

  it("emits setQuantity decremented when - is clicked", async () => {
    const wrapper = mount(CartLineItem, { props: { line } });
    await wrapper.find('[aria-label="Decrease quantity"]').trigger("click");
    expect(wrapper.emitted("setQuantity")).toEqual([["1", 1]]);
  });

  it("emits setQuantity with 0 when decrementing from quantity 1", async () => {
    const wrapper = mount(CartLineItem, { props: { line: { ...line, quantity: 1 } } });
    await wrapper.find('[aria-label="Decrease quantity"]').trigger("click");
    expect(wrapper.emitted("setQuantity")).toEqual([["1", 0]]);
  });

  describe("photo", () => {
    it("shows an image when the line has an imageUrl", () => {
      const lineWithPhoto = { ...line, imageUrl: "https://example.com/photo.jpg" };
      const wrapper = mount(CartLineItem, { props: { line: lineWithPhoto } });
      const img = wrapper.find("img.photo");
      expect(img.exists()).toBe(true);
      expect(img.attributes("src")).toBe("https://example.com/photo.jpg");
      expect(img.attributes("alt")).toBe(lineWithPhoto.name);
    });

    it("shows the placeholder when the line has no imageUrl", () => {
      const wrapper = mount(CartLineItem, { props: { line } });
      expect(wrapper.find("img.photo").exists()).toBe(false);
      expect(wrapper.find("div.photo").exists()).toBe(true);
    });

    it("falls back to the placeholder if the image fails to load", async () => {
      const lineWithPhoto = { ...line, imageUrl: "https://example.com/broken.jpg" };
      const wrapper = mount(CartLineItem, { props: { line: lineWithPhoto } });
      await wrapper.find("img.photo").trigger("error");
      expect(wrapper.find("img.photo").exists()).toBe(false);
      expect(wrapper.find("div.photo").exists()).toBe(true);
    });
  });
});
