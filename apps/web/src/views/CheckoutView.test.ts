import { beforeEach, describe, expect, it, vi } from "vitest";
import { mount, flushPromises } from "@vue/test-utils";
import { createPinia, setActivePinia } from "pinia";
import { useCartStore } from "../stores/cart";
import { createTestRouter } from "../test/testRouter";
import * as ordersApi from "../api/orders";
import * as rewardsApi from "../api/rewards";
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

  it("shows a validation error when phone is missing", async () => {
    const { wrapper } = await mountCheckoutView();
    await wrapper.find(".cta").trigger("click");
    await flushPromises();
    expect(wrapper.text()).toContain("Please enter your phone number.");
  });

  it("allows placing an order with no name entered", async () => {
    const createOrderSpy = vi.spyOn(ordersApi, "createOrder").mockResolvedValue({
      clientSecret: "pi_test_secret",
      paymentIntentId: "pi_test",
      subtotalCents: 1600,
      discountedSubtotalCents: 1600,
    });
    confirmCardPayment.mockResolvedValue({ paymentIntent: { status: "succeeded" } });
    vi.spyOn(ordersApi, "pollForOrder").mockResolvedValue({
      id: "order1",
      subtotalCents: 1600,
      phone: "+15551234567",
      pickup: { mode: "asap", time: null },
      status: "paid",
      rewardRedeemed: null,
      pointsEarned: 16,
      pointsBalanceAfter: 16,
      createdAt: new Date().toISOString(),
    });

    const { wrapper, router } = await mountCheckoutView();
    await wrapper.find('input[type="tel"]').setValue("+15551234567");
    await wrapper.find(".cta").trigger("click");
    await flushPromises();

    expect(router.currentRoute.value.name).toBe("confirmation");
    expect(createOrderSpy).toHaveBeenCalledWith(expect.objectContaining({ name: "" }));
  });

  it("shows an error and stays on Checkout when payment fails", async () => {
    vi.spyOn(ordersApi, "createOrder").mockResolvedValue({
      clientSecret: "pi_test_secret",
      paymentIntentId: "pi_test",
      subtotalCents: 1600,
      discountedSubtotalCents: 1600,
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
    const createOrderSpy = vi.spyOn(ordersApi, "createOrder").mockResolvedValue({
      clientSecret: "pi_test_secret",
      paymentIntentId: "pi_test",
      subtotalCents: 1600,
      discountedSubtotalCents: 1600,
    });
    confirmCardPayment.mockResolvedValue({ paymentIntent: { status: "succeeded" } });
    vi.spyOn(ordersApi, "pollForOrder").mockResolvedValue({
      id: "order1",
      subtotalCents: 1600,
      phone: "+15551234567",
      pickup: { mode: "asap", time: null },
      status: "paid",
      rewardRedeemed: null,
      pointsEarned: 16,
      pointsBalanceAfter: 16,
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
    expect(createOrderSpy).toHaveBeenCalledWith(expect.objectContaining({ name: "Jane Doe" }));
  });
});

describe("CheckoutView — rewards", () => {
  const unlockedRewards = [
    {
      id: "r1",
      name: "$10 off",
      description: "desc",
      pointsCost: 300,
      discountAmountCents: 1000,
      unlocked: true,
      pointsNeeded: 0,
    },
    {
      id: "r2",
      name: "$25 off",
      description: "desc",
      pointsCost: 900,
      discountAmountCents: 2500,
      unlocked: false,
      pointsNeeded: 500,
    },
  ];

  it("shows a points banner once a phone with a positive balance is entered", async () => {
    vi.spyOn(rewardsApi, "fetchRewardsForPhone").mockResolvedValue({ balance: 400, rewards: unlockedRewards });

    const { wrapper } = await mountCheckoutView();
    await wrapper.find('input[type="tel"]').setValue("+15551234567");
    await wrapper.find('input[type="tel"]').trigger("blur");
    await flushPromises();

    expect(wrapper.text()).toContain("400 points on file for this number");
    expect(wrapper.text()).toContain("$10 off");
  });

  it("does not show a points banner when the phone has no points", async () => {
    vi.spyOn(rewardsApi, "fetchRewardsForPhone").mockResolvedValue({ balance: 0, rewards: [] });

    const { wrapper } = await mountCheckoutView();
    await wrapper.find('input[type="tel"]').setValue("+15551110000");
    await wrapper.find('input[type="tel"]').trigger("blur");
    await flushPromises();

    expect(wrapper.text()).not.toContain("points on file for this number");
  });

  it("updates the order summary discount and total when an available reward is selected", async () => {
    vi.spyOn(rewardsApi, "fetchRewardsForPhone").mockResolvedValue({ balance: 400, rewards: unlockedRewards });

    const { wrapper } = await mountCheckoutView();
    await wrapper.find('input[type="tel"]').setValue("+15551234567");
    await wrapper.find('input[type="tel"]').trigger("blur");
    await flushPromises();

    await wrapper.findAll(".reward-row")[0].trigger("click");

    expect(wrapper.text()).toContain("Reward: $10 off");
    expect(wrapper.find(".row.total").text()).toContain("$6.00");
  });

  it("passes the selected rewardId when placing an order", async () => {
    vi.spyOn(rewardsApi, "fetchRewardsForPhone").mockResolvedValue({ balance: 400, rewards: unlockedRewards });
    const createOrderSpy = vi.spyOn(ordersApi, "createOrder").mockResolvedValue({
      clientSecret: "pi_test_secret",
      paymentIntentId: "pi_test",
      subtotalCents: 1600,
      discountedSubtotalCents: 600,
    });
    confirmCardPayment.mockResolvedValue({ paymentIntent: { status: "succeeded" } });
    vi.spyOn(ordersApi, "pollForOrder").mockResolvedValue({
      id: "order1",
      subtotalCents: 1600,
      phone: "+15551234567",
      pickup: { mode: "asap", time: null },
      status: "paid",
      rewardRedeemed: { name: "$10 off", discountAmountCents: 1000 },
      pointsEarned: 6,
      pointsBalanceAfter: 106,
      createdAt: new Date().toISOString(),
    });

    const { wrapper } = await mountCheckoutView();
    await wrapper.find('input[type="text"]').setValue("Jane Doe");
    await wrapper.find('input[type="tel"]').setValue("+15551234567");
    await wrapper.find('input[type="tel"]').trigger("blur");
    await flushPromises();
    await wrapper.findAll(".reward-row")[0].trigger("click");

    await wrapper.find(".cta").trigger("click");
    await flushPromises();

    expect(createOrderSpy).toHaveBeenCalledWith(expect.objectContaining({ rewardId: "r1" }));
  });
});
