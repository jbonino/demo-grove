import { beforeEach, describe, expect, it } from "vitest";
import { createPinia, setActivePinia } from "pinia";
import { useCartStore } from "./cart";

beforeEach(() => {
  setActivePinia(createPinia());
});

describe("cart store", () => {
  it("adds a new item as a line with quantity 1", () => {
    const cart = useCartStore();
    cart.addItem({ itemId: "1", name: "Burrata", unitPrice: 1600 });
    expect(cart.lines).toHaveLength(1);
    expect(cart.totalItemCount).toBe(1);
  });

  it("increments quantity when adding the same item again", () => {
    const cart = useCartStore();
    cart.addItem({ itemId: "1", name: "Burrata", unitPrice: 1600 });
    cart.addItem({ itemId: "1", name: "Burrata", unitPrice: 1600 });
    expect(cart.lines).toHaveLength(1);
    expect(cart.lines[0].quantity).toBe(2);
    expect(cart.totalItemCount).toBe(2);
  });

  it("tracks total item count across distinct items", () => {
    const cart = useCartStore();
    cart.addItem({ itemId: "1", name: "Burrata", unitPrice: 1600 });
    cart.addItem({ itemId: "2", name: "Short Rib", unitPrice: 3400 });
    expect(cart.totalItemCount).toBe(2);
  });
});
