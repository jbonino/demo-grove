import { Schema, model, Types } from "mongoose";

export type LoyaltyEventType = "earn" | "redeem";

export interface LoyaltyEventDoc {
  phone: string;
  orderId: Types.ObjectId | null;
  type: LoyaltyEventType;
  points: number;
  createdAt: Date;
}

const loyaltyEventSchema = new Schema<LoyaltyEventDoc>({
  phone: { type: String, required: true },
  orderId: { type: Schema.Types.ObjectId, ref: "Order", default: null },
  type: { type: String, enum: ["earn", "redeem"], required: true },
  points: { type: Number, required: true },
  createdAt: { type: Date, required: true, default: Date.now },
});

export const LoyaltyEvent = model<LoyaltyEventDoc>("LoyaltyEvent", loyaltyEventSchema);
