import { describe, expect, it } from "vitest";
import type { MenuItemDTO } from "./index.js";

describe("MenuItemDTO", () => {
  it("shapes a menu item", () => {
    const item: MenuItemDTO = {
      id: "1",
      name: "Test Item",
      description: "A test item",
      priceCents: 100,
      category: "Test",
    };
    expect(item.priceCents).toBe(100);
  });
});
