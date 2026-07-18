import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { startTestDb, stopTestDb } from "../test/mongoMemory.js";
import { Reward } from "../models/Reward.js";
import { seedRewards } from "./rewards.js";

beforeAll(startTestDb);
afterAll(stopTestDb);

describe("seedRewards", () => {
  it("populates a small fixed rewards catalog, each fully fielded", async () => {
    await seedRewards();

    const rewards = await Reward.find();
    expect(rewards.length).toBeGreaterThanOrEqual(2);
    expect(rewards.length).toBeLessThanOrEqual(6);

    for (const reward of rewards) {
      expect(reward.name).toBeTruthy();
      expect(reward.description).toBeTruthy();
      expect(reward.pointsCost).toBeGreaterThan(0);
      expect(reward.discountAmountCents).toBeGreaterThan(0);
    }
  });

  it("resets rather than duplicates on re-run", async () => {
    await seedRewards();
    const firstCount = await Reward.countDocuments();

    await seedRewards();
    const secondCount = await Reward.countDocuments();

    expect(secondCount).toBe(firstCount);
  });
});
