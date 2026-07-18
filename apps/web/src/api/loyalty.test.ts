import { afterEach, describe, expect, it, vi } from "vitest";
import { fetchLoyaltyLookup } from "./loyalty";

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("fetchLoyaltyLookup", () => {
  it("requests the loyalty lookup for a phone and returns the parsed body", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: () =>
        Promise.resolve({
          pointsBalance: 400,
          lifetimeOrders: 3,
          availableRewards: [],
          activity: [],
        }),
    });
    vi.stubGlobal("fetch", fetchMock);

    const result = await fetchLoyaltyLookup("+15551234567");

    expect(fetchMock).toHaveBeenCalledWith(expect.stringContaining("/api/loyalty/%2B15551234567"));
    expect(result).toMatchObject({ pointsBalance: 400, lifetimeOrders: 3 });
  });

  it("returns null when the phone has no history (404)", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: false, status: 404 }));

    const result = await fetchLoyaltyLookup("+15550000000");

    expect(result).toBeNull();
  });

  it("throws for unexpected failures", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: false, status: 500 }));

    await expect(fetchLoyaltyLookup("+15551234567")).rejects.toThrow(/Failed to fetch loyalty lookup/);
  });
});
