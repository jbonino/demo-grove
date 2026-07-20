import { afterAll, afterEach, beforeAll, describe, expect, it } from "vitest";
import request from "supertest";
import { startTestDb, stopTestDb } from "../test/mongoMemory.js";
import { Reward } from "../models/Reward.js";
import { Order } from "../models/Order.js";
import { LoyaltyEvent } from "../models/LoyaltyEvent.js";
import { createApp } from "../app.js";

beforeAll(startTestDb);
afterAll(stopTestDb);
afterEach(async () => {
  await Reward.deleteMany({});
  await Order.deleteMany({});
  await LoyaltyEvent.deleteMany({});
});

describe("GET /api/loyalty/:phone", () => {
  it("returns balance, lifetime orders, rewards, and activity for a phone with history", async () => {
    await Reward.create([
      { name: "Free Flatbread", description: "desc", pointsCost: 300, discountAmountCents: 1200 },
      { name: "$25 off", description: "desc", pointsCost: 900, discountAmountCents: 2500 },
    ]);

    const order = await Order.create({
      items: [],
      subtotalCents: 1600,
      phone: "+15551234567",
      pickup: { mode: "asap", time: null },
      status: "paid",
      rewardRedeemed: { name: "Free Flatbread", discountAmountCents: 1200 },
      pointsEarned: 4,
      pointsBalanceAfter: 400,
      createdAt: new Date("2026-06-01T12:00:00Z"),
    });
    await LoyaltyEvent.create({
      phone: "+15551234567",
      orderId: order._id,
      type: "redeem",
      points: -300,
      createdAt: new Date("2026-06-01T12:00:00Z"),
    });
    await LoyaltyEvent.create({
      phone: "+15551234567",
      orderId: order._id,
      type: "earn",
      points: 4,
      createdAt: new Date("2026-06-01T12:00:00Z"),
    });
    await LoyaltyEvent.create({
      phone: "+15551234567",
      orderId: null,
      type: "earn",
      points: 696,
      createdAt: new Date("2026-05-01T12:00:00Z"),
    });

    const res = await request(createApp()).get("/api/loyalty/+15551234567");

    expect(res.status).toBe(200);
    expect(res.body.pointsBalance).toBe(400);
    expect(res.body.lifetimeOrders).toBe(1);

    const byName = (name: string) => res.body.availableRewards.find((r: { name: string }) => r.name === name);
    expect(byName("Free Flatbread")).toMatchObject({ unlocked: true, pointsNeeded: 0 });
    expect(byName("$25 off")).toMatchObject({ unlocked: false, pointsNeeded: 500 });

    expect(res.body.activity).toHaveLength(2);
    expect(res.body.activity[0]).toMatchObject({
      orderId: order._id.toString(),
      pointsDelta: -296,
      note: "Redeemed Free Flatbread",
    });
    expect(res.body.activity[1]).toMatchObject({
      orderId: null,
      pointsDelta: 696,
      note: null,
    });
  });

  it("matches loyalty history when the phone is looked up with different formatting", async () => {
    await LoyaltyEvent.create({ phone: "9062351626", orderId: null, type: "earn", points: 120 });

    const res = await request(createApp()).get("/api/loyalty/(906) 235-1626");

    expect(res.status).toBe(200);
    expect(res.body.pointsBalance).toBe(120);
  });

  it("returns 404 when the phone has no loyalty history", async () => {
    const res = await request(createApp()).get("/api/loyalty/+15550000000");
    expect(res.status).toBe(404);
  });

  it("recomputes unlocked/pointsNeeded from the live balance, not a cached value", async () => {
    await Reward.create({ name: "Small Bite", description: "desc", pointsCost: 300, discountAmountCents: 1200 });
    await LoyaltyEvent.create({ phone: "+15559990000", orderId: null, type: "earn", points: 100 });

    const first = await request(createApp()).get("/api/loyalty/+15559990000");
    expect(first.body.availableRewards[0]).toMatchObject({ unlocked: false, pointsNeeded: 200 });

    await LoyaltyEvent.create({ phone: "+15559990000", orderId: null, type: "earn", points: 250 });

    const second = await request(createApp()).get("/api/loyalty/+15559990000");
    expect(second.body.pointsBalance).toBe(350);
    expect(second.body.availableRewards[0]).toMatchObject({ unlocked: true, pointsNeeded: 0 });
  });
});
