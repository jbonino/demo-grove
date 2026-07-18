import { createRouter, createWebHistory } from "vue-router";
import MenuView from "../views/MenuView.vue";
import CartView from "../views/CartView.vue";
import CheckoutView from "../views/CheckoutView.vue";
import ConfirmationView from "../views/ConfirmationView.vue";
import LoyaltyView from "../views/LoyaltyView.vue";

export function createTestRouter() {
  return createRouter({
    history: createWebHistory(),
    routes: [
      { path: "/", name: "menu", component: MenuView },
      { path: "/cart", name: "cart", component: CartView },
      { path: "/checkout", name: "checkout", component: CheckoutView },
      {
        path: "/confirmation/:paymentIntentId",
        name: "confirmation",
        component: ConfirmationView,
      },
      { path: "/loyalty", name: "loyalty", component: LoyaltyView },
    ],
  });
}
