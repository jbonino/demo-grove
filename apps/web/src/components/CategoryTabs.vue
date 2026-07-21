<script setup lang="ts">
import { computed } from "vue";

const props = defineProps<{
  categories: string[];
  activeCategory: string;
}>();

const emit = defineEmits<{ select: [category: string] }>();

const tabs = computed(() => ["All", ...props.categories]);
</script>

<template>
  <div class="category-tabs">
    <button
      v-for="category in tabs"
      :key="category"
      type="button"
      class="tab"
      :class="{ active: category === activeCategory }"
      @click="emit('select', category)"
    >
      {{ category }}
    </button>
  </div>
</template>

<style scoped>
.category-tabs {
  display: flex;
  gap: 32px;
  padding: 36px 48px 12px;
  border-bottom: 1px solid var(--color-border);
  overflow-x: auto;
}

.tab {
  background: none;
  border: none;
  border-bottom: 2px solid transparent;
  font-family: var(--font-display);
  font-size: 17px;
  color: var(--color-placeholder);
  padding: 12px 12px;
  cursor: pointer;
  white-space: nowrap;
}

.tab.active {
  color: var(--color-deep-green);
  border-bottom-color: var(--color-deep-green);
}

@media (max-width: 768px) {
  .category-tabs {
    padding: 20px 20px 10px;
    gap: 20px;
  }

  .tab {
    font-size: 14px;
    padding: 13px 12px;
  }
}
</style>
