import { existsSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { test, expect } from "@playwright/test";

const apiEnvPath = fileURLToPath(new URL("../../api/.env", import.meta.url));

function readAdminPassword(): string | undefined {
  if (!existsSync(apiEnvPath)) {
    return undefined;
  }
  return readFileSync(apiEnvPath, "utf-8").match(/^GROVE_ADMIN_PASSWORD=(.+)$/m)?.[1]?.trim();
}

const adminPassword = readAdminPassword();

test.skip(!adminPassword, "requires apps/api/.env GROVE_ADMIN_PASSWORD");

test("admin signs in with the correct password and lands on the Dashboard", async ({ page }) => {
  await page.goto("/admin/login");

  await page.locator('input[type="password"]').fill(adminPassword!);
  await page.locator('button[type="submit"]').click();

  await expect(page).toHaveURL(/\/admin$/);
  await expect(page.getByText("Orders Today")).toBeVisible();
  await expect(page.getByText("Revenue Today")).toBeVisible();
  await expect(page.locator(".recent-orders")).toBeVisible();
});

test("admin sees an inline error and stays on the login page with the wrong password", async ({ page }) => {
  await page.goto("/admin/login");

  await page.locator('input[type="password"]').fill("definitely-wrong-password");
  await page.locator('button[type="submit"]').click();

  await expect(page.getByRole("alert")).toContainText("Incorrect password");
  await expect(page).toHaveURL(/\/admin\/login$/);
});
