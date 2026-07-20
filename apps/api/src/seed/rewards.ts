import { Reward, type RewardDoc } from "../models/Reward.js";

export const seedRewardData: RewardDoc[] = [
  {
    name: "$10 off",
    description: "$10 off your order",
    pointsCost: 500,
    discountAmountCents: 1000,
  },
  {
    name: "$20 off",
    description: "$20 off your order",
    pointsCost: 900,
    discountAmountCents: 2000,
  },
];

export async function seedRewards(): Promise<void> {
  await Reward.deleteMany({});
  await Reward.insertMany(seedRewardData);
}
