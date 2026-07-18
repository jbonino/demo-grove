import { afterAll, beforeAll, describe, expect, it } from "vitest";
import request from "supertest";
import { startTestDb, stopTestDb } from "../test/mongoMemory.js";
import { Reward } from "../models/Reward.js";
import { LoyaltyEvent } from "../models/LoyaltyEvent.js";
import { createApp } from "../app.js";

beforeAll(startTestDb);
afterAll(stopTestDb);

describe("GET /api/rewards", () => {
  it("returns seeded rewards as DTOs, sorted by pointsCost, all locked when no phone given", async () => {
    await Reward.create([
      { name: "Free Flatbread", description: "desc", pointsCost: 300, discountAmountCents: 1200 },
      { name: "$10 off", description: "desc", pointsCost: 500, discountAmountCents: 1000 },
    ]);

    const res = await request(createApp()).get("/api/rewards");

    expect(res.status).toBe(200);
    expect(res.body.balance).toBeNull();
    expect(res.body.rewards).toHaveLength(2);
    expect(res.body.rewards[0]).toMatchObject({
      name: "Free Flatbread",
      description: expect.any(String),
      pointsCost: 300,
      discountAmountCents: 1200,
      unlocked: false,
      pointsNeeded: 300,
    });
    expect(res.body.rewards[0].id).toBeTruthy();
  });

  it("computes balance and unlocked/pointsNeeded against a phone's live balance", async () => {
    await Reward.create([
      { name: "Small Bite", description: "desc", pointsCost: 300, discountAmountCents: 1200 },
      { name: "$25 off", description: "desc", pointsCost: 900, discountAmountCents: 2500 },
    ]);
    await LoyaltyEvent.create({ phone: "+15551234567", orderId: null, type: "earn", points: 400 });

    const res = await request(createApp()).get("/api/rewards").query({ phone: "+15551234567" });

    expect(res.status).toBe(200);
    expect(res.body.balance).toBe(400);
    const byName = (name: string) => res.body.rewards.find((r: { name: string }) => r.name === name);
    expect(byName("Small Bite")).toMatchObject({ unlocked: true, pointsNeeded: 0 });
    expect(byName("$25 off")).toMatchObject({ unlocked: false, pointsNeeded: 500 });
  });
});
