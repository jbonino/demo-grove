import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createPinia, setActivePinia } from "pinia";
import * as adminApi from "../api/admin";
import { useAdminAuthStore } from "./adminAuth";

beforeEach(() => {
  setActivePinia(createPinia());
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("adminAuth store", () => {
  it("starts with unknown authentication state", () => {
    const store = useAdminAuthStore();
    expect(store.isAuthenticated).toBeNull();
  });

  it("sets isAuthenticated true after a successful login", async () => {
    vi.spyOn(adminApi, "adminLogin").mockResolvedValue();
    const store = useAdminAuthStore();

    await store.login("correct-password");

    expect(store.isAuthenticated).toBe(true);
  });

  it("leaves isAuthenticated falsy and rethrows when login fails", async () => {
    vi.spyOn(adminApi, "adminLogin").mockRejectedValue(new Error("Incorrect password"));
    const store = useAdminAuthStore();

    await expect(store.login("wrong-password")).rejects.toThrow("Incorrect password");
    expect(store.isAuthenticated).not.toBe(true);
  });

  it("sets isAuthenticated false after logout", async () => {
    vi.spyOn(adminApi, "adminLogin").mockResolvedValue();
    vi.spyOn(adminApi, "adminLogout").mockResolvedValue();
    const store = useAdminAuthStore();
    await store.login("correct-password");

    await store.logout();

    expect(store.isAuthenticated).toBe(false);
  });

  it("hydrates isAuthenticated from the session-check endpoint", async () => {
    vi.spyOn(adminApi, "checkAdminSession").mockResolvedValue(true);
    const store = useAdminAuthStore();

    const result = await store.checkSession();

    expect(result).toBe(true);
    expect(store.isAuthenticated).toBe(true);
  });
});
