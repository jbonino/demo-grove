import type { HydratedDocument } from "mongoose";
import type { RewardOptionDTO } from "@grove/shared";
import type { RewardDoc } from "../models/Reward.js";

export function toRewardOptionDTOs(
  rewards: HydratedDocument<RewardDoc>[],
  balance: number,
): RewardOptionDTO[] {
  return rewards.map((reward) => ({
    id: reward._id.toString(),
    name: reward.name,
    description: reward.description,
    pointsCost: reward.pointsCost,
    discountAmountCents: reward.discountAmountCents,
    unlocked: balance >= reward.pointsCost,
    pointsNeeded: Math.max(reward.pointsCost - balance, 0),
  }));
}
