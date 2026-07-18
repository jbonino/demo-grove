import { Schema, model, Types } from "mongoose";

export type OrderStatus = "pending" | "paid" | "failed";

export interface OrderItem {
  menuItem: Types.ObjectId;
  quantity: number;
  unitPriceCents: number;
}

export interface OrderDoc {
  items: OrderItem[];
  subtotalCents: number;
  phone: string;
  stripePaymentIntentId: string | null;
  status: OrderStatus;
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

const orderSchema = new Schema<OrderDoc>({
  items: { type: [orderItemSchema], required: true },
  subtotalCents: { type: Number, required: true },
  phone: { type: String, required: true },
  stripePaymentIntentId: { type: String, default: null },
  status: { type: String, enum: ["pending", "paid", "failed"], required: true, default: "pending" },
  createdAt: { type: Date, required: true, default: Date.now },
});

export const Order = model<OrderDoc>("Order", orderSchema);
