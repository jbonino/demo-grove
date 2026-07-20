import { Router } from "express";
import {
  clearAdminSessionCookie,
  getAdminPassword,
  requireAdminSession,
  setAdminSessionCookie,
} from "../adminAuth.js";

export const adminAuthRouter = Router();

adminAuthRouter.post("/login", (req, res) => {
  const { password } = req.body as { password?: string };
  if (password !== getAdminPassword()) {
    res.status(401).json({ error: "Incorrect password" });
    return;
  }
  setAdminSessionCookie(res);
  res.json({ ok: true });
});

adminAuthRouter.post("/logout", (_req, res) => {
  clearAdminSessionCookie(res);
  res.json({ ok: true });
});

adminAuthRouter.get("/session", requireAdminSession, (_req, res) => {
  res.json({ authenticated: true });
});
