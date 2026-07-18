import { beforeEach, describe, expect, it, vi } from "vitest";
import { mount, flushPromises } from "@vue/test-utils";
import { createPinia, setActivePinia } from "pinia";
import { useCartStore } from "../stores/cart";
import { createTestRouter } from "../test/testRouter";
import * as ordersApi from "../api/orders";
import CheckoutView from "./CheckoutView.vue";

const confirmCardPayment = vi.hoisted(() => vi.fn());

vi.mock("../stripeClient", () => ({
  getStripe: () =>
    Promise.resolve({
      elements: () => ({ create: () => ({ mount: vi.fn(), unmount: vi.fn() }) }),
      confirmCardPayment,
    }),
}));

beforeEach(() => {
  setActivePinia(createPinia());
  confirmCardPayment.mockReset();
});

async function mountCheckoutView() {
  const cart = useCartStore();
  cart.addItem({ itemId: "1", name: "Burrata & Heirloom Tomato", unitPrice: 1600 });

  const router = createTestRouter();
  router.push("/checkout");
  await router.isReady();

  const wrapper = mount(CheckoutView, { global: { plugins: [router] } });
  await flushPromises();
  return { wrapper, router, cart };
}

describe("CheckoutView", () => {
  it("shows a time picker only when Schedule for later is selected", async () => {
    const { wrapper } = await mountCheckoutView();
    expect(wrapper.find('input[type="time"]').exists()).toBe(false);

    await wrapper.findAll(".pill")[1].trigger("click");
    expect(wrapper.find('input[type="time"]').exists()).toBe(true);
  });

  it("shows a validation error when name/phone are missing", async () => {
    const { wrapper } = await mountCheckoutView();
    await wrapper.find(".cta").trigger("click");
    await flushPromises();
    expect(wrapper.text()).toContain("Please enter your name and phone number.");
  });

  it("shows an error and stays on Checkout when payment fails", async () => {
    vi.spyOn(ordersApi, "createOrder").mockResolvedValue({
      clientSecret: "pi_test_secret",
      paymentIntentId: "pi_test",
      subtotalCents: 1600,
    });
    confirmCardPayment.mockResolvedValue({ error: { message: "Your card was declined." } });

    const { wrapper, router } = await mountCheckoutView();
    await wrapper.find('input[type="text"]').setValue("Jane Doe");
    await wrapper.find('input[type="tel"]').setValue("+15551234567");
    await wrapper.find(".cta").trigger("click");
    await flushPromises();

    expect(wrapper.text()).toContain("Your card was declined.");
    expect(router.currentRoute.value.name).toBe("checkout");
  });

  it("clears the cart and navigates to Confirmation on successful payment", async () => {
    vi.spyOn(ordersApi, "createOrder").mockResolvedValue({
      clientSecret: "pi_test_secret",
      paymentIntentId: "pi_test",
      subtotalCents: 1600,
    });
    confirmCardPayment.mockResolvedValue({ paymentIntent: { status: "succeeded" } });
    vi.spyOn(ordersApi, "pollForOrder").mockResolvedValue({
      id: "order1",
      subtotalCents: 1600,
      phone: "+15551234567",
      pickup: { mode: "asap", time: null },
      status: "paid",
      createdAt: new Date().toISOString(),
    });

    const { wrapper, router, cart } = await mountCheckoutView();
    await wrapper.find('input[type="text"]').setValue("Jane Doe");
    await wrapper.find('input[type="tel"]').setValue("+15551234567");
    await wrapper.find(".cta").trigger("click");
    await flushPromises();

    expect(cart.lines).toHaveLength(0);
    expect(router.currentRoute.value.name).toBe("confirmation");
    expect(router.currentRoute.value.params.paymentIntentId).toBe("pi_test");
  });
});
