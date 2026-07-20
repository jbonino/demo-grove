import { afterEach, describe, expect, it, vi } from "vitest";
import { adminLogin, adminLogout, checkAdminSession, fetchDashboardStats, fetchCustomers, fetchOrders, fetchOrderDetail } from "./admin";

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

describe("fetchCustomers", () => {
  it("requests customers with credentials included, passing search and page as query params", async () => {
    const result = { customers: [], page: 1, totalPages: 1 };
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, json: () => Promise.resolve(result) });
    vi.stubGlobal("fetch", fetchMock);

    const response = await fetchCustomers({ search: "jane", page: 2 });

    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringMatching(/\/api\/admin\/customers\?.*search=jane.*page=2|\/api\/admin\/customers\?.*page=2.*search=jane/),
      expect.objectContaining({ credentials: "include" }),
    );
    expect(response).toEqual(result);
  });

  it("omits query params that are not provided", async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, json: () => Promise.resolve({ customers: [], page: 1, totalPages: 1 }) });
    vi.stubGlobal("fetch", fetchMock);

    await fetchCustomers({});

    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringMatching(/\/api\/admin\/customers(\?)?$/),
      expect.objectContaining({ credentials: "include" }),
    );
  });

  it("throws when the request fails", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: false, status: 401 }));
    await expect(fetchCustomers({})).rejects.toThrow(/Failed to fetch customers/);
  });
});

describe("fetchOrders", () => {
  it("requests orders with credentials included, passing page as a query param", async () => {
    const result = { orders: [], page: 2, totalPages: 3 };
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, json: () => Promise.resolve(result) });
    vi.stubGlobal("fetch", fetchMock);

    const response = await fetchOrders({ page: 2 });

    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining("/api/admin/orders?page=2"),
      expect.objectContaining({ credentials: "include" }),
    );
    expect(response).toEqual(result);
  });

  it("throws when the request fails", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: false, status: 401 }));
    await expect(fetchOrders({})).rejects.toThrow(/Failed to fetch orders/);
  });
});

describe("fetchOrderDetail", () => {
  it("requests order detail by id with credentials included", async () => {
    const detail = {
      id: "order1",
      customerName: "Jane Doe",
      phone: "+15551234567",
      createdAt: "2026-07-20T17:00:00.000Z",
      items: [{ name: "Burger", quantity: 2, unitPriceCents: 1200 }],
      totalCents: 2400,
      pointsEarned: 24,
      status: "Completed",
    };
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, json: () => Promise.resolve(detail) });
    vi.stubGlobal("fetch", fetchMock);

    const response = await fetchOrderDetail("order1");

    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining("/api/admin/orders/order1"),
      expect.objectContaining({ credentials: "include" }),
    );
    expect(response).toEqual(detail);
  });

  it("throws when the request fails", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: false, status: 404 }));
    await expect(fetchOrderDetail("missing")).rejects.toThrow(/Failed to fetch order detail/);
  });
});
