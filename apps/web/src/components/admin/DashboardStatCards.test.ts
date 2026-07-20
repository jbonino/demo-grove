import { describe, expect, it } from "vitest";
import { mount } from "@vue/test-utils";
import DashboardStatCards from "./DashboardStatCards.vue";

const stats = {
  ordersToday: 12,
  ordersTodayDelta: 3,
  revenueTodayCents: 45600,
  revenueTodayDeltaCents: -1200,
  pointsIssued7d: 980,
  pointsRedeemed7d: 4,
  signups7d: 6,
  ordersOutOf7d: 42,
  recentOrders: [],
};

describe("DashboardStatCards", () => {
  it("renders Orders Today with its delta vs yesterday", () => {
    const wrapper = mount(DashboardStatCards, { props: { stats } });
    expect(wrapper.text()).toContain("Orders Today");
    expect(wrapper.text()).toContain("12");
    expect(wrapper.text()).toContain("+3");
  });

  it("renders Revenue Today in dollars with a signed delta", () => {
    const wrapper = mount(DashboardStatCards, { props: { stats } });
    expect(wrapper.text()).toContain("Revenue Today");
    expect(wrapper.text()).toContain("$456.00");
    expect(wrapper.text()).toContain("-$12.00");
  });

  it("renders Points Issued 7d with the redeemed count", () => {
    const wrapper = mount(DashboardStatCards, { props: { stats } });
    expect(wrapper.text()).toContain("Points Issued");
    expect(wrapper.text()).toContain("980");
    expect(wrapper.text()).toContain("4 redeemed");
  });

  it("renders New Loyalty Signups 7d with the 'of N orders' context", () => {
    const wrapper = mount(DashboardStatCards, { props: { stats } });
    expect(wrapper.text()).toContain("New Loyalty Signups");
    expect(wrapper.text()).toContain("6");
    expect(wrapper.text()).toContain("of 42 orders");
  });
});
