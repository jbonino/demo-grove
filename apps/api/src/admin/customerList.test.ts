import { afterAll, afterEach, beforeAll, describe, expect, it } from "vitest";
import { Types } from "mongoose";
import { startTestDb, stopTestDb } from "../test/mongoMemory.js";
import { Order } from "../models/Order.js";
import { LoyaltyEvent } from "../models/LoyaltyEvent.js";
import { getCustomerList } from "./customerList.js";

beforeAll(startTestDb);
afterAll(stopTestDb);
afterEach(async () => {
  await Order.deleteMany({});
  await LoyaltyEvent.deleteMany({});
});

const NOW = new Date("2026-07-20T18:00:00.000Z");
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
    createdAt: daysAgo(1),
    ...overrides,
  });
}

describe("getCustomerList", () => {
  it("groups paid orders by phone with name, lifetime orders, and last order date", async () => {
    await createOrder({ phone: "+15551234567", customerName: "Jane Doe", createdAt: daysAgo(3) });
    await createOrder({ phone: "+15551234567", customerName: "Jane Doe", createdAt: daysAgo(1) });
    await createOrder({ phone: "+15559999999", customerName: "Bob Smith", createdAt: daysAgo(2) });

    const result = await getCustomerList({});

    expect(result.totalPages).toBe(1);
    const jane = result.customers.find((c) => c.phone === "+15551234567");
    expect(jane).toMatchObject({ name: "Jane Doe", lifetimeOrders: 2 });
    expect(jane?.lastOrderAt).toEqual(daysAgo(1));
  });

  it("falls back to Guest when no order for that phone has a customerName", async () => {
    await createOrder({ phone: "+15551234567", customerName: null });

    const result = await getCustomerList({});

    expect(result.customers[0].name).toBe("Guest");
  });

  it("ignores unpaid orders", async () => {
    await createOrder({ phone: "+15551234567", status: "pending", stripePaymentIntentId: "pi_pending" });

    const result = await getCustomerList({});

    expect(result.customers).toHaveLength(0);
  });

  it("computes points balance from LoyaltyEvents for each customer", async () => {
    const order = await createOrder({ phone: "+15551234567" });
    await LoyaltyEvent.create({ phone: "+15551234567", orderId: order._id, type: "earn", points: 20, createdAt: daysAgo(1) });
    await LoyaltyEvent.create({ phone: "+15551234567", orderId: order._id, type: "redeem", points: -5, createdAt: daysAgo(1) });

    const result = await getCustomerList({});

    expect(result.customers[0].pointsBalance).toBe(15);
  });

  it("filters by search matching name or phone, case-insensitive substring", async () => {
    await createOrder({ phone: "+15551234567", customerName: "Jane Doe" });
    await createOrder({ phone: "+15559998888", customerName: "Bob Smith" });

    const byName = await getCustomerList({ search: "jane" });
    expect(byName.customers).toHaveLength(1);
    expect(byName.customers[0].name).toBe("Jane Doe");

    const byPhone = await getCustomerList({ search: "9998888" });
    expect(byPhone.customers).toHaveLength(1);
    expect(byPhone.customers[0].name).toBe("Bob Smith");
  });

  it("search matches the Guest fallback name", async () => {
    await createOrder({ phone: "+15551234567", customerName: null });

    const result = await getCustomerList({ search: "guest" });

    expect(result.customers).toHaveLength(1);
  });

  it("paginates 20 per page and reports totalPages", async () => {
    for (let i = 0; i < 25; i++) {
      await createOrder({ phone: `+1555000${String(i).padStart(4, "0")}`, createdAt: daysAgo(i + 1) });
    }

    const page1 = await getCustomerList({ page: 1 });
    expect(page1.customers).toHaveLength(20);
    expect(page1.page).toBe(1);
    expect(page1.totalPages).toBe(2);

    const page2 = await getCustomerList({ page: 2 });
    expect(page2.customers).toHaveLength(5);
  });
});
