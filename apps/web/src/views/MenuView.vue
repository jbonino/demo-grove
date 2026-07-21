<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import type { MenuItemDTO } from "@grove/shared";
import { fetchMenuItems } from "../api/menuItems";
import { useCartStore } from "../stores/cart";
import AppHeader from "../components/AppHeader.vue";
import CategoryTabs from "../components/CategoryTabs.vue";
import MenuItemCard from "../components/MenuItemCard.vue";

const SKELETON_CARD_COUNT = 6;
const ALL_FILTER = "All";
const MOST_POPULAR_NAMES = [
  "Braised Short Rib",
  "Miso-Glazed Salmon",
  "Truffle Parmesan Fries",
  "Chocolate Lava Cake",
];

const cart = useCartStore();
const menuItems = ref<MenuItemDTO[]>([]);
const activeCategory = ref(ALL_FILTER);
const isLoading = ref(true);

const categories = computed(() => [...new Set(menuItems.value.map((item) => item.category))]);

const isAllView = computed(() => activeCategory.value === ALL_FILTER);

const visibleItems = computed(() =>
  menuItems.value.filter((item) => item.category === activeCategory.value),
);

const groupedCategories = computed(() =>
  categories.value.map((category) => ({
    category,
    items: menuItems.value.filter((item) => item.category === category),
  })),
);

const popularItems = computed(() =>
  menuItems.value.filter((item) => MOST_POPULAR_NAMES.includes(item.name)),
);

function selectCategory(category: string) {
  activeCategory.value = category;
}

function addToCart(item: MenuItemDTO) {
  cart.addItem({ itemId: item.id, name: item.name, unitPrice: item.priceCents, imageUrl: item.imageUrl });
}

onMounted(async () => {
  menuItems.value = await fetchMenuItems();
  isLoading.value = false;
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
    <div
      v-if="isLoading"
      class="item-grid"
    >
      <div
        v-for="n in SKELETON_CARD_COUNT"
        :key="n"
        class="skeleton-card"
      />
    </div>
    <template v-else-if="isAllView">
      <div
        v-if="popularItems.length > 0"
        class="most-popular category-section"
      >
        <h2 class="category-heading">
          Most Popular
        </h2>
        <div class="item-grid">
          <MenuItemCard
            v-for="item in popularItems"
            :key="item.id"
            :item="item"
            @add="addToCart"
          />
        </div>
      </div>
      <div
        v-for="group in groupedCategories"
        :key="group.category"
        class="category-section"
      >
        <h2 class="category-heading">
          {{ group.category }}
        </h2>
        <div class="item-grid">
          <MenuItemCard
            v-for="item in group.items"
            :key="item.id"
            :item="item"
            @add="addToCart"
          />
        </div>
      </div>
    </template>
    <div
      v-else
      class="item-grid"
    >
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

.category-section {
  padding: 0 48px;
}

.category-section .item-grid {
  padding: 0 0 32px;
}

.category-heading {
  font-family: var(--font-display);
  font-size: 26px;
  color: var(--color-ink);
  margin: 32px 0 0;
}

.skeleton-card {
  height: 246px;
  border-radius: 6px;
  background: linear-gradient(
    90deg,
    var(--color-border) 25%,
    var(--color-cream) 50%,
    var(--color-border) 75%
  );
  background-size: 200% 100%;
  animation: skeleton-shimmer 1.4s ease-in-out infinite;
}

@keyframes skeleton-shimmer {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}

@media (max-width: 768px) {
  .item-grid {
    grid-template-columns: 1fr;
    gap: 16px;
    padding: 16px 20px 24px;
  }

  .category-section {
    padding: 0 20px;
  }

  .category-section .item-grid {
    padding: 0 0 24px;
  }

  .category-heading {
    font-size: 18px;
    margin: 16px 0 0;
  }

  .skeleton-card {
    height: 90px;
  }
}
</style>
