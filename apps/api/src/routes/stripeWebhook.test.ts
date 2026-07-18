import { afterAll, beforeAll, describe, expect, it } from "vitest";
import request from "supertest";
import Stripe from "stripe";
import { startTestDb, stopTestDb } from "../test/mongoMemory.js";
import { MenuItem } from "../models/MenuItem.js";
import { Order } from "../models/Order.js";
import { LoyaltyEvent } from "../models/LoyaltyEvent.js";
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

function paymentSucceededPayload(
  eventId: string,
  paymentIntentId: string,
  itemsJson: string,
  options: {
    amount?: number;
    subtotalCents?: number;
    phone?: string;
    rewardName?: string;
    rewardDiscountAmountCents?: number;
    rewardPointsCost?: number;
  } = {},
) {
  const amount = options.amount ?? 1600;
  return JSON.stringify({
    id: eventId,
    object: "event",
    type: "payment_intent.succeeded",
    data: {
      object: {
        id: paymentIntentId,
        object: "payment_intent",
        amount,
        metadata: {
          phone: options.phone ?? "+15551234567",
          pickupMode: "asap",
          pickupTime: "",
          itemsJson,
          subtotalCents: String(options.subtotalCents ?? amount),
          rewardName: options.rewardName ?? "",
          rewardDiscountAmountCents: String(options.rewardDiscountAmountCents ?? 0),
          rewardPointsCost: String(options.rewardPointsCost ?? 0),
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

describe("POST /api/stripe/webhook — loyalty events", () => {
  it("writes an earn LoyaltyEvent and sets pointsEarned/pointsBalanceAfter on the Order", async () => {
    const menuItem = await MenuItem.create({
      name: "Braised Short Rib",
      description: "desc",
      priceCents: 3450,
      category: "Entrées",
    });
    const itemsJson = JSON.stringify([{ id: menuItem._id.toString(), q: 1, price: 3450 }]);

    await signedWebhookRequest(
      paymentSucceededPayload("evt_earn_1", "pi_earn_1", itemsJson, {
        amount: 3450,
        subtotalCents: 3450,
        phone: "+15552220001",
      }),
    );

    const order = await Order.findOne({ stripePaymentIntentId: "pi_earn_1" });
    expect(order?.rewardRedeemed).toBeNull();
    expect(order?.pointsEarned).toBe(35); // ceil(3450 / 100)
    expect(order?.pointsBalanceAfter).toBe(35);

    const events = await LoyaltyEvent.find({ phone: "+15552220001" });
    expect(events).toHaveLength(1);
    expect(events[0].type).toBe("earn");
    expect(events[0].points).toBe(35);
    expect(events[0].orderId?.toString()).toBe(order?._id.toString());
  });

  it("writes both a redeem and an earn LoyaltyEvent when a reward was applied", async () => {
    const menuItem = await MenuItem.create({
      name: "Dry-Aged Ribeye",
      description: "desc",
      priceCents: 4800,
      category: "Entrées",
    });
    const itemsJson = JSON.stringify([{ id: menuItem._id.toString(), q: 1, price: 4800 }]);

    await LoyaltyEvent.create({
      phone: "+15552220002",
      orderId: null,
      type: "earn",
      points: 500,
    });

    await signedWebhookRequest(
      paymentSucceededPayload("evt_redeem_1", "pi_redeem_1", itemsJson, {
        amount: 3800,
        subtotalCents: 4800,
        phone: "+15552220002",
        rewardName: "$10 off",
        rewardDiscountAmountCents: 1000,
        rewardPointsCost: 500,
      }),
    );

    const order = await Order.findOne({ stripePaymentIntentId: "pi_redeem_1" });
    expect(order?.rewardRedeemed).toMatchObject({ name: "$10 off", discountAmountCents: 1000 });
    expect(order?.pointsEarned).toBe(38); // ceil(3800 / 100)
    expect(order?.pointsBalanceAfter).toBe(38); // prior 500 balance - 500 redeemed + 38 earned

    const events = await LoyaltyEvent.find({ phone: "+15552220002" }).sort({ createdAt: 1 });
    // pre-existing earn (500) + redeem + earn = 3 events total
    expect(events).toHaveLength(3);
    expect(events[1].type).toBe("redeem");
    expect(events[1].points).toBe(-500);
    expect(events[2].type).toBe("earn");
    expect(events[2].points).toBe(38);
  });

  it("is idempotent on webhook redelivery: no duplicate LoyaltyEvents", async () => {
    const menuItem = await MenuItem.create({
      name: "Wild Mushroom Risotto",
      description: "desc",
      priceCents: 2600,
      category: "Entrées",
    });
    const itemsJson = JSON.stringify([{ id: menuItem._id.toString(), q: 1, price: 2600 }]);

    const payload = paymentSucceededPayload("evt_earn_dup", "pi_earn_dup", itemsJson, {
      amount: 2600,
      subtotalCents: 2600,
      phone: "+15552220003",
    });

    await signedWebhookRequest(payload);
    await signedWebhookRequest(payload);

    const events = await LoyaltyEvent.find({ phone: "+15552220003" });
    expect(events).toHaveLength(1);
  });
});
