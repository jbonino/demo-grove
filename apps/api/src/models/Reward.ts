import { Schema, model } from "mongoose";

export interface RewardDoc {
  name: string;
  description: string;
  pointsCost: number;
  discountAmountCents: number;
}

const rewardSchema = new Schema<RewardDoc>({
  name: { type: String, required: true },
  description: { type: String, required: true },
  pointsCost: { type: Number, required: true },
  discountAmountCents: { type: Number, required: true },
});

export const Reward = model<RewardDoc>("Reward", rewardSchema);
