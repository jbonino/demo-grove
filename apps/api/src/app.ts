import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { isDbConnected } from "./db.js";
import { getSessionSecret } from "./adminAuth.js";
import { menuItemsRouter } from "./routes/menuItems.js";
import { ordersRouter } from "./routes/orders.js";
import { rewardsRouter } from "./routes/rewards.js";
import { loyaltyRouter } from "./routes/loyalty.js";
import { stripeWebhookRouter } from "./routes/stripeWebhook.js";
import { adminAuthRouter } from "./routes/adminAuth.js";
import { adminDashboardRouter } from "./routes/adminDashboard.js";
import { adminCustomersRouter } from "./routes/adminCustomers.js";
import { adminOrdersRouter } from "./routes/adminOrders.js";

export function createApp() {
  const app = express();

  app.use(cors({ origin: true, credentials: true }));

  app.get("/health", (_req, res) => {
    const dbConnected = isDbConnected();
    res.status(dbConnected ? 200 : 503).json({ ok: dbConnected });
  });

  // Mounted before express.json() — Stripe signature verification needs the raw request body.
  app.use("/api/stripe/webhook", express.raw({ type: "application/json" }), stripeWebhookRouter);

  app.use(express.json());
  app.use(cookieParser(getSessionSecret()));

  app.use("/api/menu-items", menuItemsRouter);
  app.use("/api/orders", ordersRouter);
  app.use("/api/rewards", rewardsRouter);
  app.use("/api/loyalty", loyaltyRouter);
  app.use("/api/admin", adminAuthRouter);
  app.use("/api/admin", adminDashboardRouter);
  app.use("/api/admin", adminCustomersRouter);
  app.use("/api/admin", adminOrdersRouter);

  return app;
}
