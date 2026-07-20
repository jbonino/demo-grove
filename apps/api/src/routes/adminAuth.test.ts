import { afterAll, beforeAll, describe, expect, it } from "vitest";
import request from "supertest";
import { startTestDb, stopTestDb } from "../test/mongoMemory.js";
import { createApp } from "../app.js";

beforeAll(startTestDb);
afterAll(stopTestDb);

describe("Admin auth", () => {
  it("allows credentialed cross-origin requests so the browser will send/store the session cookie", async () => {
    const res = await request(createApp())
      .post("/api/admin/login")
      .set("Origin", "http://localhost:5173")
      .send({ password: process.env.GROVE_ADMIN_PASSWORD });

    expect(res.headers["access-control-allow-origin"]).toBe("http://localhost:5173");
    expect(res.headers["access-control-allow-credentials"]).toBe("true");
  });

  it("sets a signed session cookie and returns ok when the password is correct", async () => {
    const res = await request(createApp())
      .post("/api/admin/login")
      .send({ password: process.env.GROVE_ADMIN_PASSWORD });

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ ok: true });
    const cookies = res.get("Set-Cookie") ?? [];
    expect(cookies.some((cookie) => cookie.startsWith("grove_admin_session="))).toBe(true);
  });

  it("returns an error and sets no cookie when the password is incorrect", async () => {
    const res = await request(createApp())
      .post("/api/admin/login")
      .send({ password: "wrong-password" });

    expect(res.status).toBe(401);
    expect(res.body).toEqual({ error: "Incorrect password" });
    expect(res.headers["set-cookie"]).toBeUndefined();
  });

  it("rejects a request to a protected admin route with no session cookie", async () => {
    const res = await request(createApp()).get("/api/admin/session");
    expect(res.status).toBe(401);
  });

  it("allows a request to a protected admin route with a valid session cookie", async () => {
    const app = createApp();
    const agent = request.agent(app);
    await agent.post("/api/admin/login").send({ password: process.env.GROVE_ADMIN_PASSWORD });

    const res = await agent.get("/api/admin/session");
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ authenticated: true });
  });

  it("clears the session cookie on logout", async () => {
    const app = createApp();
    const agent = request.agent(app);
    await agent.post("/api/admin/login").send({ password: process.env.GROVE_ADMIN_PASSWORD });

    const logoutRes = await agent.post("/api/admin/logout");
    expect(logoutRes.status).toBe(200);

    const sessionRes = await agent.get("/api/admin/session");
    expect(sessionRes.status).toBe(401);
  });
});
