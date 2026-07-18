import { Router } from "express";
import { Reward } from "../models/Reward.js";
import { Order } from "../models/Order.js";
import { LoyaltyEvent } from "../models/LoyaltyEvent.js";
import { getPointsBalance } from "../loyalty/balance.js";
import { toRewardOptionDTOs } from "../loyalty/rewardOptions.js";
import { asyncHandler } from "../asyncHandler.js";

export const loyaltyRouter = Router();

interface ActivityEntry {
  orderId: string | null;
  date: Date;
  pointsDelta: number;
  note: string | null;
}

async function getActivity(phone: string): Promise<ActivityEntry[]> {
  const events = await LoyaltyEvent.find({ phone }).sort({ createdAt: -1 });
  const orderIds = events.filter((event) => event.orderId).map((event) => event.orderId);
  const orders = await Order.find({ _id: { $in: orderIds } });
  const orderById = new Map(orders.map((order) => [order._id.toString(), order]));

  const grouped = new Map<string, ActivityEntry>();
  for (const event of events) {
    const order = event.orderId ? orderById.get(event.orderId.toString()) : undefined;
    const key = event.orderId ? event.orderId.toString() : event._id.toString();

    const existing = grouped.get(key);
    if (existing) {
      existing.pointsDelta += event.points;
      continue;
    }

    grouped.set(key, {
      orderId: event.orderId ? event.orderId.toString() : null,
      date: order ? order.createdAt : event.createdAt,
      pointsDelta: event.points,
      note: order?.rewardRedeemed ? `Redeemed ${order.rewardRedeemed.name}` : null,
    });
  }

  return [...grouped.values()].sort((a, b) => b.date.getTime() - a.date.getTime());
}

loyaltyRouter.get(
  "/:phone",
  asyncHandler(async (req, res) => {
    const phone = String(req.params.phone);

    const hasHistory = await LoyaltyEvent.exists({ phone });
    if (!hasHistory) {
      res.status(404).json({ error: "No rewards history found for this number" });
      return;
    }

    const [pointsBalance, lifetimeOrders, rewards, activity] = await Promise.all([
      getPointsBalance(phone),
      Order.countDocuments({ phone, status: "paid" }),
      Reward.find().sort({ pointsCost: 1 }),
      getActivity(phone),
    ]);

    res.json({
      pointsBalance,
      lifetimeOrders,
      availableRewards: toRewardOptionDTOs(rewards, pointsBalance),
      activity,
    });
  }),
);
