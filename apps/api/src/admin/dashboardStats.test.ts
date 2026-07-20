import { afterAll, afterEach, beforeAll, describe, expect, it } from "vitest";
import { Types } from "mongoose";
import { startTestDb, stopTestDb } from "../test/mongoMemory.js";
import { Order } from "../models/Order.js";
import { LoyaltyEvent } from "../models/LoyaltyEvent.js";
import { getDashboardStats } from "./dashboardStats.js";

beforeAll(startTestDb);
afterAll(stopTestDb);
afterEach(async () => {
  await Order.deleteMany({});
  await LoyaltyEvent.deleteMany({});
});

const NOW = new Date("2026-07-20T18:00:00.000Z");
const hoursAgo = (h: number) => new Date(NOW.getTime() - h * 60 * 60 * 1000);
const daysAgo = (d: number) => new Date(NOW.getTime() - d * 24 * 60 * 60 * 1000);

async function createOrder(overrides: Partial<Parameters<typeof Order.create>[0]> = {}) {
  return Order.create({
    items: [{ menuItem: new Types.ObjectId(), quantity: 1, unitPriceCents: 1000 }],
    subtotalCents: 1000,
    phone: "+15551234567",
    customerName: null,
    pickup: { mode: "asap", time: null },
    stripePaymentIntentId: `pi_${new Types.ObjectId().toString()}`,
    status: "paid",
    pointsEarned: 10,
    pointsBalanceAfter: 10,
    createdAt: hoursAgo(1),
    ...overrides,
  });
}

describe("getDashboardStats", () => {
  it("counts today's orders and yesterday's, and computes the delta", async () => {
    await createOrder({ createdAt: hoursAgo(1) });
    await createOrder({ createdAt: hoursAgo(2) });
    await createOrder({ createdAt: hoursAgo(23) });

    const stats = await getDashboardStats(NOW);

    expect(stats.ordersToday).toBe(2);
    expect(stats.ordersTodayDelta).toBe(1);
  });

  it("sums today's post-discount revenue and computes the delta vs yesterday", async () => {
    await createOrder({ createdAt: hoursAgo(1), subtotalCents: 2000 });
    await createOrder({
      createdAt: hoursAgo(2),
      subtotalCents: 3000,
      rewardRedeemed: { name: "$10 off", discountAmountCents: 1000 },
    });
    await createOrder({ createdAt: hoursAgo(23), subtotalCents: 1000 });

    const stats = await getDashboardStats(NOW);

    expect(stats.revenueTodayCents).toBe(2000 + (3000 - 1000));
    expect(stats.revenueTodayDeltaCents).toBe(2000 + 2000 - 1000);
  });

  it("sums points issued and counts redemptions over the last 7 days", async () => {
    const order = await createOrder({ createdAt: daysAgo(1) });
    await LoyaltyEvent.create({ phone: "+15551234567", orderId: order._id, type: "earn", points: 20, createdAt: daysAgo(1) });
    await LoyaltyEvent.create({ phone: "+15551234567", orderId: order._id, type: "redeem", points: -300, createdAt: daysAgo(2) });
    await LoyaltyEvent.create({ phone: "+15551234567", orderId: order._id, type: "earn", points: 5, createdAt: daysAgo(8) });

    const stats = await getDashboardStats(NOW);

    expect(stats.pointsIssued7d).toBe(20);
    expect(stats.pointsRedeemed7d).toBe(1);
  });

  it("counts a customer as a signup only if their earliest paid order falls within the last 7 days", async () => {
    await createOrder({ phone: "+15550000001", createdAt: daysAgo(3) });
    await createOrder({ phone: "+15550000002", createdAt: daysAgo(10) });
    await createOrder({ phone: "+15550000002", createdAt: daysAgo(2) });

    const stats = await getDashboardStats(NOW);

    expect(stats.signups7d).toBe(1);
    expect(stats.ordersOutOf7d).toBe(2);
  });

  it("returns the most recent paid orders with a Guest fallback and Completed status", async () => {
    await createOrder({ customerName: "Jane Doe", createdAt: hoursAgo(1) });
    await createOrder({ customerName: null, createdAt: hoursAgo(2) });

    const stats = await getDashboardStats(NOW);

    expect(stats.recentOrders).toHaveLength(2);
    expect(stats.recentOrders[0].customerName).toBe("Jane Doe");
    expect(stats.recentOrders[1].customerName).toBe("Guest");
    expect(stats.recentOrders.every((order) => order.status === "Completed")).toBe(true);
  });

  it("limits recentOrders to the 5 most recent", async () => {
    for (let i = 0; i < 7; i++) {
      await createOrder({ createdAt: hoursAgo(i) });
    }

    const stats = await getDashboardStats(NOW);

    expect(stats.recentOrders).toHaveLength(5);
  });
});
