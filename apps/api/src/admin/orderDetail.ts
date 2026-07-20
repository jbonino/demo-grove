import { Order } from "../models/Order.js";
import { MenuItem } from "../models/MenuItem.js";

export interface OrderDetailItem {
  name: string;
  quantity: number;
  unitPriceCents: number;
}

export interface OrderDetail {
  id: string;
  customerName: string;
  phone: string;
  createdAt: Date;
  items: OrderDetailItem[];
  totalCents: number;
  pointsEarned: number;
  status: "Completed";
}

export async function getOrderDetail(id: string): Promise<OrderDetail | null> {
  const order = await Order.findOne({ _id: id, status: "paid" });
  if (!order) {
    return null;
  }

  const menuItems = await MenuItem.find({ _id: { $in: order.items.map((line) => line.menuItem) } });
  const nameById = new Map(menuItems.map((item) => [item._id.toString(), item.name]));

  const totalCents = order.subtotalCents - (order.rewardRedeemed?.discountAmountCents ?? 0);

  return {
    id: order._id.toString(),
    customerName: order.customerName ?? "Guest",
    phone: order.phone,
    createdAt: order.createdAt,
    items: order.items.map((line) => ({
      name: nameById.get(line.menuItem.toString()) ?? "Unknown item",
      quantity: line.quantity,
      unitPriceCents: line.unitPriceCents,
    })),
    totalCents,
    pointsEarned: order.pointsEarned,
    status: "Completed",
  };
}
