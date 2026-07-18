import { afterAll, beforeAll, describe, expect, it } from "vitest";
import request from "supertest";
import { startTestDb, stopTestDb } from "../test/mongoMemory.js";
import { Reward } from "../models/Reward.js";
import { createApp } from "../app.js";

beforeAll(startTestDb);
afterAll(stopTestDb);

describe("GET /api/rewards", () => {
  it("returns seeded rewards as DTOs", async () => {
    await Reward.create([
      { name: "Free Flatbread", description: "desc", pointsCost: 300, discountAmountCents: 1200 },
      { name: "$10 off", description: "desc", pointsCost: 500, discountAmountCents: 1000 },
    ]);

    const res = await request(createApp()).get("/api/rewards");

    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(2);
    expect(res.body[0]).toMatchObject({
      name: expect.any(String),
      description: expect.any(String),
      pointsCost: expect.any(Number),
      discountAmountCents: expect.any(Number),
    });
    expect(res.body[0].id).toBeTruthy();
  });
});
