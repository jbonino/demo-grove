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
});
