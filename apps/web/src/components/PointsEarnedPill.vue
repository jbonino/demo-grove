<script setup lang="ts">
defineProps<{
  pointsEarned: number;
  balance: number;
}>();
</script>

<template>
  <div class="points-earned-pill">
    <span
      class="icon"
      aria-hidden="true"
    >★</span>
    <span>+{{ pointsEarned }} points earned · {{ balance }} points balance now</span>
  </div>
</template>

<style scoped>
.points-earned-pill {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: #fbf3de;
  border: 1px solid #e9d9a8;
  border-radius: 24px;
  padding: 8px 18px;
  font-size: 13px;
  color: var(--color-ink);
  margin: 0 0 24px;
}

.icon {
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: #c9a24b;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 10px;
  flex-shrink: 0;
}
</style>
