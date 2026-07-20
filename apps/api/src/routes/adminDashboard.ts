import { Router } from "express";
import { requireAdminSession } from "../adminAuth.js";
import { getDashboardStats } from "../admin/dashboardStats.js";
import { asyncHandler } from "../asyncHandler.js";

export const adminDashboardRouter = Router();

adminDashboardRouter.get(
  "/dashboard",
  requireAdminSession,
  asyncHandler(async (_req, res) => {
    res.json(await getDashboardStats());
  }),
);
