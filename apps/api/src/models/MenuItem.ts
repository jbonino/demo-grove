import { Schema, model } from "mongoose";

export interface MenuItemDoc {
  name: string;
  description: string;
  priceCents: number;
  category: string;
  imageUrl?: string;
}

const menuItemSchema = new Schema<MenuItemDoc>({
  name: { type: String, required: true },
  description: { type: String, required: true },
  priceCents: { type: Number, required: true },
  category: { type: String, required: true },
  imageUrl: { type: String, required: false },
});

export const MenuItem = model<MenuItemDoc>("MenuItem", menuItemSchema);
