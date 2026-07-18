<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import type { MenuItemDTO } from "@grove/shared";
import { fetchMenuItems } from "../api/menuItems";
import { useCartStore } from "../stores/cart";
import AppHeader from "../components/AppHeader.vue";
import CategoryTabs from "../components/CategoryTabs.vue";
import MenuItemCard from "../components/MenuItemCard.vue";

const cart = useCartStore();
const menuItems = ref<MenuItemDTO[]>([]);
const activeCategory = ref("");

const categories = computed(() => [...new Set(menuItems.value.map((item) => item.category))]);

const visibleItems = computed(() =>
  menuItems.value.filter((item) => item.category === activeCategory.value),
);

function selectCategory(category: string) {
  activeCategory.value = category;
}

function addToCart(item: MenuItemDTO) {
  cart.addItem({ itemId: item.id, name: item.name, unitPrice: item.priceCents });
}

onMounted(async () => {
  menuItems.value = await fetchMenuItems();
  activeCategory.value = categories.value[0] ?? "";
});
</script>

<template>
  <div class="menu-view">
    <AppHeader />
    <CategoryTabs
      :categories="categories"
      :active-category="activeCategory"
      @select="selectCategory"
    />
    <div class="item-grid">
      <MenuItemCard
        v-for="item in visibleItems"
        :key="item.id"
        :item="item"
        @add="addToCart"
      />
    </div>
  </div>
</template>

<style scoped>
.item-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24px;
  padding: 32px 48px 48px;
}

@media (max-width: 768px) {
  .item-grid {
    grid-template-columns: 1fr;
    gap: 16px;
    padding: 16px 20px 24px;
  }
}
</style>
