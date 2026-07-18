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
});
