import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { startTestDb, stopTestDb } from "../test/mongoMemory.js";
import { MenuItem } from "./MenuItem.js";

beforeAll(startTestDb);
afterAll(stopTestDb);

describe("MenuItem model", () => {
  it("rejects a document missing name", async () => {
    const doc = new MenuItem({ description: "desc", priceCents: 100, category: "Mains" });
    await expect(doc.validate()).rejects.toThrow();
  });

  it("rejects a document missing price", async () => {
    const doc = new MenuItem({ name: "Burger", description: "desc", category: "Mains" });
    await expect(doc.validate()).rejects.toThrow();
  });

  it("rejects a document missing category", async () => {
    const doc = new MenuItem({ name: "Burger", description: "desc", priceCents: 100 });
    await expect(doc.validate()).rejects.toThrow();
  });

  it("saves and retrieves a valid document", async () => {
    const created = await MenuItem.create({
      name: "Burger",
      description: "desc",
      priceCents: 1200,
      category: "Mains",
    });
    const found = await MenuItem.findById(created._id);
    expect(found?.name).toBe("Burger");
  });
});
