import { Router } from "express";
import { requireAdminSession } from "../adminAuth.js";
import { getCustomerList } from "../admin/customerList.js";
import { asyncHandler } from "../asyncHandler.js";

export const adminCustomersRouter = Router();

adminCustomersRouter.get(
  "/customers",
  requireAdminSession,
  asyncHandler(async (req, res) => {
    const search = typeof req.query.search === "string" ? req.query.search : undefined;
    const page = typeof req.query.page === "string" ? Number(req.query.page) : undefined;
    res.json(await getCustomerList({ search, page }));
  }),
);
