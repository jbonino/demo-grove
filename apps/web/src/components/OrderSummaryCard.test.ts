import { describe, expect, it } from "vitest";
import { mount } from "@vue/test-utils";
import OrderSummaryCard from "./OrderSummaryCard.vue";

describe("OrderSummaryCard", () => {
  it("shows subtotal and total from subtotalCents", () => {
    const wrapper = mount(OrderSummaryCard, {
      props: { subtotalCents: 3200, ctaLabel: "Go to Checkout" },
    });
    expect(wrapper.text()).toContain("$32.00");
    expect(wrapper.text()).toContain("Go to Checkout");
  });

  it("shows the promo field only when showPromo is true", () => {
    const withPromo = mount(OrderSummaryCard, {
      props: { subtotalCents: 1000, ctaLabel: "Go to Checkout", showPromo: true },
    });
    expect(withPromo.find(".promo").exists()).toBe(true);

    const withoutPromo = mount(OrderSummaryCard, {
      props: { subtotalCents: 1000, ctaLabel: "Place Order" },
    });
    expect(withoutPromo.find(".promo").exists()).toBe(false);
  });

  it("renders itemized lines when provided", () => {
    const wrapper = mount(OrderSummaryCard, {
      props: {
        subtotalCents: 3200,
        ctaLabel: "Place Order",
        itemized: [{ name: "Burrata", quantity: 2, unitPrice: 1600 }],
      },
    });
    expect(wrapper.text()).toContain("2× Burrata");
  });

  it("shows a reward discount line and reduced total when redeemedReward is set", () => {
    const wrapper = mount(OrderSummaryCard, {
      props: {
        subtotalCents: 3800,
        ctaLabel: "Place Order",
        redeemedReward: { name: "$10 off", discountAmountCents: 1000 },
      },
    });
    expect(wrapper.text()).toContain("Reward: $10 off");
    expect(wrapper.text()).toContain("-$10.00");
    expect(wrapper.find(".row.total").text()).toContain("$28.00");
  });

  it("does not show a reward discount line when no reward is redeemed", () => {
    const wrapper = mount(OrderSummaryCard, {
      props: { subtotalCents: 3800, ctaLabel: "Place Order" },
    });
    expect(wrapper.find(".reward-discount").exists()).toBe(false);
    expect(wrapper.find(".row.total").text()).toContain("$38.00");
  });

  it("shows a points-earned estimate when earnEstimatePoints is set", () => {
    const wrapper = mount(OrderSummaryCard, {
      props: { subtotalCents: 3800, ctaLabel: "Place Order", earnEstimatePoints: 38 },
    });
    expect(wrapper.text()).toContain("You'll earn +38 pts");
  });

  it("emits cta when the button is clicked, and respects ctaDisabled", async () => {
    const wrapper = mount(OrderSummaryCard, {
      props: { subtotalCents: 1000, ctaLabel: "Place Order" },
    });
    await wrapper.find(".cta").trigger("click");
    expect(wrapper.emitted("cta")).toHaveLength(1);

    const disabled = mount(OrderSummaryCard, {
      props: { subtotalCents: 1000, ctaLabel: "Place Order", ctaDisabled: true },
    });
    expect(disabled.find(".cta").attributes("disabled")).toBeDefined();
  });
});
