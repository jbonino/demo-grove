import { describe, expect, it, vi } from "vitest";
import { mount, flushPromises } from "@vue/test-utils";
import { createPinia } from "pinia";
import * as ordersApi from "../api/orders";
import { createTestRouter } from "../test/testRouter";
import ConfirmationView from "./ConfirmationView.vue";

async function mountConfirmationView(query = "") {
  const router = createTestRouter();
  router.push(`/confirmation/pi_test_123${query}`);
  await router.isReady();
  const wrapper = mount(ConfirmationView, { global: { plugins: [createPinia(), router] } });
  await flushPromises();
  return wrapper;
}

describe("ConfirmationView", () => {
  it("shows pickup time, total, and rewards, and no View Order History button", async () => {
    vi.spyOn(ordersApi, "fetchOrderByPaymentIntent").mockResolvedValue({
      id: "abc123def456",
      subtotalCents: 3200,
      phone: "+15551234567",
      pickup: { mode: "asap", time: null },
      status: "paid",
      rewardRedeemed: null,
      pointsEarned: 32,
      pointsBalanceAfter: 32,
      createdAt: new Date().toISOString(),
    });

    const wrapper = await mountConfirmationView();

    expect(wrapper.text()).toContain("ASAP");
    expect(wrapper.text()).toContain("$32.00");
    expect(wrapper.text()).toContain("You're all set");
    expect(wrapper.text()).not.toContain("View Order History");
  });

  it("personalizes the heading with the name query param", async () => {
    vi.spyOn(ordersApi, "fetchOrderByPaymentIntent").mockResolvedValue({
      id: "abc123def456",
      subtotalCents: 3200,
      phone: "+15551234567",
      pickup: { mode: "asap", time: null },
      status: "paid",
      rewardRedeemed: null,
      pointsEarned: 32,
      pointsBalanceAfter: 32,
      createdAt: new Date().toISOString(),
    });

    const wrapper = await mountConfirmationView("?name=Jane");
    expect(wrapper.text()).toContain("You're all set, Jane");
  });

  it("navigates back to the Menu when Back to Menu is clicked", async () => {
    vi.spyOn(ordersApi, "fetchOrderByPaymentIntent").mockResolvedValue({
      id: "abc123def456",
      subtotalCents: 3200,
      phone: "+15551234567",
      pickup: { mode: "asap", time: null },
      status: "paid",
      rewardRedeemed: null,
      pointsEarned: 32,
      pointsBalanceAfter: 32,
      createdAt: new Date().toISOString(),
    });

    const wrapper = await mountConfirmationView();
    expect(wrapper.find(".back-button").text()).toBe("Back to Menu");
    expect(wrapper.find(".back-button").attributes("href")).toBe("/");
  });

  it("shows a points-earned pill and no Reward Used stat when no reward was redeemed", async () => {
    vi.spyOn(ordersApi, "fetchOrderByPaymentIntent").mockResolvedValue({
      id: "abc123def456",
      subtotalCents: 3200,
      phone: "+15551234567",
      pickup: { mode: "asap", time: null },
      status: "paid",
      rewardRedeemed: null,
      pointsEarned: 32,
      pointsBalanceAfter: 432,
      createdAt: new Date().toISOString(),
    });

    const wrapper = await mountConfirmationView();

    expect(wrapper.text()).toContain("+32 points earned");
    expect(wrapper.text()).toContain("432 points balance now");
    expect(wrapper.text()).not.toContain("Reward Used");
  });

  it("shows the Reward Used stat when a reward was redeemed", async () => {
    vi.spyOn(ordersApi, "fetchOrderByPaymentIntent").mockResolvedValue({
      id: "abc123def456",
      subtotalCents: 2200,
      phone: "+15551234567",
      pickup: { mode: "asap", time: null },
      status: "paid",
      rewardRedeemed: { name: "$10 off", discountAmountCents: 1000 },
      pointsEarned: 22,
      pointsBalanceAfter: 122,
      createdAt: new Date().toISOString(),
    });

    const wrapper = await mountConfirmationView();

    expect(wrapper.text()).toContain("Reward Used");
    expect(wrapper.text()).toContain("$10 off");
  });

  it("shows the discounted total actually charged, not the pre-discount subtotal", async () => {
    vi.spyOn(ordersApi, "fetchOrderByPaymentIntent").mockResolvedValue({
      id: "abc123def456",
      subtotalCents: 2400,
      phone: "+15551234567",
      pickup: { mode: "asap", time: null },
      status: "paid",
      rewardRedeemed: { name: "Free Flatbread", discountAmountCents: 1200 },
      pointsEarned: 12,
      pointsBalanceAfter: 112,
      createdAt: new Date().toISOString(),
    });

    const wrapper = await mountConfirmationView();

    expect(wrapper.text()).toContain("$12.00");
    expect(wrapper.text()).not.toContain("$24.00");
  });

  it("navigates to /loyalty when Check My Rewards is clicked", async () => {
    vi.spyOn(ordersApi, "fetchOrderByPaymentIntent").mockResolvedValue({
      id: "abc123def456",
      subtotalCents: 3200,
      phone: "+15551234567",
      pickup: { mode: "asap", time: null },
      status: "paid",
      rewardRedeemed: null,
      pointsEarned: 32,
      pointsBalanceAfter: 32,
      createdAt: new Date().toISOString(),
    });

    const wrapper = await mountConfirmationView();
    const link = wrapper.find(".rewards-link");
    expect(link.text()).toBe("Check My Rewards");
    expect(link.attributes("href")).toBe("/loyalty");
  });
});
