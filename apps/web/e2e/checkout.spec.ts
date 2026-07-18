import { test, expect } from "@playwright/test";
import { stripeKeyAvailable } from "./stripeAvailable";

test.skip(!stripeKeyAvailable, "requires apps/api/.env STRIPE_SECRET_KEY + `stripe listen` running");

test("cart -> checkout -> successful Stripe test-card payment -> confirmation", async ({ page }) => {
  await page.goto("/");
  await page.waitForSelector(".tab");
  await page.locator(".add-button").first().click();

  await page.locator(".cart-pill").click();
  await expect(page).toHaveURL(/\/cart/);

  await page.locator(".cta").click();
  await expect(page).toHaveURL(/\/checkout/);

  await page.locator('input[type="text"]').fill("Jane Doe");
  await page.locator('input[type="tel"]').fill("+15551234567");

  const cardFrame = page.frameLocator('iframe[title="Secure card payment input frame"]');
  await cardFrame.locator('[name="cardnumber"]').fill("4242424242424242");
  await cardFrame.locator('[name="exp-date"]').fill("12/34");
  await cardFrame.locator('[name="cvc"]').fill("123");
  await cardFrame.locator('[name="postal"]').fill("94103");

  await page.locator(".cta").click();

  await expect(page).toHaveURL(/\/confirmation\//, { timeout: 15000 });
  await expect(page.locator("h1")).toContainText("You're all set");
  await expect(page.locator(".cart-pill")).not.toBeVisible();
});

test("declined test card shows an error and stays on Checkout", async ({ page }) => {
  await page.goto("/");
  await page.waitForSelector(".tab");
  await page.locator(".add-button").first().click();
  await page.locator(".cart-pill").click();
  await page.locator(".cta").click();
  await expect(page).toHaveURL(/\/checkout/);

  await page.locator('input[type="text"]').fill("Jane Doe");
  await page.locator('input[type="tel"]').fill("+15551234567");

  const cardFrame = page.frameLocator('iframe[title="Secure card payment input frame"]');
  await cardFrame.locator('[name="cardnumber"]').fill("4000000000000002");
  await cardFrame.locator('[name="exp-date"]').fill("12/34");
  await cardFrame.locator('[name="cvc"]').fill("123");
  await cardFrame.locator('[name="postal"]').fill("94103");

  await page.locator(".cta").click();

  await expect(page.locator(".error")).toBeVisible({ timeout: 10000 });
  await expect(page).toHaveURL(/\/checkout/);
});
