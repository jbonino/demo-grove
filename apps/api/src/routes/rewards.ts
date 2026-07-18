import { Router } from "express";
import { Reward } from "../models/Reward.js";
import { getPointsBalance } from "../loyalty/balance.js";
import { toRewardOptionDTOs } from "../loyalty/rewardOptions.js";

export const rewardsRouter = Router();

rewardsRouter.get("/", async (req, res) => {
  const phone = typeof req.query.phone === "string" ? req.query.phone : null;
  const balance = phone ? await getPointsBalance(phone) : null;

  const rewards = await Reward.find().sort({ pointsCost: 1 });
  const dtos = toRewardOptionDTOs(rewards, balance ?? 0);

  res.json({ balance, rewards: dtos });
});
