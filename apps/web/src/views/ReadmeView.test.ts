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

  it("gives the admin password so the walkthrough is self-serve", async () => {
    const wrapper = await mountReadmeView();

    expect(wrapper.text()).toContain("grove");
  });

  it("describes the agentic, single-day build process and model usage", async () => {
    const wrapper = await mountReadmeView();

    expect(wrapper.text()).toContain("single work day");
    expect(wrapper.text()).toContain("agentically");
    expect(wrapper.text()).toContain("Haiku");
    expect(wrapper.text()).toContain("Sonnet");
    expect(wrapper.text()).toContain("low usage");
    expect(wrapper.text()).toContain("claude.ai/design");
    expect(wrapper.html()).toContain("github.com/obra/superpowers");
  });

  it("describes the docs folder structure", async () => {
    const wrapper = await mountReadmeView();

    expect(wrapper.text()).toContain("docs/design.md");
    expect(wrapper.text()).toContain("docs/product-roadmap.md");
    expect(wrapper.text()).toContain("docs/architecture.md");
    expect(wrapper.text()).toContain("docs/backlog/");
    expect(wrapper.text()).toContain("docs/done/");
    expect(wrapper.text()).toContain("docs/retros/");
  });

  it("links walkthrough paths to the real in-app routes", async () => {
    const wrapper = await mountReadmeView();

    const hrefs = wrapper.findAll("a.path-link").map((a) => a.attributes("href"));
    expect(hrefs).toContain("/checkout");
    expect(hrefs).toContain("/loyalty");
    expect(hrefs).toContain("/admin");
    expect(hrefs).toContain("/admin/customers");
    expect(hrefs).toContain("/admin/orders");
  });

  it("summarizes test coverage, including Playwright E2E", async () => {
    const wrapper = await mountReadmeView();

    expect(wrapper.text()).toContain("Vitest");
    expect(wrapper.text()).toContain("Playwright");
    expect(wrapper.text()).toContain("apps/api");
    expect(wrapper.text()).toContain("apps/web");
  });

  it("shows contact info and no Owner.com references", async () => {
    const wrapper = await mountReadmeView();

    expect(wrapper.find('a[href="mailto:jbonino@protonmail.com"]').exists()).toBe(true);
    expect(wrapper.text()).not.toContain("Owner.com");
  });
});
