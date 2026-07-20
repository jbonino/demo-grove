import { Router } from "express";
import type { MenuItemDTO } from "@grove/shared";
import { MenuItem } from "../models/MenuItem.js";

export const menuItemsRouter = Router();

const CATEGORY_ORDER = ["Starters", "Entrées", "Sides", "Desserts"];

menuItemsRouter.get("/", async (_req, res) => {
  const items = await MenuItem.find().sort({ name: 1 });
  items.sort((a, b) => {
    const rankA = CATEGORY_ORDER.indexOf(a.category);
    const rankB = CATEGORY_ORDER.indexOf(b.category);
    if (rankA === rankB) return 0;
    if (rankA === -1) return 1;
    if (rankB === -1) return -1;
    return rankA - rankB;
  });
  const dtos: MenuItemDTO[] = items.map((item) => ({
    id: item._id.toString(),
    name: item.name,
    description: item.description,
    priceCents: item.priceCents,
    category: item.category,
  }));
  res.json(dtos);
});
