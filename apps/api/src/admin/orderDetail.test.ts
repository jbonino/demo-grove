import { afterAll, afterEach, beforeAll, describe, expect, it } from "vitest";
import { Types } from "mongoose";
import { startTestDb, stopTestDb } from "../test/mongoMemory.js";
import { Order } from "../models/Order.js";
import { MenuItem } from "../models/MenuItem.js";
import { getOrderDetail } from "./orderDetail.js";

beforeAll(startTestDb);
afterAll(stopTestDb);
afterEach(async () => {
  await Order.deleteMany({});
  await MenuItem.deleteMany({});
});

describe("getOrderDetail", () => {
  it("returns itemized lines with menu item names, quantity, and price", async () => {
    const burger = await MenuItem.create({ name: "Burger", description: "A tasty item", priceCents: 1200, category: "Mains" });
    const fries = await MenuItem.create({ name: "Fries", description: "A tasty item", priceCents: 400, category: "Sides" });
    const order = await Order.create({
      items: [
        { menuItem: burger._id, quantity: 2, unitPriceCents: 1200 },
        { menuItem: fries._id, quantity: 1, unitPriceCents: 400 },
      ],
      subtotalCents: 2800,
      phone: "+15551234567",
      customerName: "Jane Doe",
      pickup: { mode: "asap", time: null },
      stripePaymentIntentId: "pi_1",
      status: "paid",
      pointsEarned: 28,
      pointsBalanceAfter: 28,
    });

    const detail = await getOrderDetail(order._id.toString());

    expect(detail).toMatchObject({
      id: order._id.toString(),
      customerName: "Jane Doe",
      phone: "+15551234567",
      totalCents: 2800,
      pointsEarned: 28,
      status: "Completed",
      items: [
        { name: "Burger", quantity: 2, unitPriceCents: 1200 },
        { name: "Fries", quantity: 1, unitPriceCents: 400 },
      ],
    });
  });

  it("falls back to Guest when there is no customerName", async () => {
    const item = await MenuItem.create({ name: "Salad", description: "A tasty item", priceCents: 900, category: "Mains" });
    const order = await Order.create({
      items: [{ menuItem: item._id, quantity: 1, unitPriceCents: 900 }],
      subtotalCents: 900,
      phone: "+15551234567",
      customerName: null,
      pickup: { mode: "asap", time: null },
      stripePaymentIntentId: "pi_2",
      status: "paid",
      pointsEarned: 9,
      pointsBalanceAfter: 9,
    });

    const detail = await getOrderDetail(order._id.toString());

    expect(detail?.customerName).toBe("Guest");
  });

  it("subtracts the reward discount from the total", async () => {
    const item = await MenuItem.create({ name: "Salad", description: "A tasty item", priceCents: 900, category: "Mains" });
    const order = await Order.create({
      items: [{ menuItem: item._id, quantity: 1, unitPriceCents: 900 }],
      subtotalCents: 900,
      rewardRedeemed: { name: "$5 off", discountAmountCents: 500 },
      phone: "+15551234567",
      customerName: "Jane Doe",
      pickup: { mode: "asap", time: null },
      stripePaymentIntentId: "pi_3",
      status: "paid",
      pointsEarned: 4,
      pointsBalanceAfter: 4,
    });

    const detail = await getOrderDetail(order._id.toString());

    expect(detail?.totalCents).toBe(400);
  });

  it("returns null for a nonexistent order id", async () => {
    const detail = await getOrderDetail(new Types.ObjectId().toString());
    expect(detail).toBeNull();
  });
});
