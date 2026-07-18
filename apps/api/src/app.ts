import express from "express";
import cors from "cors";
import { isDbConnected } from "./db.js";
import { menuItemsRouter } from "./routes/menuItems.js";

export function createApp() {
  const app = express();

  app.use(cors());

  app.get("/health", (_req, res) => {
    const dbConnected = isDbConnected();
    res.status(dbConnected ? 200 : 503).json({ ok: dbConnected });
  });

  app.use("/api/menu-items", menuItemsRouter);

  return app;
}
