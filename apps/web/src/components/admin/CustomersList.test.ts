import { describe, expect, it } from "vitest";
import { mount } from "@vue/test-utils";
import CustomersList from "./CustomersList.vue";

const customers = [
  { name: "Jane Doe", phone: "+15551234567", pointsBalance: 120, lifetimeOrders: 4, lastOrderAt: "2026-07-20T17:30:00.000Z" },
  { name: "Guest", phone: "+15559998888", pointsBalance: 0, lifetimeOrders: 1, lastOrderAt: "2026-07-18T12:00:00.000Z" },
];

describe("CustomersList", () => {
  it("renders a row per customer with name, phone, points balance, lifetime orders, and last order date", () => {
    const wrapper = mount(CustomersList, { props: { customers, search: "", page: 1, totalPages: 1 } });
    const rows = wrapper.findAll("tbody tr");
    expect(rows).toHaveLength(2);
    expect(rows[0].text()).toContain("Jane Doe");
    expect(rows[0].text()).toContain("+15551234567");
    expect(rows[0].text()).toContain("120");
    expect(rows[0].text()).toContain("4");
  });

  it("emits update:search when the search input changes", async () => {
    const wrapper = mount(CustomersList, { props: { customers, search: "", page: 1, totalPages: 1 } });
    const input = wrapper.find('input[type="search"]');
    await input.setValue("jane");
    expect(wrapper.emitted("update:search")?.[0]).toEqual(["jane"]);
  });

  it("shows the page indicator and disables Prev on the first page", () => {
    const wrapper = mount(CustomersList, { props: { customers, search: "", page: 1, totalPages: 2 } });
    expect(wrapper.text()).toContain("Page 1 of 2");
    expect(wrapper.find("[data-testid='prev-page']").attributes("disabled")).toBeDefined();
    expect(wrapper.find("[data-testid='next-page']").attributes("disabled")).toBeUndefined();
  });

  it("disables Next on the last page and emits change-page when clicked", async () => {
    const wrapper = mount(CustomersList, { props: { customers, search: "", page: 2, totalPages: 2 } });
    expect(wrapper.find("[data-testid='next-page']").attributes("disabled")).toBeDefined();

    await wrapper.find("[data-testid='prev-page']").trigger("click");
    expect(wrapper.emitted("change-page")?.[0]).toEqual([1]);
  });
});
