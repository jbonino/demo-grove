<script setup lang="ts">
import { computed, ref } from "vue";
import { useRouter } from "vue-router";
import type { Stripe, StripeCardElement, StripeElements } from "@stripe/stripe-js";
import { useCartStore } from "../stores/cart";
import { createOrder, pollForOrder } from "../api/orders";
import AppHeader from "../components/AppHeader.vue";
import OrderSummaryCard from "../components/OrderSummaryCard.vue";
import PaymentCardInput from "../components/PaymentCardInput.vue";

const cart = useCartStore();
const router = useRouter();

const name = ref("");
const phone = ref("");
const pickupMode = ref<"asap" | "scheduled">("asap");
const pickupTime = ref("");

const submitting = ref(false);
const errorMessage = ref("");

let stripe: Stripe | undefined;
let cardElement: StripeCardElement | undefined;

function onCardReady(readyStripe: Stripe, _elements: StripeElements, readyCard: StripeCardElement) {
  stripe = readyStripe;
  cardElement = readyCard;
}

const itemized = computed(() =>
  cart.lines.map((line) => ({ name: line.name, quantity: line.quantity, unitPrice: line.unitPrice })),
);

async function placeOrder() {
  errorMessage.value = "";

  if (!name.value.trim() || !phone.value.trim()) {
    errorMessage.value = "Please enter your name and phone number.";
    return;
  }
  if (pickupMode.value === "scheduled" && !pickupTime.value) {
    errorMessage.value = "Please choose a pickup time.";
    return;
  }
  if (!stripe || !cardElement) {
    errorMessage.value = "Payment form is still loading. Please try again.";
    return;
  }

  submitting.value = true;
  try {
    const { clientSecret, paymentIntentId } = await createOrder({
      items: cart.lines.map((line) => ({ itemId: line.itemId, quantity: line.quantity })),
      phone: phone.value,
      pickup: { mode: pickupMode.value, time: pickupMode.value === "scheduled" ? pickupTime.value : null },
    });

    const result = await stripe.confirmCardPayment(clientSecret, {
      payment_method: { card: cardElement, billing_details: { name: name.value } },
    });

    if (result.error) {
      errorMessage.value = result.error.message ?? "Payment failed. Please try a different card.";
      return;
    }

    await pollForOrder(paymentIntentId);
    cart.clear();
    router.push({
      name: "confirmation",
      params: { paymentIntentId },
      query: { name: name.value },
    });
  } catch (err) {
    errorMessage.value = err instanceof Error ? err.message : "Something went wrong. Please try again.";
  } finally {
    submitting.value = false;
  }
}
</script>

<template>
  <div class="checkout-view">
    <AppHeader step="Step 2 of 3 · Checkout" />

    <div class="checkout-grid">
      <div class="sections">
        <section>
          <h2>Contact</h2>
          <div class="fields fields-2col">
            <label>
              Name
              <input
                v-model="name"
                type="text"
                placeholder="Your name"
              >
            </label>
            <label>
              Phone
              <input
                v-model="phone"
                type="tel"
                placeholder="(555) 555-5555"
              >
            </label>
          </div>
        </section>

        <section>
          <h2>Pickup Time</h2>
          <div class="pickup-toggle">
            <button
              type="button"
              class="pill"
              :class="{ selected: pickupMode === 'asap' }"
              @click="pickupMode = 'asap'"
            >
              ASAP
            </button>
            <button
              type="button"
              class="pill"
              :class="{ selected: pickupMode === 'scheduled' }"
              @click="pickupMode = 'scheduled'"
            >
              Schedule for later
            </button>
          </div>
          <input
            v-if="pickupMode === 'scheduled'"
            v-model="pickupTime"
            type="time"
            class="time-input"
          >
        </section>

        <section>
          <h2>Payment</h2>
          <PaymentCardInput @ready="onCardReady" />
        </section>

        <p
          v-if="errorMessage"
          class="error"
          role="alert"
        >
          {{ errorMessage }}
        </p>
      </div>

      <OrderSummaryCard
        :subtotal-cents="cart.subtotalCents"
        :itemized="itemized"
        cta-label="Place Order"
        :cta-disabled="submitting"
        @cta="placeOrder"
      />
    </div>
  </div>
</template>

<style scoped>
.checkout-grid {
  display: grid;
  grid-template-columns: 1.6fr 1fr;
  gap: 48px;
  padding: 44px 48px;
}

.sections {
  display: flex;
  flex-direction: column;
  gap: 36px;
}

h2 {
  font-family: var(--font-display);
  font-size: 26px;
  color: var(--color-ink);
  margin: 0 0 16px;
}

.fields {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.fields-2col {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

label {
  display: flex;
  flex-direction: column;
  gap: 6px;
  font-size: 13px;
  color: var(--color-muted-2);
}

input[type="text"],
input[type="tel"],
input[type="time"] {
  border: 1px solid var(--color-border);
  border-radius: 4px;
  padding: 13px 16px;
  background: white;
  font-size: 14px;
  font-family: var(--font-body);
}

.pickup-toggle {
  display: flex;
  gap: 12px;
}

.pill {
  border-radius: 20px;
  padding: 10px 20px;
  border: 1px solid var(--color-border);
  background: white;
  color: var(--color-muted-2);
  cursor: pointer;
  font-size: 14px;
}

.pill.selected {
  background: var(--color-deep-green);
  border-color: var(--color-deep-green);
  color: var(--color-cream);
}

.time-input {
  margin-top: 12px;
}

.error {
  color: #b3261e;
  font-size: 14px;
}

@media (max-width: 768px) {
  .checkout-grid {
    grid-template-columns: 1fr;
    gap: 24px;
    padding: 16px 20px;
  }

  h2 {
    font-size: 18px;
  }

  .fields-2col {
    grid-template-columns: 1fr;
  }
}
</style>
