import { createRouter, createWebHistory } from "vue-router";
import MenuView from "../views/MenuView.vue";
import CartView from "../views/CartView.vue";
import CheckoutView from "../views/CheckoutView.vue";
import ConfirmationView from "../views/ConfirmationView.vue";

export const router = createRouter({
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
  ],
});
