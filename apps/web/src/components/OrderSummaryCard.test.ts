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
