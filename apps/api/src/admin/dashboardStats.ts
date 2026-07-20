import { Order } from "../models/Order.js";
import { LoyaltyEvent } from "../models/LoyaltyEvent.js";

const RECENT_ORDERS_LIMIT = 5;
const DAY_MS = 24 * 60 * 60 * 1000;

export interface RecentOrder {
  id: string;
  customerName: string;
  createdAt: Date;
  totalCents: number;
  status: "Completed";
}

export interface DashboardStats {
  ordersToday: number;
  ordersTodayDelta: number;
  revenueTodayCents: number;
  revenueTodayDeltaCents: number;
  pointsIssued7d: number;
  pointsRedeemed7d: number;
  signups7d: number;
  ordersOutOf7d: number;
  recentOrders: RecentOrder[];
}

function startOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function orderTotalCents(order: { subtotalCents: number; rewardRedeemed: { discountAmountCents: number } | null }) {
  return order.subtotalCents - (order.rewardRedeemed?.discountAmountCents ?? 0);
}

async function ordersAndRevenueBetween(start: Date, end: Date) {
  const orders = await Order.find({
    status: "paid",
    createdAt: { $gte: start, $lt: end },
  });
  return {
    count: orders.length,
    revenueCents: orders.reduce((sum, order) => sum + orderTotalCents(order), 0),
  };
}

export async function getDashboardStats(now: Date = new Date()): Promise<DashboardStats> {
  const todayStart = startOfDay(now);
  const yesterdayStart = new Date(todayStart.getTime() - DAY_MS);
  const sevenDaysAgo = new Date(now.getTime() - 7 * DAY_MS);

  const [today, yesterday] = await Promise.all([
    ordersAndRevenueBetween(todayStart, now),
    ordersAndRevenueBetween(yesterdayStart, todayStart),
  ]);

  const [earnAgg, redeemCount, signupAgg, ordersOutOf7d, recentOrders] = await Promise.all([
    LoyaltyEvent.aggregate<{ total: number }>([
      { $match: { type: "earn", createdAt: { $gte: sevenDaysAgo } } },
      { $group: { _id: null, total: { $sum: "$points" } } },
    ]),
    LoyaltyEvent.countDocuments({ type: "redeem", createdAt: { $gte: sevenDaysAgo } }),
    Order.aggregate<{ _id: string; firstOrderAt: Date }>([
      { $match: { status: "paid" } },
      { $group: { _id: "$phone", firstOrderAt: { $min: "$createdAt" } } },
      { $match: { firstOrderAt: { $gte: sevenDaysAgo } } },
    ]),
    Order.countDocuments({ status: "paid", createdAt: { $gte: sevenDaysAgo } }),
    Order.find({ status: "paid" }).sort({ createdAt: -1 }).limit(RECENT_ORDERS_LIMIT),
  ]);

  return {
    ordersToday: today.count,
    ordersTodayDelta: today.count - yesterday.count,
    revenueTodayCents: today.revenueCents,
    revenueTodayDeltaCents: today.revenueCents - yesterday.revenueCents,
    pointsIssued7d: earnAgg[0]?.total ?? 0,
    pointsRedeemed7d: redeemCount,
    signups7d: signupAgg.length,
    ordersOutOf7d,
    recentOrders: recentOrders.map((order) => ({
      id: order._id.toString(),
      customerName: order.customerName ?? "Guest",
      createdAt: order.createdAt,
      totalCents: orderTotalCents(order),
      status: "Completed",
    })),
  };
}
