import { afterAll, beforeAll, describe, expect, it } from "vitest";
import request from "supertest";
import { startTestDb, stopTestDb } from "./test/mongoMemory.js";
import { createApp } from "./app.js";

describe("GET /health", () => {
  it("returns 503 when the database is not connected", async () => {
    const res = await request(createApp()).get("/health");
    expect(res.status).toBe(503);
    expect(res.body).toEqual({ ok: false });
  });

  describe("with a live database connection", () => {
    beforeAll(startTestDb);
    afterAll(stopTestDb);

    it("returns ok", async () => {
      const res = await request(createApp()).get("/health");
      expect(res.status).toBe(200);
      expect(res.body).toEqual({ ok: true });
    });
  });
});
