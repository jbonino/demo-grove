import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { startTestDb, stopTestDb } from "../test/mongoMemory.js";
import { Reward } from "./Reward.js";

beforeAll(startTestDb);
afterAll(stopTestDb);

describe("Reward model", () => {
  it("saves and retrieves a reward", async () => {
    const created = await Reward.create({
      name: "Free Flatbread",
      description: "A free flatbread with any order",
      pointsCost: 300,
      discountAmountCents: 1200,
    });

    const found = await Reward.findById(created._id);
    expect(found?.name).toBe("Free Flatbread");
    expect(found?.pointsCost).toBe(300);
    expect(found?.discountAmountCents).toBe(1200);
  });

  it("rejects a document missing pointsCost", async () => {
    const doc = new Reward({
      name: "Free Flatbread",
      description: "desc",
      discountAmountCents: 1200,
    });
    await expect(doc.validate()).rejects.toThrow();
  });

  it("rejects a document missing discountAmountCents", async () => {
    const doc = new Reward({ name: "Free Flatbread", description: "desc", pointsCost: 300 });
    await expect(doc.validate()).rejects.toThrow();
  });
});
