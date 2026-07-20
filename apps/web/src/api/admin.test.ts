import { afterEach, describe, expect, it, vi } from "vitest";
import { adminLogin, adminLogout, checkAdminSession, fetchDashboardStats } from "./admin";

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("adminLogin", () => {
  it("posts the password with credentials included and resolves on success", async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, json: () => Promise.resolve({ ok: true }) });
    vi.stubGlobal("fetch", fetchMock);

    await adminLogin("correct-password");

    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining("/api/admin/login"),
      expect.objectContaining({
        method: "POST",
        credentials: "include",
        body: JSON.stringify({ password: "correct-password" }),
      }),
    );
  });

  it("throws with the server's error message when the password is wrong", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: false,
      status: 401,
      json: () => Promise.resolve({ error: "Incorrect password" }),
    });
    vi.stubGlobal("fetch", fetchMock);

    await expect(adminLogin("wrong-password")).rejects.toThrow("Incorrect password");
  });
});

describe("adminLogout", () => {
  it("posts to the logout endpoint with credentials included", async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, json: () => Promise.resolve({ ok: true }) });
    vi.stubGlobal("fetch", fetchMock);

    await adminLogout();

    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining("/api/admin/logout"),
      expect.objectContaining({ method: "POST", credentials: "include" }),
    );
  });
});

describe("checkAdminSession", () => {
  it("returns true when the session endpoint responds ok", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: true }));
    expect(await checkAdminSession()).toBe(true);
  });

  it("returns false when the session endpoint responds unauthorized", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: false, status: 401 }));
    expect(await checkAdminSession()).toBe(false);
  });
});

describe("fetchDashboardStats", () => {
  it("requests dashboard stats with credentials included and returns them", async () => {
    const stats = {
      ordersToday: 4,
      ordersTodayDelta: 1,
      revenueTodayCents: 5000,
      revenueTodayDeltaCents: 1000,
      pointsIssued7d: 300,
      pointsRedeemed7d: 2,
      signups7d: 3,
      ordersOutOf7d: 12,
      recentOrders: [],
    };
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, json: () => Promise.resolve(stats) });
    vi.stubGlobal("fetch", fetchMock);

    const result = await fetchDashboardStats();

    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining("/api/admin/dashboard"),
      expect.objectContaining({ credentials: "include" }),
    );
    expect(result).toEqual(stats);
  });

  it("throws when the request fails", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: false, status: 401 }));
    await expect(fetchDashboardStats()).rejects.toThrow(/Failed to fetch dashboard stats/);
  });
});
