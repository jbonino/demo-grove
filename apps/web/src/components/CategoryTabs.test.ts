import { describe, expect, it } from "vitest";
import { mount } from "@vue/test-utils";
import CategoryTabs from "./CategoryTabs.vue";

describe("CategoryTabs", () => {
  it("marks the active category and emits select on click", async () => {
    const wrapper = mount(CategoryTabs, {
      props: { categories: ["Starters", "Entrées"], activeCategory: "Starters" },
    });

    const tabs = wrapper.findAll(".tab");
    expect(tabs[0].classes()).toContain("active");
    expect(tabs[1].classes()).not.toContain("active");

    await tabs[1].trigger("click");

    expect(wrapper.emitted("select")).toEqual([["Entrées"]]);
  });
});
