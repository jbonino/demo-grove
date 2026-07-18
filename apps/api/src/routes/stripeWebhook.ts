import { Router } from "express";
import type Stripe from "stripe";
import { Order } from "../models/Order.js";
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
      const snapshotItems: OrderItemSnapshot[] = JSON.parse(paymentIntent.metadata.itemsJson);

      await Order.findOneAndUpdate(
        { stripePaymentIntentId: paymentIntent.id },
        {
          $setOnInsert: {
            items: snapshotItems.map((item) => ({
              menuItem: item.id,
              quantity: item.q,
              unitPriceCents: item.price,
            })),
            subtotalCents: paymentIntent.amount,
            phone: paymentIntent.metadata.phone,
            pickup: {
              mode: paymentIntent.metadata.pickupMode,
              time: paymentIntent.metadata.pickupTime || null,
            },
            stripePaymentIntentId: paymentIntent.id,
            status: "paid",
          },
        },
        { upsert: true, new: true },
      );
    }

    res.json({ received: true });
  }),
);
