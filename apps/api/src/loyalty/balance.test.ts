import { afterAll, afterEach, beforeAll, describe, expect, it } from "vitest";
import { startTestDb, stopTestDb } from "../test/mongoMemory.js";
import { LoyaltyEvent } from "../models/LoyaltyEvent.js";
import { getPointsBalance } from "./balance.js";

beforeAll(startTestDb);
afterAll(stopTestDb);
afterEach(async () => {
  await LoyaltyEvent.deleteMany({});
});

describe("getPointsBalance", () => {
  it("returns 0 for a phone number with no events", async () => {
    expect(await getPointsBalance("+15550000000")).toBe(0);
  });

  it("sums earn and redeem events for a phone number", async () => {
    await LoyaltyEvent.create([
      { phone: "+15551234567", orderId: null, type: "earn", points: 32 },
      { phone: "+15551234567", orderId: null, type: "earn", points: 19 },
      { phone: "+15551234567", orderId: null, type: "redeem", points: -300 },
    ]);

    expect(await getPointsBalance("+15551234567")).toBe(32 + 19 - 300);
  });

  it("only counts events for the given phone number", async () => {
    await LoyaltyEvent.create([
      { phone: "+15551234567", orderId: null, type: "earn", points: 100 },
      { phone: "+15559999999", orderId: null, type: "earn", points: 500 },
    ]);

    expect(await getPointsBalance("+15551234567")).toBe(100);
  });
});
