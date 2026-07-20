import { describe, expect, it } from "vitest";
import { requiresAdminAuth } from "./adminGuard";

describe("requiresAdminAuth", () => {
  it("does not require auth for the admin login page", () => {
    expect(requiresAdminAuth("/admin/login")).toBe(false);
  });

  it("requires auth for the admin dashboard", () => {
    expect(requiresAdminAuth("/admin")).toBe(true);
  });

  it("requires auth for nested admin routes", () => {
    expect(requiresAdminAuth("/admin/customers")).toBe(true);
  });

  it("does not require auth for non-admin routes", () => {
    expect(requiresAdminAuth("/checkout")).toBe(false);
  });
});
