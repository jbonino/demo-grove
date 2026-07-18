import type { MenuItemDTO } from "@grove/shared";

const apiBaseUrl = import.meta.env.VITE_API_URL ?? "http://localhost:3001";

export async function fetchMenuItems(): Promise<MenuItemDTO[]> {
  const res = await fetch(`${apiBaseUrl}/api/menu-items`);
  if (!res.ok) {
    throw new Error(`Failed to fetch menu items: ${res.status}`);
  }
  return res.json();
}
