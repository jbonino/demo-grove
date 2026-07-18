import { afterAll, beforeAll, describe, expect, it } from "vitest";
import request from "supertest";
import { startTestDb, stopTestDb } from "../test/mongoMemory.js";
import { MenuItem } from "../models/MenuItem.js";
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

describe("GET /api/orders/by-payment-intent/:paymentIntentId", () => {
  it("returns 404 when no order exists yet for that PaymentIntent", async () => {
    const res = await request(createApp()).get("/api/orders/by-payment-intent/pi_does_not_exist");
    expect(res.status).toBe(404);
  });
});
