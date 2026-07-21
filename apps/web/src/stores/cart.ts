import { computed, ref } from "vue";
import { defineStore } from "pinia";

export interface CartLine {
  itemId: string;
  name: string;
  quantity: number;
  unitPrice: number;
  imageUrl?: string;
}

export const useCartStore = defineStore("cart", () => {
  const lines = ref<CartLine[]>([]);

  const totalItemCount = computed(() =>
    lines.value.reduce((sum, line) => sum + line.quantity, 0),
  );

  const subtotalCents = computed(() =>
    lines.value.reduce((sum, line) => sum + line.quantity * line.unitPrice, 0),
  );

  function addItem(item: { itemId: string; name: string; unitPrice: number; imageUrl?: string }) {
    const existing = lines.value.find((line) => line.itemId === item.itemId);
    if (existing) {
      existing.quantity += 1;
    } else {
      lines.value.push({ ...item, quantity: 1 });
    }
  }

  function setQuantity(itemId: string, quantity: number) {
    if (quantity <= 0) {
      lines.value = lines.value.filter((line) => line.itemId !== itemId);
      return;
    }
    const existing = lines.value.find((line) => line.itemId === itemId);
    if (existing) {
      existing.quantity = quantity;
    }
  }

  function clear() {
    lines.value = [];
  }

  return { lines, totalItemCount, subtotalCents, addItem, setQuantity, clear };
});
