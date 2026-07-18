import { LoyaltyEvent } from "../models/LoyaltyEvent.js";

export async function getPointsBalance(phone: string): Promise<number> {
  const result = await LoyaltyEvent.aggregate<{ total: number }>([
    { $match: { phone } },
    { $group: { _id: null, total: { $sum: "$points" } } },
  ]);
  return result[0]?.total ?? 0;
}
