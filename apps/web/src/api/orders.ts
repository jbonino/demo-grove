import { apiBaseUrl } from "./config";

export interface CreateOrderRequest {
  items: { itemId: string; quantity: number }[];
  phone: string;
  pickup: { mode: "asap" | "scheduled"; time: string | null };
  rewardId?: string;
}

export interface CreateOrderResponse {
  clientSecret: string;
  paymentIntentId: string;
  subtotalCents: number;
  discountedSubtotalCents: number;
}

export async function createOrder(body: CreateOrderRequest): Promise<CreateOrderResponse> {
  const res = await fetch(`${apiBaseUrl}/api/orders`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const error = await res.json().catch(() => ({ error: "Failed to create order" }));
    throw new Error(error.error ?? "Failed to create order");
  }
  return res.json();
}

export interface OrderRewardRedeemed {
  name: string;
  discountAmountCents: number;
}

export interface OrderDTO {
  id: string;
  subtotalCents: number;
  phone: string;
  pickup: { mode: "asap" | "scheduled"; time: string | null };
  status: "pending" | "paid" | "failed";
  rewardRedeemed: OrderRewardRedeemed | null;
  pointsEarned: number;
  pointsBalanceAfter: number;
  createdAt: string;
}

export async function fetchOrderByPaymentIntent(paymentIntentId: string): Promise<OrderDTO | null> {
  const res = await fetch(`${apiBaseUrl}/api/orders/by-payment-intent/${paymentIntentId}`);
  if (res.status === 404) {
    return null;
  }
  if (!res.ok) {
    throw new Error(`Failed to fetch order: ${res.status}`);
  }
  return res.json();
}

export async function pollForOrder(
  paymentIntentId: string,
  { intervalMs = 500, timeoutMs = 8000 } = {},
): Promise<OrderDTO> {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    const order = await fetchOrderByPaymentIntent(paymentIntentId);
    if (order) {
      return order;
    }
    await new Promise((resolve) => setTimeout(resolve, intervalMs));
  }
  throw new Error("Timed out waiting for order confirmation");
}
