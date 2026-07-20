import { Router } from "express";
import { MenuItem } from "../models/MenuItem.js";
import { Order } from "../models/Order.js";
import { Reward } from "../models/Reward.js";
import { getPointsBalance } from "../loyalty/balance.js";
import { getStripeClient } from "../stripeClient.js";
import { asyncHandler } from "../asyncHandler.js";

export const ordersRouter = Router();

interface CreateOrderBody {
  items?: { itemId: string; quantity: number }[];
  phone?: string;
  name?: string;
  pickup?: { mode: "asap" | "scheduled"; time: string | null };
  rewardId?: string;
}

ordersRouter.post(
  "/",
  asyncHandler(async (req, res) => {
    const body = req.body as CreateOrderBody;

    if (!body.items?.length) {
      res.status(400).json({ error: "Cart is empty" });
      return;
    }
    if (!body.phone) {
      res.status(400).json({ error: "Phone is required" });
      return;
    }
    if (!body.pickup?.mode) {
      res.status(400).json({ error: "Pickup mode is required" });
      return;
    }

    const menuItems = await MenuItem.find({ _id: { $in: body.items.map((line) => line.itemId) } });
    const priceById = new Map(menuItems.map((item) => [item._id.toString(), item.priceCents]));

    const snapshotItems: { id: string; q: number; price: number }[] = [];
    for (const line of body.items) {
      const priceCents = priceById.get(line.itemId);
      if (priceCents === undefined || line.quantity < 1) {
        res.status(400).json({ error: `Invalid cart item: ${line.itemId}` });
        return;
      }
      snapshotItems.push({ id: line.itemId, q: line.quantity, price: priceCents });
    }

    const subtotalCents = snapshotItems.reduce((sum, item) => sum + item.price * item.q, 0);

    let rewardName = "";
    let rewardDiscountAmountCents = 0;
    let rewardPointsCost = 0;
    if (body.rewardId) {
      const reward = await Reward.findById(body.rewardId);
      if (!reward) {
        res.status(400).json({ error: "Unknown reward" });
        return;
      }
      const balance = await getPointsBalance(body.phone);
      if (balance < reward.pointsCost) {
        res.status(400).json({ error: "Insufficient points for this reward" });
        return;
      }
      rewardName = reward.name;
      rewardDiscountAmountCents = reward.discountAmountCents;
      rewardPointsCost = reward.pointsCost;
    }

    const discountedSubtotalCents = Math.max(subtotalCents - rewardDiscountAmountCents, 0);

    const stripe = getStripeClient();
    const paymentIntent = await stripe.paymentIntents.create({
      amount: discountedSubtotalCents,
      currency: "usd",
      metadata: {
        phone: body.phone,
        customerName: body.name?.trim() ?? "",
        pickupMode: body.pickup.mode,
        pickupTime: body.pickup.time ?? "",
        itemsJson: JSON.stringify(snapshotItems),
        subtotalCents: String(subtotalCents),
        rewardName,
        rewardDiscountAmountCents: String(rewardDiscountAmountCents),
        rewardPointsCost: String(rewardPointsCost),
      },
    });

    res.status(201).json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
      subtotalCents,
      discountedSubtotalCents,
    });
  }),
);

ordersRouter.get(
  "/by-payment-intent/:paymentIntentId",
  asyncHandler(async (req, res) => {
    const order = await Order.findOne({ stripePaymentIntentId: req.params.paymentIntentId });
    if (!order) {
      res.status(404).json({ error: "Order not found" });
      return;
    }
    res.json({
      id: order._id.toString(),
      subtotalCents: order.subtotalCents,
      phone: order.phone,
      pickup: order.pickup,
      status: order.status,
      rewardRedeemed: order.rewardRedeemed,
      pointsEarned: order.pointsEarned,
      pointsBalanceAfter: order.pointsBalanceAfter,
      createdAt: order.createdAt,
    });
  }),
);
