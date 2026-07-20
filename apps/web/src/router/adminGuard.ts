export function requiresAdminAuth(path: string): boolean {
  return (path === "/admin" || path.startsWith("/admin/")) && path !== "/admin/login";
}
