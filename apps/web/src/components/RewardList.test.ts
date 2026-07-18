import { describe, expect, it } from "vitest";
import { mount } from "@vue/test-utils";
import RewardList from "./RewardList.vue";

const rewards = [
  {
    id: "r1",
    name: "Free Flatbread",
    description: "desc",
    pointsCost: 300,
    discountAmountCents: 1200,
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

describe("RewardList", () => {
  it("renders available rewards as selectable and locked rewards as not selectable", () => {
    const wrapper = mount(RewardList, { props: { rewards, selectedId: null } });

    const rows = wrapper.findAll(".reward-row");
    expect(rows).toHaveLength(2);
    expect(rows[0].classes()).not.toContain("locked");
    expect(rows[1].classes()).toContain("locked");
    expect(rows[1].text()).toContain("need 500 more");
    expect(rows[1].text()).toContain("Locked");
  });

  it("emits select when an unlocked row is clicked", async () => {
    const wrapper = mount(RewardList, { props: { rewards, selectedId: null } });
    await wrapper.findAll(".reward-row")[0].trigger("click");
    expect(wrapper.emitted("select")?.[0]).toEqual(["r1"]);
  });

  it("does not emit select when a locked row is clicked", async () => {
    const wrapper = mount(RewardList, { props: { rewards, selectedId: null } });
    await wrapper.findAll(".reward-row")[1].trigger("click");
    expect(wrapper.emitted("select")).toBeUndefined();
  });

  it("marks the selected reward's row as selected", () => {
    const wrapper = mount(RewardList, { props: { rewards, selectedId: "r1" } });
    expect(wrapper.findAll(".reward-row")[0].classes()).toContain("selected");
  });
});
