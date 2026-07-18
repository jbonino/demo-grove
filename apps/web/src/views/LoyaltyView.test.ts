import { beforeEach, describe, expect, it, vi } from "vitest";
import { mount, flushPromises } from "@vue/test-utils";
import { createPinia, setActivePinia } from "pinia";
import { createTestRouter } from "../test/testRouter";
import * as loyaltyApi from "../api/loyalty";
import LoyaltyView from "./LoyaltyView.vue";

beforeEach(() => {
  setActivePinia(createPinia());
});

async function mountLoyaltyView() {
  const router = createTestRouter();
  router.push("/loyalty");
  await router.isReady();
  const wrapper = mount(LoyaltyView, { global: { plugins: [router] } });
  await flushPromises();
  return wrapper;
}

async function lookUp(wrapper: Awaited<ReturnType<typeof mountLoyaltyView>>, phone: string) {
  await wrapper.find('input[type="tel"]').setValue(phone);
  await wrapper.find(".lookup-button").trigger("click");
  await flushPromises();
}

describe("LoyaltyView", () => {
  it("shows balance, lifetime orders, rewards, and activity for a known phone", async () => {
    vi.spyOn(loyaltyApi, "fetchLoyaltyLookup").mockResolvedValue({
      pointsBalance: 400,
      lifetimeOrders: 3,
      availableRewards: [
        {
          id: "r1",
          name: "Free Flatbread",
          description: "desc",
          pointsCost: 300,
          discountAmountCents: 1200,
          unlocked: true,
          pointsNeeded: 0,
        },
      ],
      activity: [
        { orderId: "order1", date: "2026-06-01T12:00:00Z", pointsDelta: -296, note: "Redeemed Free Flatbread" },
      ],
    });

    const wrapper = await mountLoyaltyView();
    await lookUp(wrapper, "+15551234567");

    expect(wrapper.find(".points-balance .value").text()).toBe("400");
    expect(wrapper.find(".lifetime-orders .value").text()).toBe("3");
    expect(wrapper.text()).toContain("Free Flatbread");
    expect(wrapper.text()).toContain("Redeemed Free Flatbread");
  });

  it("renders the reward list read-only, with no radio selector", async () => {
    vi.spyOn(loyaltyApi, "fetchLoyaltyLookup").mockResolvedValue({
      pointsBalance: 100,
      lifetimeOrders: 1,
      availableRewards: [
        {
          id: "r1",
          name: "$25 off",
          description: "desc",
          pointsCost: 900,
          discountAmountCents: 2500,
          unlocked: false,
          pointsNeeded: 800,
        },
      ],
      activity: [],
    });

    const wrapper = await mountLoyaltyView();
    await lookUp(wrapper, "+15551234567");

    expect(wrapper.find(".radio").exists()).toBe(false);
    expect(wrapper.text()).toContain("need 800 more");
    expect(wrapper.text()).toContain("Locked");
  });

  it("shows a not-found message for a phone with no history", async () => {
    vi.spyOn(loyaltyApi, "fetchLoyaltyLookup").mockResolvedValue(null);

    const wrapper = await mountLoyaltyView();
    await lookUp(wrapper, "+15550000000");

    expect(wrapper.text()).toContain("No rewards history found for this number");
    expect(wrapper.find(".points-balance").exists()).toBe(false);
  });
});
