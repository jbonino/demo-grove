import { computed, ref } from "vue";
import { defineStore } from "pinia";

export interface CartLine {
  itemId: string;
  name: string;
  quantity: number;
  unitPrice: number;
}

export const useCartStore = defineStore("cart", () => {
  const lines = ref<CartLine[]>([]);

  const totalItemCount = computed(() =>
    lines.value.reduce((sum, line) => sum + line.quantity, 0),
  );

  function addItem(item: { itemId: string; name: string; unitPrice: number }) {
    const existing = lines.value.find((line) => line.itemId === item.itemId);
    if (existing) {
      existing.quantity += 1;
    } else {
      lines.value.push({ ...item, quantity: 1 });
    }
  }

  return { lines, totalItemCount, addItem };
});
