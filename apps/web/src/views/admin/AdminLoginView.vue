<script setup lang="ts">
import { ref } from "vue";
import { useRouter } from "vue-router";
import { useAdminAuthStore } from "../../stores/adminAuth";

const password = ref("");
const errorMessage = ref("");
const submitting = ref(false);

const auth = useAdminAuthStore();
const router = useRouter();

async function onSubmit() {
  errorMessage.value = "";
  submitting.value = true;
  try {
    await auth.login(password.value);
    router.push({ name: "admin-dashboard" });
  } catch (err) {
    errorMessage.value = err instanceof Error ? err.message : "Something went wrong. Please try again.";
  } finally {
    submitting.value = false;
  }
}
</script>

<template>
  <div class="admin-login-view">
    <form
      class="login-card"
      @submit.prevent="onSubmit"
    >
      <h1>Grove Admin</h1>
      <p class="subtext">
        Operator sign-in
      </p>
      <label>
        Password
        <input
          v-model="password"
          type="password"
          placeholder="Password"
        >
      </label>
      <p
        v-if="errorMessage"
        class="error"
        role="alert"
      >
        {{ errorMessage }}
      </p>
      <button
        type="submit"
        class="submit-btn"
        :disabled="submitting"
      >
        Sign In
      </button>
    </form>
  </div>
</template>

<style scoped>
.admin-login-view {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--color-cream);
}

.login-card {
  width: 380px;
  max-width: calc(100vw - 32px);
  background: white;
  border: 1px solid var(--color-border);
  border-radius: 8px;
  padding: 40px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

h1 {
  font-family: var(--font-display);
  font-size: 26px;
  color: var(--color-ink);
  margin: 0;
  text-align: center;
}

.subtext {
  margin: 0;
  text-align: center;
  color: var(--color-muted);
  font-size: 14px;
}

label {
  display: flex;
  flex-direction: column;
  gap: 6px;
  font-size: 13px;
  color: var(--color-muted-2);
}

input[type="password"] {
  border: 1px solid var(--color-border);
  border-radius: 4px;
  padding: 13px 16px;
  font-size: 14px;
  font-family: var(--font-body);
}

.submit-btn {
  border: none;
  border-radius: 4px;
  padding: 13px 16px;
  background: var(--color-deep-green);
  color: var(--color-cream);
  font-size: 15px;
  cursor: pointer;
  width: 100%;
}

.submit-btn:disabled {
  opacity: 0.6;
  cursor: default;
}

.error {
  color: #b3261e;
  font-size: 14px;
  margin: 0;
}

@media (max-width: 480px) {
  .login-card {
    width: 100%;
  }
}
</style>
