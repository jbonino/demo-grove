import type { MenuItemDTO } from "@grove/shared";
import { apiBaseUrl } from "./config";

export async function fetchMenuItems(): Promise<MenuItemDTO[]> {
  const res = await fetch(`${apiBaseUrl}/api/menu-items`);
  if (!res.ok) {
    throw new Error(`Failed to fetch menu items: ${res.status}`);
  }
  return res.json();
}
