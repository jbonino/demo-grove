import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { startTestDb, stopTestDb } from "../test/mongoMemory.js";
import { MenuItem } from "../models/MenuItem.js";
import { seedMenuItems } from "./menuItems.js";

beforeAll(startTestDb);
afterAll(stopTestDb);

describe("seedMenuItems", () => {
  it("populates 15-20 MenuItems across 3-4 categories, each fully fielded", async () => {
    await seedMenuItems();

    const items = await MenuItem.find();
    expect(items.length).toBeGreaterThanOrEqual(15);
    expect(items.length).toBeLessThanOrEqual(20);

    const categories = new Set(items.map((item) => item.category));
    expect(categories.size).toBeGreaterThanOrEqual(3);
    expect(categories.size).toBeLessThanOrEqual(4);

    for (const item of items) {
      expect(item.name).toBeTruthy();
      expect(item.description).toBeTruthy();
      expect(item.priceCents).toBeGreaterThan(0);
      expect(item.category).toBeTruthy();
    }
  });

  it("gives most items a well-formed https imageUrl", async () => {
    await seedMenuItems();

    const items = await MenuItem.find();
    const withImages = items.filter((item) => item.imageUrl);
    expect(withImages.length).toBeGreaterThanOrEqual(15);
    for (const item of withImages) {
      expect(item.imageUrl).toMatch(/^https:\/\//);
    }
  });

  it("resets rather than duplicates on re-run", async () => {
    await seedMenuItems();
    const firstCount = await MenuItem.countDocuments();

    await seedMenuItems();
    const secondCount = await MenuItem.countDocuments();

    expect(secondCount).toBe(firstCount);
  });
});
