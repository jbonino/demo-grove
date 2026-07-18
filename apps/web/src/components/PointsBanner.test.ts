import { describe, expect, it } from "vitest";
import { mount } from "@vue/test-utils";
import PointsBanner from "./PointsBanner.vue";

describe("PointsBanner", () => {
  it("shows the balance and how many rewards it covers", () => {
    const wrapper = mount(PointsBanner, { props: { balance: 400, unlockedCount: 1 } });
    expect(wrapper.text()).toContain("400 points on file for this number");
    expect(wrapper.text()).toContain("enough for 1 reward");
  });

  it("pluralizes reward(s) when more than one is unlocked", () => {
    const wrapper = mount(PointsBanner, { props: { balance: 1000, unlockedCount: 2 } });
    expect(wrapper.text()).toContain("enough for 2 rewards");
  });
});
