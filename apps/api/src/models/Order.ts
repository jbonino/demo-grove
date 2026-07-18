import { Schema, model, Types } from "mongoose";

export type OrderStatus = "pending" | "paid" | "failed";
export type PickupMode = "asap" | "scheduled";

export interface OrderItem {
  menuItem: Types.ObjectId;
  quantity: number;
  unitPriceCents: number;
}

export interface OrderPickup {
  mode: PickupMode;
  time: string | null;
}

export interface OrderRewardRedeemed {
  name: string;
  discountAmountCents: number;
}

export interface OrderDoc {
  items: OrderItem[];
  subtotalCents: number;
  phone: string;
  pickup: OrderPickup;
  stripePaymentIntentId: string | null;
  status: OrderStatus;
  rewardRedeemed: OrderRewardRedeemed | null;
  pointsEarned: number;
  pointsBalanceAfter: number;
  createdAt: Date;
}

const orderItemSchema = new Schema<OrderItem>(
  {
    menuItem: { type: Schema.Types.ObjectId, ref: "MenuItem", required: true },
    quantity: { type: Number, required: true },
    unitPriceCents: { type: Number, required: true },
  },
  { _id: false },
);

const orderPickupSchema = new Schema<OrderPickup>(
  {
    mode: { type: String, enum: ["asap", "scheduled"], required: true },
    time: { type: String, default: null },
  },
  { _id: false },
);

const orderRewardRedeemedSchema = new Schema<OrderRewardRedeemed>(
  {
    name: { type: String, required: true },
    discountAmountCents: { type: Number, required: true },
  },
  { _id: false },
);

const orderSchema = new Schema<OrderDoc>({
  items: { type: [orderItemSchema], required: true },
  subtotalCents: { type: Number, required: true },
  phone: { type: String, required: true },
  pickup: { type: orderPickupSchema, required: true },
  stripePaymentIntentId: { type: String, default: null, unique: true, sparse: true },
  status: { type: String, enum: ["pending", "paid", "failed"], required: true, default: "pending" },
  rewardRedeemed: { type: orderRewardRedeemedSchema, default: null },
  pointsEarned: { type: Number, required: true, default: 0 },
  pointsBalanceAfter: { type: Number, required: true, default: 0 },
  createdAt: { type: Date, required: true, default: Date.now },
});

export const Order = model<OrderDoc>("Order", orderSchema);
