import { describe, expect, it } from "vitest";
import { mount } from "@vue/test-utils";
import { createPinia, setActivePinia } from "pinia";
import { createTestRouter } from "../test/testRouter";
import AppHeader from "./AppHeader.vue";

async function mountHeader(path: string) {
  setActivePinia(createPinia());
  const router = createTestRouter();
  router.push(path);
  await router.isReady();
  return mount(AppHeader, { global: { plugins: [router] } });
}

describe("AppHeader", () => {
  it("links the Rewards nav item to /loyalty", async () => {
    const wrapper = await mountHeader("/");
    const rewardsLink = wrapper.get(".nav-links a.rewards-tab");
    expect(rewardsLink.attributes("href")).toBe("/loyalty");
  });

  it("marks the Rewards tab active when on the loyalty route", async () => {
    const wrapper = await mountHeader("/loyalty");
    const rewardsLink = wrapper.get("a.rewards-tab");
    expect(rewardsLink.classes()).toContain("router-link-active");
  });
});
