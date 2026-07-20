import { afterAll, beforeAll, describe, expect, it } from "vitest";
import request from "supertest";
import { Types } from "mongoose";
import { startTestDb, stopTestDb } from "../test/mongoMemory.js";
import { createApp } from "../app.js";
import { Order } from "../models/Order.js";

beforeAll(startTestDb);
afterAll(stopTestDb);

describe("GET /api/admin/dashboard", () => {
  it("rejects a request with no session cookie", async () => {
    const res = await request(createApp()).get("/api/admin/dashboard");
    expect(res.status).toBe(401);
  });

  it("returns dashboard stats for a signed-in operator", async () => {
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

    const app = createApp();
    const agent = request.agent(app);
    await agent.post("/api/admin/login").send({ password: process.env.GROVE_ADMIN_PASSWORD });

    const res = await agent.get("/api/admin/dashboard");

    expect(res.status).toBe(200);
    expect(res.body.ordersToday).toBeGreaterThanOrEqual(1);
    expect(res.body.recentOrders[0].customerName).toBe("Jane Doe");
    expect(res.body.recentOrders[0].status).toBe("Completed");
  });
});
