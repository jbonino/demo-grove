import { beforeEach, describe, expect, it } from "vitest";
import { mount, flushPromises } from "@vue/test-utils";
import { createPinia, setActivePinia } from "pinia";
import { useCartStore } from "../stores/cart";
import { createTestRouter } from "../test/testRouter";
import CartView from "./CartView.vue";

beforeEach(() => {
  setActivePinia(createPinia());
});

async function mountCartView() {
  const router = createTestRouter();
  router.push("/cart");
  await router.isReady();
  return { wrapper: mount(CartView, { global: { plugins: [router] } }), router };
}

describe("CartView", () => {
  it("shows an empty-cart message and a link back to the menu when the cart has no items", async () => {
    const { wrapper } = await mountCartView();
    expect(wrapper.text()).toContain("Your cart is empty");
    expect(wrapper.find('a[href="/"]').exists()).toBe(true);
  });

  it("shows line items and the order summary total when the cart has items", async () => {
    const cart = useCartStore();
    cart.addItem({ itemId: "1", name: "Burrata & Heirloom Tomato", unitPrice: 1600 });
    cart.addItem({ itemId: "2", name: "Short Rib", unitPrice: 3400 });

    const { wrapper } = await mountCartView();

    expect(wrapper.text()).toContain("Burrata & Heirloom Tomato");
    expect(wrapper.text()).toContain("Short Rib");
    expect(wrapper.text()).toContain("$50.00");
  });

  it("updates quantity and total when the stepper is used, and removes the line at 0", async () => {
    const cart = useCartStore();
    cart.addItem({ itemId: "1", name: "Burrata & Heirloom Tomato", unitPrice: 1600 });

    const { wrapper } = await mountCartView();

    await wrapper.find('[aria-label="Increase quantity"]').trigger("click");
    expect(wrapper.text()).toContain("$32.00");

    await wrapper.find('[aria-label="Decrease quantity"]').trigger("click");
    await wrapper.find('[aria-label="Decrease quantity"]').trigger("click");
    expect(wrapper.text()).toContain("Your cart is empty");
  });

  it("navigates to /checkout when Go to Checkout is clicked", async () => {
    const cart = useCartStore();
    cart.addItem({ itemId: "1", name: "Burrata & Heirloom Tomato", unitPrice: 1600 });

    const { wrapper, router } = await mountCartView();
    await wrapper.find(".cta").trigger("click");
    await flushPromises();

    expect(router.currentRoute.value.name).toBe("checkout");
  });
});
