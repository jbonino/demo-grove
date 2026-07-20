import { afterEach, describe, expect, it, vi } from "vitest";
import { adminLogin, adminLogout, checkAdminSession } from "./admin";

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
