import { afterAll, beforeAll, describe, expect, it } from "vitest";
import request from "supertest";
import { Types } from "mongoose";
import { startTestDb, stopTestDb } from "../test/mongoMemory.js";
import { createApp } from "../app.js";
import { Order } from "../models/Order.js";
import { MenuItem } from "../models/MenuItem.js";

beforeAll(startTestDb);
afterAll(stopTestDb);

async function loginAgent() {
  const app = createApp();
  const agent = request.agent(app);
  await agent.post("/api/admin/login").send({ password: process.env.GROVE_ADMIN_PASSWORD });
  return agent;
}

describe("GET /api/admin/orders", () => {
  it("rejects a request with no session cookie", async () => {
    const res = await request(createApp()).get("/api/admin/orders");
    expect(res.status).toBe(401);
  });

  it("returns paginated orders for a signed-in operator", async () => {
    await Order.create({
      items: [{ menuItem: new Types.ObjectId(), quantity: 1, unitPriceCents: 1000 }],
      subtotalCents: 1000,
      phone: "+15551234567",
      customerName: "Jane Doe",
      pickup: { mode: "asap", time: null },
      stripePaymentIntentId: `pi_${new Types.ObjectId().toString()}`,
      status: "paid",
      pointsEarned: 10,
      pointsBalanceAfter: 10,
    });

    const agent = await loginAgent();
    const res = await agent.get("/api/admin/orders");

    expect(res.status).toBe(200);
    expect(res.body.page).toBe(1);
    expect(res.body.orders[0].customerName).toBe("Jane Doe");
    expect(res.body.orders[0].status).toBe("Completed");
  });
});

describe("GET /api/admin/orders/:id", () => {
  it("rejects a request with no session cookie", async () => {
    const res = await request(createApp()).get(`/api/admin/orders/${new Types.ObjectId().toString()}`);
    expect(res.status).toBe(401);
  });

  it("returns order detail with itemized lines for a signed-in operator", async () => {
    const item = await MenuItem.create({ name: "Burger", description: "A tasty item", priceCents: 1200, category: "Mains" });
    const order = await Order.create({
      items: [{ menuItem: item._id, quantity: 2, unitPriceCents: 1200 }],
      subtotalCents: 2400,
      phone: "+15551234567",
      customerName: "Jane Doe",
      pickup: { mode: "asap", time: null },
      stripePaymentIntentId: `pi_${new Types.ObjectId().toString()}`,
      status: "paid",
      pointsEarned: 24,
      pointsBalanceAfter: 24,
    });

    const agent = await loginAgent();
    const res = await agent.get(`/api/admin/orders/${order._id.toString()}`);

    expect(res.status).toBe(200);
    expect(res.body.items[0]).toMatchObject({ name: "Burger", quantity: 2, unitPriceCents: 1200 });
    expect(res.body.totalCents).toBe(2400);
  });

  it("returns 404 for a nonexistent order id", async () => {
    const agent = await loginAgent();
    const res = await agent.get(`/api/admin/orders/${new Types.ObjectId().toString()}`);
    expect(res.status).toBe(404);
  });
});
