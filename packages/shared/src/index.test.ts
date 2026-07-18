import { describe, expect, it } from "vitest";
import type { MenuItemDTO, RewardDTO } from "./index.js";

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

describe("RewardDTO", () => {
  it("shapes a reward", () => {
    const reward: RewardDTO = {
      id: "1",
      name: "Free Flatbread",
      description: "A free flatbread with any order",
      pointsCost: 300,
      discountAmountCents: 1200,
    };
    expect(reward.pointsCost).toBe(300);
  });
});
