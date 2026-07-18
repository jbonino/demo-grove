import { Router } from "express";
import type Stripe from "stripe";
import { Order } from "../models/Order.js";
import { LoyaltyEvent } from "../models/LoyaltyEvent.js";
import { getPointsBalance } from "../loyalty/balance.js";
import { getStripeClient, getStripeWebhookSecret } from "../stripeClient.js";
import { asyncHandler } from "../asyncHandler.js";

export const stripeWebhookRouter = Router();

interface OrderItemSnapshot {
  id: string;
  q: number;
  price: number;
}

stripeWebhookRouter.post(
  "/",
  asyncHandler(async (req, res) => {
    const signature = req.headers["stripe-signature"];
    const stripe = getStripeClient();

    let event: Stripe.Event;
    try {
      event = stripe.webhooks.constructEvent(
        req.body as Buffer,
        signature as string,
        getStripeWebhookSecret(),
      );
    } catch {
      res.status(400).send("Webhook signature verification failed");
      return;
    }

    if (event.type === "payment_intent.succeeded") {
      const paymentIntent = event.data.object as Stripe.PaymentIntent;

      const alreadyProcessed = await Order.findOne({ stripePaymentIntentId: paymentIntent.id });
      if (!alreadyProcessed) {
        const snapshotItems: OrderItemSnapshot[] = JSON.parse(paymentIntent.metadata.itemsJson);
        const phone = paymentIntent.metadata.phone;
        const rewardName = paymentIntent.metadata.rewardName || "";
        const rewardDiscountAmountCents = Number(paymentIntent.metadata.rewardDiscountAmountCents || 0);
        const rewardPointsCost = Number(paymentIntent.metadata.rewardPointsCost || 0);
        const pointsEarned = Math.ceil(paymentIntent.amount / 100);
        const priorBalance = await getPointsBalance(phone);
        const pointsBalanceAfter = priorBalance - rewardPointsCost + pointsEarned;

        const order = await Order.findOneAndUpdate(
          { stripePaymentIntentId: paymentIntent.id },
          {
            $setOnInsert: {
              items: snapshotItems.map((item) => ({
                menuItem: item.id,
                quantity: item.q,
                unitPriceCents: item.price,
              })),
              subtotalCents: Number(paymentIntent.metadata.subtotalCents),
              phone,
              pickup: {
                mode: paymentIntent.metadata.pickupMode,
                time: paymentIntent.metadata.pickupTime || null,
              },
              stripePaymentIntentId: paymentIntent.id,
              status: "paid",
              rewardRedeemed: rewardName ? { name: rewardName, discountAmountCents: rewardDiscountAmountCents } : null,
              pointsEarned,
              pointsBalanceAfter,
            },
          },
          { upsert: true, new: true },
        );

        if (rewardName) {
          await LoyaltyEvent.create({
            phone,
            orderId: order._id,
            type: "redeem",
            points: -rewardPointsCost,
          });
        }
        await LoyaltyEvent.create({
          phone,
          orderId: order._id,
          type: "earn",
          points: pointsEarned,
        });
      }
    }

    res.json({ received: true });
  }),
);
