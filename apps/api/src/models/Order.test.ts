import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { Types } from "mongoose";
import { startTestDb, stopTestDb } from "../test/mongoMemory.js";
import { Order } from "./Order.js";

beforeAll(startTestDb);
afterAll(stopTestDb);

describe("Order model", () => {
  it("saves and retrieves a valid order by id", async () => {
    const created = await Order.create({
      items: [{ menuItem: new Types.ObjectId(), quantity: 2, unitPriceCents: 500 }],
      subtotalCents: 1000,
      phone: "+15551234567",
      pickup: { mode: "asap", time: null },
      status: "pending",
    });

    const found = await Order.findById(created._id);
    expect(found?.phone).toBe("+15551234567");
    expect(found?.subtotalCents).toBe(1000);
    expect(found?.items).toHaveLength(1);
    expect(found?.pickup.mode).toBe("asap");
  });

  it("rejects a document missing phone", async () => {
    const doc = new Order({
      items: [{ menuItem: new Types.ObjectId(), quantity: 1, unitPriceCents: 500 }],
      subtotalCents: 500,
      pickup: { mode: "asap", time: null },
      status: "pending",
    });
    await expect(doc.validate()).rejects.toThrow();
  });

  it("rejects a document missing pickup", async () => {
    const doc = new Order({
      items: [{ menuItem: new Types.ObjectId(), quantity: 1, unitPriceCents: 500 }],
      subtotalCents: 500,
      phone: "+15551234567",
      status: "pending",
    });
    await expect(doc.validate()).rejects.toThrow();
  });

  it("defaults reward/points fields when none are provided", async () => {
    const created = await Order.create({
      items: [{ menuItem: new Types.ObjectId(), quantity: 1, unitPriceCents: 500 }],
      subtotalCents: 500,
      phone: "+15551234567",
      pickup: { mode: "asap", time: null },
      status: "pending",
      stripePaymentIntentId: "pi_reward_defaults_test",
    });

    expect(created.rewardRedeemed).toBeNull();
    expect(created.pointsEarned).toBe(0);
    expect(created.pointsBalanceAfter).toBe(0);
  });

  it("saves reward/points fields when a reward is redeemed", async () => {
    const created = await Order.create({
      items: [{ menuItem: new Types.ObjectId(), quantity: 1, unitPriceCents: 500 }],
      subtotalCents: 500,
      phone: "+15551234567",
      pickup: { mode: "asap", time: null },
      status: "paid",
      rewardRedeemed: { name: "Free Flatbread", discountAmountCents: 1200 },
      pointsEarned: 5,
      pointsBalanceAfter: 42,
      stripePaymentIntentId: "pi_reward_saved_test",
    });

    const found = await Order.findById(created._id);
    expect(found?.rewardRedeemed).toMatchObject({ name: "Free Flatbread", discountAmountCents: 1200 });
    expect(found?.pointsEarned).toBe(5);
    expect(found?.pointsBalanceAfter).toBe(42);
  });

  it("enforces uniqueness on stripePaymentIntentId", async () => {
    await Order.create({
      items: [{ menuItem: new Types.ObjectId(), quantity: 1, unitPriceCents: 500 }],
      subtotalCents: 500,
      phone: "+15551234567",
      pickup: { mode: "asap", time: null },
      status: "paid",
      stripePaymentIntentId: "pi_duplicate_test",
    });

    await expect(
      Order.create({
        items: [{ menuItem: new Types.ObjectId(), quantity: 1, unitPriceCents: 500 }],
        subtotalCents: 500,
        phone: "+15559876543",
        pickup: { mode: "asap", time: null },
        status: "paid",
        stripePaymentIntentId: "pi_duplicate_test",
      }),
    ).rejects.toThrow();
  });
});
