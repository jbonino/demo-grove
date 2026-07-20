import { Order } from "../models/Order.js";

const PAGE_SIZE = 20;

export interface OrderRow {
  id: string;
  customerName: string;
  createdAt: Date;
  totalCents: number;
  status: "Completed";
}

export interface OrderListResult {
  orders: OrderRow[];
  page: number;
  totalPages: number;
}

interface OrderListOptions {
  page?: number;
}

function orderTotalCents(order: { subtotalCents: number; rewardRedeemed: { discountAmountCents: number } | null }) {
  return order.subtotalCents - (order.rewardRedeemed?.discountAmountCents ?? 0);
}

export async function getOrderList(options: OrderListOptions): Promise<OrderListResult> {
  const page = options.page ?? 1;

  const [totalCount, orders] = await Promise.all([
    Order.countDocuments({ status: "paid" }),
    Order.find({ status: "paid" })
      .sort({ createdAt: -1 })
      .skip((page - 1) * PAGE_SIZE)
      .limit(PAGE_SIZE),
  ]);

  return {
    orders: orders.map((order) => ({
      id: order._id.toString(),
      customerName: order.customerName ?? "Guest",
      createdAt: order.createdAt,
      totalCents: orderTotalCents(order),
      status: "Completed",
    })),
    page,
    totalPages: Math.max(1, Math.ceil(totalCount / PAGE_SIZE)),
  };
}
