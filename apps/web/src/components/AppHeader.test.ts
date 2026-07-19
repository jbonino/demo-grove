import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { mount } from "@vue/test-utils";
import { createPinia, setActivePinia } from "pinia";
import { createTestRouter } from "../test/testRouter";
import { useCartStore } from "../stores/cart";
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

  describe("cart pill pulse", () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it("pulses the cart pill when an item is added to the cart", async () => {
      const wrapper = await mountHeader("/");
      const cart = useCartStore();
      cart.addItem({ itemId: "1", name: "Salad", unitPrice: 1200 });
      await wrapper.vm.$nextTick();
      expect(wrapper.get(".cart-pill").classes()).toContain("is-pulsing");
    });

    it("stops pulsing after the pulse window elapses", async () => {
      const wrapper = await mountHeader("/");
      const cart = useCartStore();
      cart.addItem({ itemId: "1", name: "Salad", unitPrice: 1200 });
      await wrapper.vm.$nextTick();
      expect(wrapper.get(".cart-pill").classes()).toContain("is-pulsing");
      vi.advanceTimersByTime(400);
      await wrapper.vm.$nextTick();
      expect(wrapper.get(".cart-pill").classes()).not.toContain("is-pulsing");
    });

    it("does not pulse on initial mount", async () => {
      const wrapper = await mountHeader("/");
      expect(wrapper.get(".cart-pill").classes()).not.toContain("is-pulsing");
    });
  });
});
