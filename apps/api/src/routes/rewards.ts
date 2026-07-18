import { Router } from "express";
import type { RewardDTO } from "@grove/shared";
import { Reward } from "../models/Reward.js";

export const rewardsRouter = Router();

rewardsRouter.get("/", async (_req, res) => {
  const rewards = await Reward.find().sort({ pointsCost: 1 });
  const dtos: RewardDTO[] = rewards.map((reward) => ({
    id: reward._id.toString(),
    name: reward.name,
    description: reward.description,
    pointsCost: reward.pointsCost,
    discountAmountCents: reward.discountAmountCents,
  }));
  res.json(dtos);
});
