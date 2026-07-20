import { ref } from "vue";
import { defineStore } from "pinia";
import { adminLogin, adminLogout, checkAdminSession } from "../api/admin";

export const useAdminAuthStore = defineStore("adminAuth", () => {
  const isAuthenticated = ref<boolean | null>(null);

  async function login(password: string) {
    await adminLogin(password);
    isAuthenticated.value = true;
  }

  async function logout() {
    await adminLogout();
    isAuthenticated.value = false;
  }

  async function checkSession() {
    isAuthenticated.value = await checkAdminSession();
    return isAuthenticated.value;
  }

  return { isAuthenticated, login, logout, checkSession };
});
