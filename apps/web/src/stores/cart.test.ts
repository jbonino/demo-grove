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

  it("stores imageUrl on the line when provided", () => {
    const cart = useCartStore();
    cart.addItem({ itemId: "1", name: "Burrata", unitPrice: 1600, imageUrl: "https://example.com/burrata.jpg" });
    expect(cart.lines[0].imageUrl).toBe("https://example.com/burrata.jpg");
  });

  it("tracks total item count across distinct items", () => {
    const cart = useCartStore();
    cart.addItem({ itemId: "1", name: "Burrata", unitPrice: 1600 });
    cart.addItem({ itemId: "2", name: "Short Rib", unitPrice: 3400 });
    expect(cart.totalItemCount).toBe(2);
  });

  it("computes subtotal from line quantities and prices", () => {
    const cart = useCartStore();
    cart.addItem({ itemId: "1", name: "Burrata", unitPrice: 1600 });
    cart.addItem({ itemId: "2", name: "Short Rib", unitPrice: 3400 });
    cart.setQuantity("1", 2);
    expect(cart.subtotalCents).toBe(1600 * 2 + 3400);
  });

  it("updates a line's quantity via setQuantity", () => {
    const cart = useCartStore();
    cart.addItem({ itemId: "1", name: "Burrata", unitPrice: 1600 });
    cart.setQuantity("1", 5);
    expect(cart.lines[0].quantity).toBe(5);
  });

  it("removes the line when quantity is set to 0", () => {
    const cart = useCartStore();
    cart.addItem({ itemId: "1", name: "Burrata", unitPrice: 1600 });
    cart.setQuantity("1", 0);
    expect(cart.lines).toHaveLength(0);
  });

  it("clears all lines", () => {
    const cart = useCartStore();
    cart.addItem({ itemId: "1", name: "Burrata", unitPrice: 1600 });
    cart.clear();
    expect(cart.lines).toHaveLength(0);
  });
});
