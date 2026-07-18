import { describe, expect, it } from "vitest";
import { mount } from "@vue/test-utils";
import PointsEarnedPill from "./PointsEarnedPill.vue";

describe("PointsEarnedPill", () => {
  it("shows the points earned on this order and the resulting balance", () => {
    const wrapper = mount(PointsEarnedPill, { props: { pointsEarned: 38, balance: 462 } });
    expect(wrapper.text()).toContain("+38 points earned");
    expect(wrapper.text()).toContain("462 points balance now");
  });
});
