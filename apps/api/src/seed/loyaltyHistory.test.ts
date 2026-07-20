import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { startTestDb, stopTestDb } from "../test/mongoMemory.js";
import { Order } from "../models/Order.js";
import { LoyaltyEvent } from "../models/LoyaltyEvent.js";
import { Reward } from "../models/Reward.js";
import { seedMenuItems } from "./menuItems.js";
import { seedRewards } from "./rewards.js";
import { seedLoyaltyHistory } from "./loyaltyHistory.js";
import { getPointsBalance } from "../loyalty/balance.js";

beforeAll(async () => {
  await startTestDb();
  await seedMenuItems();
  await seedRewards();
});
afterAll(stopTestDb);

describe("seedLoyaltyHistory", () => {
  it("populates 30-40 customers with paid orders and matching earn LoyaltyEvents", async () => {
    await seedLoyaltyHistory();

    const phones = await Order.distinct("phone");
    expect(phones.length).toBeGreaterThanOrEqual(30);
    expect(phones.length).toBeLessThanOrEqual(40);

    const orders = await Order.find({ phone: { $in: phones } });
    for (const order of orders) {
      expect(order.status).toBe("paid");
      expect(order.subtotalCents).toBeGreaterThan(0);
    }

    for (const phone of phones) {
      expect(await getPointsBalance(phone)).toBeGreaterThanOrEqual(0);
    }
  });

  it("gives most customers a customerName, but leaves a subset null", async () => {
    const orders = await Order.find();
    const named = orders.filter((order) => order.customerName !== null);
    const unnamed = orders.filter((order) => order.customerName === null);

    expect(named.length).toBeGreaterThan(0);
    expect(unnamed.length).toBeGreaterThan(0);
  });

  it("gives at least one customer a past redemption", async () => {
    const redeemedOrder = await Order.findOne({ rewardRedeemed: { $ne: null } });
    expect(redeemedOrder).not.toBeNull();

    const redeemEvent = await LoyaltyEvent.findOne({ type: "redeem" });
    expect(redeemEvent).not.toBeNull();
  });

  it("leaves at least one customer just short of the cheapest reward's threshold", async () => {
    const cheapestReward = await Reward.findOne().sort({ pointsCost: 1 });
    const phones = await Order.distinct("phone");

    const balances = await Promise.all(phones.map((phone) => getPointsBalance(phone)));
    const hasNearThresholdCustomer = balances.some(
      (balance) => balance > 0 && balance < (cheapestReward?.pointsCost ?? 0),
    );
    expect(hasNearThresholdCustomer).toBe(true);
  });

  it("resets rather than duplicates on re-run", async () => {
    const firstOrderCount = await Order.countDocuments();
    const firstEventCount = await LoyaltyEvent.countDocuments();

    await seedLoyaltyHistory();

    expect(await Order.countDocuments()).toBe(firstOrderCount);
    expect(await LoyaltyEvent.countDocuments()).toBe(firstEventCount);
  });
});
