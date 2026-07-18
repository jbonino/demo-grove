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
