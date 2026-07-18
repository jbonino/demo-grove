import { describe, expect, it } from "vitest";
import { mount } from "@vue/test-utils";
import LoyaltyStatCards from "./LoyaltyStatCards.vue";

describe("LoyaltyStatCards", () => {
  it("renders the points balance and lifetime order count", () => {
    const wrapper = mount(LoyaltyStatCards, { props: { pointsBalance: 400, lifetimeOrders: 7 } });

    expect(wrapper.find(".points-balance .value").text()).toBe("400");
    expect(wrapper.find(".lifetime-orders .value").text()).toBe("7");
  });
});
