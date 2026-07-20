import { MenuItem } from "../models/MenuItem.js";
import { Reward } from "../models/Reward.js";
import { Order } from "../models/Order.js";
import { LoyaltyEvent } from "../models/LoyaltyEvent.js";

export const CUSTOMER_COUNT = 35;

const SEED_PAYMENT_INTENT_PREFIX = "pi_seed_";

const FIRST_NAMES = [
  "Ava", "Liam", "Maya", "Noah", "Zoe", "Ethan", "Ivy", "Owen",
  "Nora", "Leo", "Ruby", "Milo", "Jade", "Kai", "Elena", "Theo",
];
const LAST_NAMES = [
  "Bennett", "Carter", "Diaz", "Foster", "Grant", "Hayes", "Ito",
  "Jensen", "Kwan", "Lopez", "Moore", "Nguyen", "Ortiz", "Park",
];

function phoneForCustomer(index: number): string {
  return `+1555${String(2000000 + index).padStart(7, "0")}`;
}

function nameForCustomer(index: number): string | null {
  // Leave roughly 1 in 6 customers without a name, matching real checkout usage
  // where the field is optional and sometimes skipped.
  if (index % 6 === 0) {
    return null;
  }
  const first = FIRST_NAMES[index % FIRST_NAMES.length];
  const last = LAST_NAMES[(index * 3) % LAST_NAMES.length];
  return `${first} ${last}`;
}

export async function seedLoyaltyHistory(): Promise<void> {
  await Order.deleteMany({ stripePaymentIntentId: { $regex: `^${SEED_PAYMENT_INTENT_PREFIX}` } });
  await LoyaltyEvent.deleteMany({});

  const menuItems = await MenuItem.find();
  const rewards = await Reward.find().sort({ pointsCost: 1 });
  if (!menuItems.length || !rewards.length) {
    throw new Error("seedLoyaltyHistory requires MenuItems and Rewards to be seeded first");
  }
  const cheapestReward = rewards[0];

  for (let i = 0; i < CUSTOMER_COUNT; i++) {
    const phone = phoneForCustomer(i);
    const customerName = nameForCustomer(i);
    const orderCount = 1 + (i % 5);
    let balance = 0;

    for (let o = 0; o < orderCount; o++) {
      const item = menuItems[(i + o) % menuItems.length];
      const quantity = 1 + ((i + o) % 3);
      const subtotalCents = item.priceCents * quantity;
      const pointsEarned = Math.ceil(subtotalCents / 100);

      const order = await Order.create({
        items: [{ menuItem: item._id, quantity, unitPriceCents: item.priceCents }],
        subtotalCents,
        phone,
        customerName,
        pickup: { mode: "asap", time: null },
        stripePaymentIntentId: `${SEED_PAYMENT_INTENT_PREFIX}${phone}_${o}`,
        status: "paid",
        pointsEarned,
      });
      await LoyaltyEvent.create({ phone, orderId: order._id, type: "earn", points: pointsEarned });
      balance += pointsEarned;

      const isLastOrderForCustomer = o === orderCount - 1;
      const shouldSimulatePastRedemption = i % 4 === 0 && isLastOrderForCustomer;
      if (shouldSimulatePastRedemption) {
        if (balance < cheapestReward.pointsCost) {
          const topUp = cheapestReward.pointsCost - balance;
          await LoyaltyEvent.create({ phone, orderId: order._id, type: "earn", points: topUp });
          balance += topUp;
        }
        await LoyaltyEvent.create({
          phone,
          orderId: order._id,
          type: "redeem",
          points: -cheapestReward.pointsCost,
        });
        balance -= cheapestReward.pointsCost;
        await Order.findByIdAndUpdate(order._id, {
          rewardRedeemed: {
            name: cheapestReward.name,
            discountAmountCents: cheapestReward.discountAmountCents,
          },
        });
      }
    }

    const shouldSitNearThreshold = i % 5 === 0;
    if (shouldSitNearThreshold) {
      const target = Math.max(cheapestReward.pointsCost - 10, 1);
      const adjustment = target - balance;
      if (adjustment !== 0) {
        await LoyaltyEvent.create({
          phone,
          orderId: null,
          type: adjustment > 0 ? "earn" : "redeem",
          points: adjustment,
        });
      }
    }
  }
}
