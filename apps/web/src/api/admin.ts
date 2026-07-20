import { apiBaseUrl } from "./config";

export async function adminLogin(password: string): Promise<void> {
  const res = await fetch(`${apiBaseUrl}/api/admin/login`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ password }),
  });
  if (!res.ok) {
    const error = await res.json().catch(() => ({ error: "Failed to sign in" }));
    throw new Error(error.error ?? "Failed to sign in");
  }
}

export async function adminLogout(): Promise<void> {
  await fetch(`${apiBaseUrl}/api/admin/logout`, {
    method: "POST",
    credentials: "include",
  });
}

export async function checkAdminSession(): Promise<boolean> {
  const res = await fetch(`${apiBaseUrl}/api/admin/session`, {
    credentials: "include",
  });
  return res.ok;
}

export interface RecentOrderDTO {
  id: string;
  customerName: string;
  createdAt: string;
  totalCents: number;
  status: "Completed";
}

export interface DashboardStatsDTO {
  ordersToday: number;
  ordersTodayDelta: number;
  revenueTodayCents: number;
  revenueTodayDeltaCents: number;
  pointsIssued7d: number;
  pointsRedeemed7d: number;
  signups7d: number;
  ordersOutOf7d: number;
  recentOrders: RecentOrderDTO[];
}

export async function fetchDashboardStats(): Promise<DashboardStatsDTO> {
  const res = await fetch(`${apiBaseUrl}/api/admin/dashboard`, {
    credentials: "include",
  });
  if (!res.ok) {
    throw new Error(`Failed to fetch dashboard stats: ${res.status}`);
  }
  return res.json();
}
