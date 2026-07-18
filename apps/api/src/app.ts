import express from "express";
import cors from "cors";
import { isDbConnected } from "./db.js";
import { menuItemsRouter } from "./routes/menuItems.js";
import { ordersRouter } from "./routes/orders.js";
import { stripeWebhookRouter } from "./routes/stripeWebhook.js";

export function createApp() {
  const app = express();

  app.use(cors());

  app.get("/health", (_req, res) => {
    const dbConnected = isDbConnected();
    res.status(dbConnected ? 200 : 503).json({ ok: dbConnected });
  });

  // Mounted before express.json() — Stripe signature verification needs the raw request body.
  app.use("/api/stripe/webhook", express.raw({ type: "application/json" }), stripeWebhookRouter);

  app.use(express.json());

  app.use("/api/menu-items", menuItemsRouter);
  app.use("/api/orders", ordersRouter);

  return app;
}
