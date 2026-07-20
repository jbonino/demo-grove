import { beforeEach, describe, expect, it } from "vitest";
import { mount } from "@vue/test-utils";
import { createPinia, setActivePinia } from "pinia";
import { createTestRouter } from "../test/testRouter";
import ReadmeView from "./ReadmeView.vue";

beforeEach(() => {
  setActivePinia(createPinia());
});

async function mountReadmeView() {
  const router = createTestRouter();
  router.push("/readme");
  await router.isReady();
  return mount(ReadmeView, { global: { plugins: [router] } });
}

describe("ReadmeView", () => {
  it("resolves at /readme", async () => {
    const router = createTestRouter();
    router.push("/readme");
    await router.isReady();
    expect(router.currentRoute.value.name).toBe("readme");
  });

  it("shows the project concept and stack", async () => {
    const wrapper = await mountReadmeView();

    expect(wrapper.text()).toContain("Grove");
    expect(wrapper.text()).toContain("loyalty");
    expect(wrapper.text()).toContain("Vue");
    expect(wrapper.text()).toContain("Express");
    expect(wrapper.text()).toContain("MongoDB");
    expect(wrapper.text()).toContain("Stripe");
  });

  it("scripts the customer walkthrough with a Stripe test card", async () => {
    const wrapper = await mountReadmeView();

    expect(wrapper.text()).toContain("4242 4242 4242 4242");
    expect(wrapper.text()).toContain("confirmation");
  });

  it("scripts the admin walkthrough covering dashboard, customers, and orders", async () => {
    const wrapper = await mountReadmeView();

    expect(wrapper.text()).toContain("/admin");
    expect(wrapper.text()).toContain("dashboard");
    expect(wrapper.text()).toContain("customers");
    expect(wrapper.text()).toContain("orders");
  });
});
