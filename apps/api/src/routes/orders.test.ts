import { afterAll, beforeAll, describe, expect, it } from "vitest";
import request from "supertest";
import { startTestDb, stopTestDb } from "../test/mongoMemory.js";
import { MenuItem } from "../models/MenuItem.js";
import { Reward } from "../models/Reward.js";
import { LoyaltyEvent } from "../models/LoyaltyEvent.js";
import { createApp } from "../app.js";

beforeAll(startTestDb);
afterAll(stopTestDb);

describe("POST /api/orders", () => {
  it("creates a real Stripe PaymentIntent for the server-computed subtotal", async () => {
    const menuItem = await MenuItem.create({
      name: "Burrata & Heirloom Tomato",
      description: "desc",
      priceCents: 1600,
      category: "Starters",
    });

    const res = await request(createApp())
      .post("/api/orders")
      .send({
        items: [{ itemId: menuItem._id.toString(), quantity: 2 }],
        phone: "+15551234567",
        pickup: { mode: "asap", time: null },
      });

    expect(res.status).toBe(201);
    expect(res.body.subtotalCents).toBe(3200);
    expect(res.body.paymentIntentId).toMatch(/^pi_/);
    expect(res.body.clientSecret).toContain(res.body.paymentIntentId);
  });

  it("rejects an empty cart", async () => {
    const res = await request(createApp())
      .post("/api/orders")
      .send({ items: [], phone: "+15551234567", pickup: { mode: "asap", time: null } });
    expect(res.status).toBe(400);
  });

  it("rejects a cart with an unknown menu item", async () => {
    const res = await request(createApp())
      .post("/api/orders")
      .send({
        items: [{ itemId: "000000000000000000000000", quantity: 1 }],
        phone: "+15551234567",
        pickup: { mode: "asap", time: null },
      });
    expect(res.status).toBe(400);
  });

  it("rejects a request missing phone", async () => {
    const menuItem = await MenuItem.create({
      name: "Tuna Tartare",
      description: "desc",
      priceCents: 1900,
      category: "Starters",
    });
    const res = await request(createApp())
      .post("/api/orders")
      .send({
        items: [{ itemId: menuItem._id.toString(), quantity: 1 }],
        pickup: { mode: "asap", time: null },
      });
    expect(res.status).toBe(400);
  });
});

describe("POST /api/orders — reward redemption", () => {
  it("discounts the PaymentIntent amount when the phone can afford the reward", async () => {
    const menuItem = await MenuItem.create({
      name: "Dry-Aged Ribeye",
      description: "desc",
      priceCents: 4800,
      category: "Entrées",
    });
    const reward = await Reward.create({
      name: "$10 off",
      description: "desc",
      pointsCost: 500,
      discountAmountCents: 1000,
    });
    await LoyaltyEvent.create({
      phone: "+15551110000",
      orderId: null,
      type: "earn",
      points: 500,
    });

    const res = await request(createApp())
      .post("/api/orders")
      .send({
        items: [{ itemId: menuItem._id.toString(), quantity: 1 }],
        phone: "+15551110000",
        pickup: { mode: "asap", time: null },
        rewardId: reward._id.toString(),
      });

    expect(res.status).toBe(201);
    expect(res.body.subtotalCents).toBe(4800);
    expect(res.body.discountedSubtotalCents).toBe(3800);
  });

  it("rejects a reward the phone number can't afford, before creating a PaymentIntent", async () => {
    const menuItem = await MenuItem.create({
      name: "Miso-Glazed Salmon",
      description: "desc",
      priceCents: 3200,
      category: "Entrées",
    });
    const reward = await Reward.create({
      name: "$10 off",
      description: "desc",
      pointsCost: 500,
      discountAmountCents: 1000,
    });

    const res = await request(createApp())
      .post("/api/orders")
      .send({
        items: [{ itemId: menuItem._id.toString(), quantity: 1 }],
        phone: "+15551110001",
        pickup: { mode: "asap", time: null },
        rewardId: reward._id.toString(),
      });

    expect(res.status).toBe(400);
  });

  it("rejects an unknown rewardId", async () => {
    const menuItem = await MenuItem.create({
      name: "Charred Brussels Sprouts",
      description: "desc",
      priceCents: 850,
      category: "Sides",
    });

    const res = await request(createApp())
      .post("/api/orders")
      .send({
        items: [{ itemId: menuItem._id.toString(), quantity: 1 }],
        phone: "+15551110002",
        pickup: { mode: "asap", time: null },
        rewardId: "000000000000000000000000",
      });

    expect(res.status).toBe(400);
  });
});

describe("GET /api/orders/by-payment-intent/:paymentIntentId", () => {
  it("returns 404 when no order exists yet for that PaymentIntent", async () => {
    const res = await request(createApp()).get("/api/orders/by-payment-intent/pi_does_not_exist");
    expect(res.status).toBe(404);
  });
});
