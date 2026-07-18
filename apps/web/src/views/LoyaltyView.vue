<script setup lang="ts">
import { ref } from "vue";
import { fetchLoyaltyLookup, type LoyaltyLookup } from "../api/loyalty";
import AppHeader from "../components/AppHeader.vue";
import LoyaltyStatCards from "../components/LoyaltyStatCards.vue";
import LoyaltyActivityList from "../components/LoyaltyActivityList.vue";
import RewardList from "../components/RewardList.vue";

const phone = ref("");
const lookup = ref<LoyaltyLookup | null>(null);
const searched = ref(false);
const loading = ref(false);

async function onLookUp() {
  if (!phone.value.trim()) {
    return;
  }
  loading.value = true;
  try {
    lookup.value = await fetchLoyaltyLookup(phone.value);
    searched.value = true;
  } finally {
    loading.value = false;
  }
}
</script>

<template>
  <div class="loyalty-view">
    <AppHeader />

    <div class="content">
      <h1>Look up your rewards</h1>
      <p class="subtext">
        Enter your phone number to see your points balance, rewards, and recent activity.
      </p>

      <div class="search">
        <input
          v-model="phone"
          type="tel"
          placeholder="(555) 555-5555"
          @keyup.enter="onLookUp"
        >
        <button
          type="button"
          class="lookup-button"
          @click="onLookUp"
        >
          Look Up
        </button>
      </div>

      <template v-if="searched">
        <template v-if="lookup">
          <LoyaltyStatCards
            :points-balance="lookup.pointsBalance"
            :lifetime-orders="lookup.lifetimeOrders"
          />

          <section v-if="lookup.availableRewards.length > 0">
            <h2>Available Rewards</h2>
            <RewardList
              :rewards="lookup.availableRewards"
              :selected-id="null"
              readonly
            />
          </section>

          <section v-if="lookup.activity.length > 0">
            <h2>Recent Activity</h2>
            <LoyaltyActivityList :activity="lookup.activity" />
          </section>
        </template>
        <p
          v-else
          class="not-found"
        >
          No rewards history found for this number.
        </p>
      </template>
    </div>
  </div>
</template>

<style scoped>
.content {
  max-width: 640px;
  margin: 0 auto;
  padding: 56px 48px;
  text-align: center;
}

h1 {
  font-family: var(--font-display);
  font-size: 32px;
  color: var(--color-ink);
  margin: 0 0 8px;
}

.subtext {
  font-size: 15px;
  color: var(--color-muted);
  margin: 0 0 28px;
}

.search {
  display: flex;
  justify-content: center;
  gap: 12px;
  margin-bottom: 40px;
}

.search input {
  width: 340px;
  border: 1px solid var(--color-border);
  border-radius: 4px;
  padding: 13px 16px;
  background: white;
  font-size: 14px;
  font-family: var(--font-body);
}

.lookup-button {
  background: var(--color-deep-green);
  color: var(--color-cream);
  border: none;
  border-radius: 4px;
  padding: 13px 24px;
  font-weight: 600;
  font-size: 15px;
  cursor: pointer;
}

section {
  text-align: left;
  margin-bottom: 32px;
}

h2 {
  font-family: var(--font-display);
  font-size: 22px;
  color: var(--color-ink);
  margin: 0 0 16px;
}

.not-found {
  color: var(--color-muted);
  padding: 32px 0;
}

@media (max-width: 768px) {
  .content {
    padding: 32px 20px;
  }

  h1 {
    font-size: 20px;
  }

  .search {
    flex-direction: column;
  }

  .search input {
    width: 100%;
  }
}
</style>
