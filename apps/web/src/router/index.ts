import { createRouter, createWebHistory } from "vue-router";
import MenuView from "../views/MenuView.vue";

export const router = createRouter({
  history: createWebHistory(),
  routes: [{ path: "/", name: "menu", component: MenuView }],
});
