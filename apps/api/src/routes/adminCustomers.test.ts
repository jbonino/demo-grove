import { afterAll, beforeAll, describe, expect, it } from "vitest";
import request from "supertest";
import { Types } from "mongoose";
import { startTestDb, stopTestDb } from "../test/mongoMemory.js";
import { createApp } from "../app.js";
import { Order } from "../models/Order.js";

beforeAll(startTestDb);
afterAll(stopTestDb);

describe("GET /api/admin/customers", () => {
  it("rejects a request with no session cookie", async () => {
    const res = await request(createApp()).get("/api/admin/customers");
    expect(res.status).toBe(401);
  });

  it("returns paginated customers for a signed-in operator", async () => {
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

    const res = await agent.get("/api/admin/customers");

    expect(res.status).toBe(200);
    expect(res.body.page).toBe(1);
    expect(res.body.customers[0].name).toBe("Jane Doe");
    expect(res.body.customers[0].phone).toBe("+15551234567");
  });

  it("passes search and page query params through", async () => {
    const app = createApp();
    const agent = request.agent(app);
    await agent.post("/api/admin/login").send({ password: process.env.GROVE_ADMIN_PASSWORD });

    const res = await agent.get("/api/admin/customers").query({ search: "nobody", page: 2 });

    expect(res.status).toBe(200);
    expect(res.body.customers).toHaveLength(0);
    expect(res.body.page).toBe(2);
  });
});
