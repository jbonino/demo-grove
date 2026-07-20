import { afterAll, beforeAll, describe, expect, it } from "vitest";
import request from "supertest";
import { mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
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

describe("static frontend serving", () => {
  function makeWebDist() {
    const dir = mkdtempSync(join(tmpdir(), "grove-web-dist-"));
    writeFileSync(join(dir, "index.html"), "<html><body>Grove SPA</body></html>");
    writeFileSync(join(dir, "asset.txt"), "fake-asset-bytes");
    return dir;
  }

  it("without a staticDir configured, unknown routes 404", async () => {
    const res = await request(createApp()).get("/some-client-route");
    expect(res.status).toBe(404);
  });

  it("serves a real static asset from staticDir", async () => {
    const staticDir = makeWebDist();
    const res = await request(createApp({ staticDir })).get("/asset.txt");
    expect(res.status).toBe(200);
    expect(res.text).toBe("fake-asset-bytes");
  });

  it("falls back to index.html for an unknown client-side route", async () => {
    const staticDir = makeWebDist();
    const res = await request(createApp({ staticDir })).get("/checkout");
    expect(res.status).toBe(200);
    expect(res.text).toContain("Grove SPA");
  });

  it("still 404s an unknown API route instead of falling back to index.html", async () => {
    const staticDir = makeWebDist();
    const res = await request(createApp({ staticDir })).get("/api/does-not-exist");
    expect(res.status).toBe(404);
    expect(res.text).not.toContain("Grove SPA");
  });
});
