import { Router } from "express";
import type { MenuItemDTO } from "@grove/shared";
import { MenuItem } from "../models/MenuItem.js";

export const menuItemsRouter = Router();

menuItemsRouter.get("/", async (_req, res) => {
  const items = await MenuItem.find().sort({ category: 1, name: 1 });
  const dtos: MenuItemDTO[] = items.map((item) => ({
    id: item._id.toString(),
    name: item.name,
    description: item.description,
    priceCents: item.priceCents,
    category: item.category,
  }));
  res.json(dtos);
});
