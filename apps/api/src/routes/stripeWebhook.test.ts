import { afterAll, beforeAll, describe, expect, it } from "vitest";
import request from "supertest";
import Stripe from "stripe";
import { startTestDb, stopTestDb } from "../test/mongoMemory.js";
import { MenuItem } from "../models/MenuItem.js";
import { Order } from "../models/Order.js";
import { createApp } from "../app.js";

beforeAll(startTestDb);
afterAll(stopTestDb);

function signedWebhookRequest(payload: string) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET as string;
  const header = Stripe.webhooks.generateTestHeaderString({ payload, secret });
  return request(createApp())
    .post("/api/stripe/webhook")
    .set("stripe-signature", header)
    .type("application/json")
    .send(payload);
}

function paymentSucceededPayload(eventId: string, paymentIntentId: string, itemsJson: string) {
  return JSON.stringify({
    id: eventId,
    object: "event",
    type: "payment_intent.succeeded",
    data: {
      object: {
        id: paymentIntentId,
        object: "payment_intent",
        amount: 1600,
        metadata: {
          phone: "+15551234567",
          pickupMode: "asap",
          pickupTime: "",
          itemsJson,
        },
      },
    },
  });
}

describe("POST /api/stripe/webhook", () => {
  it("creates a paid Order on payment_intent.succeeded with a valid signature", async () => {
    const menuItem = await MenuItem.create({
      name: "Burrata & Heirloom Tomato",
      description: "desc",
      priceCents: 1600,
      category: "Starters",
    });
    const itemsJson = JSON.stringify([{ id: menuItem._id.toString(), q: 1, price: 1600 }]);

    const res = await signedWebhookRequest(
      paymentSucceededPayload("evt_test_1", "pi_test_1", itemsJson),
    );

    expect(res.status).toBe(200);

    const order = await Order.findOne({ stripePaymentIntentId: "pi_test_1" });
    expect(order?.status).toBe("paid");
    expect(order?.phone).toBe("+15551234567");
    expect(order?.subtotalCents).toBe(1600);
    expect(order?.items).toHaveLength(1);
  });

  it("is idempotent on webhook redelivery for the same PaymentIntent", async () => {
    const menuItem = await MenuItem.create({
      name: "Tuna Tartare",
      description: "desc",
      priceCents: 1900,
      category: "Starters",
    });
    const itemsJson = JSON.stringify([{ id: menuItem._id.toString(), q: 1, price: 1900 }]);

    await signedWebhookRequest(paymentSucceededPayload("evt_test_2a", "pi_test_2", itemsJson));
    await signedWebhookRequest(paymentSucceededPayload("evt_test_2b", "pi_test_2", itemsJson));

    const count = await Order.countDocuments({ stripePaymentIntentId: "pi_test_2" });
    expect(count).toBe(1);
  });

  it("rejects a request with an invalid signature", async () => {
    const payload = paymentSucceededPayload("evt_bad", "pi_bad", "[]");
    const res = await request(createApp())
      .post("/api/stripe/webhook")
      .set("stripe-signature", "t=1,v1=not_a_real_signature")
      .type("application/json")
      .send(payload);

    expect(res.status).toBe(400);
    const order = await Order.findOne({ stripePaymentIntentId: "pi_bad" });
    expect(order).toBeNull();
  });
});
