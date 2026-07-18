import { describe, expect, it } from "vitest";
import { mount } from "@vue/test-utils";
import LoyaltyActivityList from "./LoyaltyActivityList.vue";

const activity = [
  {
    orderId: "order1",
    date: "2026-06-01T12:00:00Z",
    pointsDelta: -296,
    note: "Redeemed Free Flatbread",
  },
  {
    orderId: null,
    date: "2026-05-01T12:00:00Z",
    pointsDelta: 696,
    note: null,
  },
];

describe("LoyaltyActivityList", () => {
  it("renders each activity row with order id, points delta, and note", () => {
    const wrapper = mount(LoyaltyActivityList, { props: { activity } });

    const rows = wrapper.findAll(".activity-row");
    expect(rows).toHaveLength(2);
    expect(rows[0].text()).toContain("Order #order1");
    expect(rows[0].text()).toContain("-296 pts");
    expect(rows[0].text()).toContain("Redeemed Free Flatbread");
    expect(rows[1].text()).toContain("+696 pts");
  });

  it("omits the note when none is present", () => {
    const wrapper = mount(LoyaltyActivityList, { props: { activity } });
    expect(wrapper.findAll(".activity-row")[1].find(".note").exists()).toBe(false);
  });
});
