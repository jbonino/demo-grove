import { test, expect } from "@playwright/test";

test("browse menu, filter by category, and add an item to the cart", async ({ page }) => {
  await page.goto("/");

  const tabs = page.locator(".tab");
  await expect(tabs.first()).toBeVisible();
  await expect(tabs.first()).toHaveClass(/active/);

  await tabs.nth(1).click();
  await expect(tabs.nth(1)).toHaveClass(/active/);
  await expect(page.locator(".item-card").first()).toBeVisible();

  await expect(page.locator(".cart-pill")).toContainText("Cart · 0");
  await page.locator(".add-button").first().click();
  await expect(page.locator(".cart-pill")).toContainText("Cart · 1");
});
