import { afterAll, afterEach, beforeAll, describe, expect, it } from "vitest";
import { Types } from "mongoose";
import { startTestDb, stopTestDb } from "../test/mongoMemory.js";
import { Order } from "../models/Order.js";
import { getOrderList } from "./orderList.js";

beforeAll(startTestDb);
afterAll(stopTestDb);
afterEach(async () => {
  await Order.deleteMany({});
});

const NOW = new Date("2026-07-20T18:00:00.000Z");
const hoursAgo = (h: number) => new Date(NOW.getTime() - h * 60 * 60 * 1000);

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

describe("getOrderList", () => {
  it("returns paid orders most-recent-first with Guest fallback and Completed status", async () => {
    await createOrder({ customerName: "Jane Doe", createdAt: hoursAgo(2) });
    await createOrder({ customerName: null, createdAt: hoursAgo(1) });

    const result = await getOrderList({});

    expect(result.orders).toHaveLength(2);
    expect(result.orders[0].customerName).toBe("Guest");
    expect(result.orders[1].customerName).toBe("Jane Doe");
    expect(result.orders.every((o) => o.status === "Completed")).toBe(true);
  });

  it("excludes unpaid orders", async () => {
    await createOrder({ status: "pending", stripePaymentIntentId: "pi_pending" });

    const result = await getOrderList({});

    expect(result.orders).toHaveLength(0);
  });

  it("computes totalCents as subtotal minus any reward discount", async () => {
    await createOrder({ subtotalCents: 2000, rewardRedeemed: { name: "$5 off", discountAmountCents: 500 } });

    const result = await getOrderList({});

    expect(result.orders[0].totalCents).toBe(1500);
  });

  it("paginates 20 per page and reports totalPages", async () => {
    for (let i = 0; i < 25; i++) {
      await createOrder({ createdAt: hoursAgo(i) });
    }

    const page1 = await getOrderList({ page: 1 });
    expect(page1.orders).toHaveLength(20);
    expect(page1.page).toBe(1);
    expect(page1.totalPages).toBe(2);

    const page2 = await getOrderList({ page: 2 });
    expect(page2.orders).toHaveLength(5);
  });
});
