import express from "express";
import { isDbConnected } from "./db.js";

export function createApp() {
  const app = express();

  app.get("/health", (_req, res) => {
    const dbConnected = isDbConnected();
    res.status(dbConnected ? 200 : 503).json({ ok: dbConnected });
  });

  return app;
}
