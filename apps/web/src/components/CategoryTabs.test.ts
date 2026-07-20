import { describe, expect, it } from "vitest";
import { mount } from "@vue/test-utils";
import CategoryTabs from "./CategoryTabs.vue";

describe("CategoryTabs", () => {
  it("marks the active category and emits select on click", async () => {
    const wrapper = mount(CategoryTabs, {
      props: { categories: ["Starters", "Entrées"], activeCategory: "Starters" },
    });

    const tabs = wrapper.findAll(".tab");
    expect(tabs[1].classes()).toContain("active");
    expect(tabs[2].classes()).not.toContain("active");

    await tabs[2].trigger("click");

    expect(wrapper.emitted("select")).toEqual([["Entrées"]]);
  });

  it("renders an All tab before the given categories", () => {
    const wrapper = mount(CategoryTabs, {
      props: { categories: ["Starters", "Entrées"], activeCategory: "All" },
    });

    const tabs = wrapper.findAll(".tab");
    expect(tabs.map((tab) => tab.text())).toEqual(["All", "Starters", "Entrées"]);
    expect(tabs[0].classes()).toContain("active");
  });

  it("emits select with 'All' when the All tab is clicked", async () => {
    const wrapper = mount(CategoryTabs, {
      props: { categories: ["Starters", "Entrées"], activeCategory: "Starters" },
    });

    await wrapper.findAll(".tab")[0].trigger("click");

    expect(wrapper.emitted("select")).toEqual([["All"]]);
  });
});
