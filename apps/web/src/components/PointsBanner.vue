<script setup lang="ts">
defineProps<{
  balance: number;
  unlockedCount: number;
}>();
</script>

<template>
  <div class="points-banner">
    <span
      class="icon"
      aria-hidden="true"
    >★</span>
    <span>{{ balance }} points on file for this number — enough for {{ unlockedCount }} reward<template v-if="unlockedCount !== 1">s</template> below</span>
  </div>
</template>

<style scoped>
.points-banner {
  display: flex;
  align-items: center;
  gap: 10px;
  background: #fbf3de;
  border: 1px solid #e9d9a8;
  border-radius: 6px;
  padding: 12px 16px;
  font-size: 14px;
  color: var(--color-ink);
}

.icon {
  width: 22px;
  height: 22px;
  border-radius: 50%;
  background: #c9a24b;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  flex-shrink: 0;
}
</style>
