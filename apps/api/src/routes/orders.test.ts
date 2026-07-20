import { afterAll, beforeAll, describe, expect, it } from "vitest";
import request from "supertest";
import { startTestDb, stopTestDb } from "../test/mongoMemory.js";
import { MenuItem } from "../models/MenuItem.js";
import { Order } from "../models/Order.js";
import { Reward } from "../models/Reward.js";
import { LoyaltyEvent } from "../models/LoyaltyEvent.js";
import { createApp } from "../app.js";
import { getStripeClient } from "../stripeClient.js";

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

  it("normalizes a formatted phone number before storing it on the PaymentIntent metadata", async () => {
    const menuItem = await MenuItem.create({
      name: "Marinated Olives",
      description: "desc",
      priceCents: 800,
      category: "Starters",
    });

    const res = await request(createApp())
      .post("/api/orders")
      .send({
        items: [{ itemId: menuItem._id.toString(), quantity: 1 }],
        phone: "(906) 235-1626",
        pickup: { mode: "asap", time: null },
      });

    expect(res.status).toBe(201);
    const paymentIntent = await getStripeClient().paymentIntents.retrieve(res.body.paymentIntentId);
    expect(paymentIntent.metadata.phone).toBe("9062351626");
  });

  it("carries an optional name through to the PaymentIntent metadata", async () => {
    const menuItem = await MenuItem.create({
      name: "Roasted Beet Salad",
      description: "desc",
      priceCents: 1200,
      category: "Starters",
    });

    const res = await request(createApp())
      .post("/api/orders")
      .send({
        items: [{ itemId: menuItem._id.toString(), quantity: 1 }],
        phone: "+15551234568",
        name: "Jane Doe",
        pickup: { mode: "asap", time: null },
      });

    expect(res.status).toBe(201);
    const paymentIntent = await getStripeClient().paymentIntents.retrieve(res.body.paymentIntentId);
    expect(paymentIntent.metadata.customerName).toBe("Jane Doe");
  });

  it("leaves customerName metadata empty when no name is given", async () => {
    const menuItem = await MenuItem.create({
      name: "French Onion Soup",
      description: "desc",
      priceCents: 1100,
      category: "Starters",
    });

    const res = await request(createApp())
      .post("/api/orders")
      .send({
        items: [{ itemId: menuItem._id.toString(), quantity: 1 }],
        phone: "+15551234569",
        pickup: { mode: "asap", time: null },
      });

    expect(res.status).toBe(201);
    const paymentIntent = await getStripeClient().paymentIntents.retrieve(res.body.paymentIntentId);
    expect(paymentIntent.metadata.customerName).toBe("");
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

  it("includes rewardRedeemed, pointsEarned, and pointsBalanceAfter", async () => {
    const order = await Order.create({
      items: [],
      subtotalCents: 3800,
      phone: "+15551110009",
      pickup: { mode: "asap", time: null },
      stripePaymentIntentId: "pi_reward_test",
      status: "paid",
      rewardRedeemed: { name: "$10 off", discountAmountCents: 1000 },
      pointsEarned: 38,
      pointsBalanceAfter: 462,
    });

    const res = await request(createApp()).get(`/api/orders/by-payment-intent/${order.stripePaymentIntentId}`);

    expect(res.status).toBe(200);
    expect(res.body.rewardRedeemed).toEqual({ name: "$10 off", discountAmountCents: 1000 });
    expect(res.body.pointsEarned).toBe(38);
    expect(res.body.pointsBalanceAfter).toBe(462);
  });

  it("returns rewardRedeemed as null when no reward was used", async () => {
    const order = await Order.create({
      items: [],
      subtotalCents: 1600,
      phone: "+15551110010",
      pickup: { mode: "asap", time: null },
      stripePaymentIntentId: "pi_no_reward_test",
      status: "paid",
      pointsEarned: 16,
      pointsBalanceAfter: 16,
    });

    const res = await request(createApp()).get(`/api/orders/by-payment-intent/${order.stripePaymentIntentId}`);

    expect(res.status).toBe(200);
    expect(res.body.rewardRedeemed).toBeNull();
  });
});
