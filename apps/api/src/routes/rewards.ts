import { Router } from "express";
import type { RewardOptionDTO } from "@grove/shared";
import { Reward } from "../models/Reward.js";
import { getPointsBalance } from "../loyalty/balance.js";

export const rewardsRouter = Router();

rewardsRouter.get("/", async (req, res) => {
  const phone = typeof req.query.phone === "string" ? req.query.phone : null;
  const balance = phone ? await getPointsBalance(phone) : null;

  const rewards = await Reward.find().sort({ pointsCost: 1 });
  const dtos: RewardOptionDTO[] = rewards.map((reward) => ({
    id: reward._id.toString(),
    name: reward.name,
    description: reward.description,
    pointsCost: reward.pointsCost,
    discountAmountCents: reward.discountAmountCents,
    unlocked: balance !== null && balance >= reward.pointsCost,
    pointsNeeded: Math.max(reward.pointsCost - (balance ?? 0), 0),
  }));

  res.json({ balance, rewards: dtos });
});
