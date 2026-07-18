import type { RewardOptionDTO } from "@grove/shared";
import { apiBaseUrl } from "./config";

export interface RewardsLookup {
  balance: number | null;
  rewards: RewardOptionDTO[];
}

export async function fetchRewardsForPhone(phone: string): Promise<RewardsLookup> {
  const res = await fetch(`${apiBaseUrl}/api/rewards?phone=${encodeURIComponent(phone)}`);
  if (!res.ok) {
    throw new Error(`Failed to fetch rewards: ${res.status}`);
  }
  return res.json();
}
