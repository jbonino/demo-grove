import type { RewardOptionDTO } from "@grove/shared";
import { apiBaseUrl } from "./config";

export interface LoyaltyActivityEntry {
  orderId: string | null;
  date: string;
  pointsDelta: number;
  note: string | null;
}

export interface LoyaltyLookup {
  pointsBalance: number;
  lifetimeOrders: number;
  availableRewards: RewardOptionDTO[];
  activity: LoyaltyActivityEntry[];
}

export async function fetchLoyaltyLookup(phone: string): Promise<LoyaltyLookup | null> {
  const res = await fetch(`${apiBaseUrl}/api/loyalty/${encodeURIComponent(phone)}`);
  if (res.status === 404) {
    return null;
  }
  if (!res.ok) {
    throw new Error(`Failed to fetch loyalty lookup: ${res.status}`);
  }
  return res.json();
}
