import { test, expect } from "@playwright/test";

test("looking up a seeded phone number shows balance, rewards, and activity", async ({ page }) => {
  await page.goto("/loyalty");

  // Seeded in apps/api/src/scripts/e2eServer.ts (E2E_REWARDS_PHONE) with 400 loyalty points.
  await page.locator('input[type="tel"]').fill("+15559998888");
  await page.locator(".lookup-button").click();

  await expect(page.locator(".points-balance .value")).toHaveText("400");
  await expect(page.locator(".reward-row").first()).toBeVisible();
});

test("looking up an unknown phone number shows a not-found message", async ({ page }) => {
  await page.goto("/loyalty");

  await page.locator('input[type="tel"]').fill("+15551110000");
  await page.locator(".lookup-button").click();

  await expect(page.getByText("No rewards history found for this number.")).toBeVisible();
});
