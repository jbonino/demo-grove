import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { Types } from "mongoose";
import { startTestDb, stopTestDb } from "../test/mongoMemory.js";
import { LoyaltyEvent } from "./LoyaltyEvent.js";

beforeAll(startTestDb);
afterAll(stopTestDb);

describe("LoyaltyEvent model", () => {
  it("saves and retrieves an earn event by phone", async () => {
    const created = await LoyaltyEvent.create({
      phone: "+15551234567",
      orderId: new Types.ObjectId(),
      type: "earn",
      points: 32,
    });

    const found = await LoyaltyEvent.findById(created._id);
    expect(found?.phone).toBe("+15551234567");
    expect(found?.type).toBe("earn");
    expect(found?.points).toBe(32);
    expect(found?.createdAt).toBeInstanceOf(Date);
  });

  it("allows a null orderId", async () => {
    const doc = await LoyaltyEvent.create({
      phone: "+15551234567",
      orderId: null,
      type: "redeem",
      points: -300,
    });
    expect(doc.orderId).toBeNull();
  });

  it("rejects a document missing phone", async () => {
    const doc = new LoyaltyEvent({ type: "earn", points: 10 });
    await expect(doc.validate()).rejects.toThrow();
  });

  it("rejects a type outside earn/redeem", async () => {
    const doc = new LoyaltyEvent({ phone: "+15551234567", type: "bonus", points: 10 });
    await expect(doc.validate()).rejects.toThrow();
  });
});
