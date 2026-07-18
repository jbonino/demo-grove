import { afterEach, describe, expect, it, vi } from "vitest";
import { fetchRewardsForPhone } from "./rewards";

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("fetchRewardsForPhone", () => {
  it("requests the rewards catalog for a phone and returns balance + rewards", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: () =>
        Promise.resolve({
          balance: 400,
          rewards: [
            {
              id: "r1",
              name: "Free Flatbread",
              description: "desc",
              pointsCost: 300,
              discountAmountCents: 1200,
              unlocked: true,
              pointsNeeded: 0,
            },
          ],
        }),
    });
    vi.stubGlobal("fetch", fetchMock);

    const result = await fetchRewardsForPhone("+15551234567");

    expect(fetchMock).toHaveBeenCalledWith(expect.stringContaining("/api/rewards?phone=%2B15551234567"));
    expect(result.balance).toBe(400);
    expect(result.rewards).toHaveLength(1);
    expect(result.rewards[0].unlocked).toBe(true);
  });

  it("throws when the request fails", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: false, status: 500 }));

    await expect(fetchRewardsForPhone("+15551234567")).rejects.toThrow(/Failed to fetch rewards/);
  });
});
