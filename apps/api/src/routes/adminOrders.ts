import { Router } from "express";
import { requireAdminSession } from "../adminAuth.js";
import { getOrderList } from "../admin/orderList.js";
import { getOrderDetail } from "../admin/orderDetail.js";
import { asyncHandler } from "../asyncHandler.js";

export const adminOrdersRouter = Router();

adminOrdersRouter.get(
  "/orders",
  requireAdminSession,
  asyncHandler(async (req, res) => {
    const page = typeof req.query.page === "string" ? Number(req.query.page) : undefined;
    res.json(await getOrderList({ page }));
  }),
);

adminOrdersRouter.get(
  "/orders/:id",
  requireAdminSession,
  asyncHandler(async (req, res) => {
    const detail = await getOrderDetail(String(req.params.id));
    if (!detail) {
      res.status(404).json({ error: "Order not found" });
      return;
    }
    res.json(detail);
  }),
);
