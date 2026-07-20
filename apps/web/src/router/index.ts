import { createRouter, createWebHistory } from "vue-router";
import MenuView from "../views/MenuView.vue";
import CartView from "../views/CartView.vue";
import CheckoutView from "../views/CheckoutView.vue";
import ConfirmationView from "../views/ConfirmationView.vue";
import LoyaltyView from "../views/LoyaltyView.vue";
import AdminLoginView from "../views/admin/AdminLoginView.vue";
import AdminDashboardView from "../views/admin/AdminDashboardView.vue";
import { useAdminAuthStore } from "../stores/adminAuth";
import { requiresAdminAuth } from "./adminGuard";

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
    { path: "/loyalty", name: "loyalty", component: LoyaltyView },
    { path: "/admin/login", name: "admin-login", component: AdminLoginView },
    { path: "/admin", name: "admin-dashboard", component: AdminDashboardView },
  ],
});

router.beforeEach(async (to) => {
  if (!requiresAdminAuth(to.path)) {
    return true;
  }
  const auth = useAdminAuthStore();
  if (auth.isAuthenticated === null) {
    await auth.checkSession();
  }
  return auth.isAuthenticated ? true : { name: "admin-login" };
});
