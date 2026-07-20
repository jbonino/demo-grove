import type { NextFunction, Request, Response } from "express";

export const ADMIN_SESSION_COOKIE = "grove_admin_session";
const TEN_YEARS_MS = 10 * 365 * 24 * 60 * 60 * 1000;

export function getAdminPassword(): string {
  const password = process.env.GROVE_ADMIN_PASSWORD;
  if (!password) {
    throw new Error("GROVE_ADMIN_PASSWORD is not set");
  }
  return password;
}

export function getSessionSecret(): string {
  const secret = process.env.GROVE_SESSION_SECRET;
  if (!secret) {
    throw new Error("GROVE_SESSION_SECRET is not set");
  }
  return secret;
}

export function setAdminSessionCookie(res: Response): void {
  res.cookie(ADMIN_SESSION_COOKIE, "1", {
    signed: true,
    httpOnly: true,
    maxAge: TEN_YEARS_MS,
  });
}

export function clearAdminSessionCookie(res: Response): void {
  res.clearCookie(ADMIN_SESSION_COOKIE);
}

export function requireAdminSession(req: Request, res: Response, next: NextFunction): void {
  if (req.signedCookies[ADMIN_SESSION_COOKIE] !== "1") {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  next();
}
