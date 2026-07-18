<script setup lang="ts">
import AppHeader from "../components/AppHeader.vue";
</script>

<template>
  <div class="loyalty-view">
    <AppHeader step="Rewards" />
    <p class="placeholder">
      Loyalty lookup is coming soon.
    </p>
  </div>
</template>

<style scoped>
.placeholder {
  text-align: center;
  padding: 64px 24px;
  color: var(--color-muted);
}
</style>
