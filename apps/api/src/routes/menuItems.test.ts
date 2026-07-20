import { afterAll, beforeAll, describe, expect, it } from "vitest";
import request from "supertest";
import { startTestDb, stopTestDb } from "../test/mongoMemory.js";
import { MenuItem } from "../models/MenuItem.js";
import { createApp } from "../app.js";

beforeAll(startTestDb);
afterAll(stopTestDb);

describe("GET /api/menu-items", () => {
  it("returns seeded menu items as DTOs", async () => {
    await MenuItem.create([
      { name: "Burrata & Heirloom Tomato", description: "desc", priceCents: 1600, category: "Starters" },
      { name: "Braised Short Rib", description: "desc", priceCents: 3400, category: "Entrées" },
    ]);

    const res = await request(createApp()).get("/api/menu-items");

    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(2);
    expect(res.body[0]).toMatchObject({
      name: expect.any(String),
      description: expect.any(String),
      priceCents: expect.any(Number),
      category: expect.any(String),
    });
    expect(res.body[0].id).toBeTruthy();
  });

  it("orders items by the menu's category flow, not alphabetically", async () => {
    await MenuItem.deleteMany({});
    await MenuItem.create([
      { name: "Crème Brûlée", description: "desc", priceCents: 1100, category: "Desserts" },
      { name: "Charred Brussels Sprouts", description: "desc", priceCents: 850, category: "Sides" },
      { name: "Braised Short Rib", description: "desc", priceCents: 3400, category: "Entrées" },
      { name: "Burrata & Heirloom Tomato", description: "desc", priceCents: 1600, category: "Starters" },
    ]);

    const res = await request(createApp()).get("/api/menu-items");

    const categoryOrder = res.body.map((item: { category: string }) => item.category);
    expect(categoryOrder).toEqual(["Starters", "Entrées", "Sides", "Desserts"]);
  });

  it("includes imageUrl when the menu item has one", async () => {
    await MenuItem.deleteMany({});
    await MenuItem.create({
      name: "Tuna Tartare",
      description: "desc",
      priceCents: 1900,
      category: "Starters",
      imageUrl: "https://example.com/tuna.jpg",
    });

    const res = await request(createApp()).get("/api/menu-items");

    expect(res.body[0].imageUrl).toBe("https://example.com/tuna.jpg");
  });

  it("omits imageUrl when the menu item has none", async () => {
    await MenuItem.deleteMany({});
    await MenuItem.create({ name: "Tuna Tartare", description: "desc", priceCents: 1900, category: "Starters" });

    const res = await request(createApp()).get("/api/menu-items");

    expect(res.body[0].imageUrl).toBeUndefined();
  });
});
