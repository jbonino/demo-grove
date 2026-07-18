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

test("redeeming a reward at checkout discounts the charge and shows it on confirmation", async ({ page }) => {
  await page.goto("/");
  await page.waitForSelector(".tab");
  // Add twice so the subtotal comfortably clears Stripe's minimum charge after the reward discount.
  await page.locator(".add-button").first().click();
  await page.locator(".add-button").first().click();

  await page.locator(".cart-pill").click();
  await expect(page).toHaveURL(/\/cart/);

  await page.locator(".cta").click();
  await expect(page).toHaveURL(/\/checkout/);

  await page.locator('input[type="text"]').fill("Jane Doe");
  // Seeded in apps/api/src/scripts/e2eServer.ts (E2E_REWARDS_PHONE) with 400 loyalty points.
  const phoneInput = page.locator('input[type="tel"]');
  await phoneInput.fill("+15559998888");
  await phoneInput.blur();

  await expect(page.locator(".reward-row").first()).toBeVisible();
  await page.locator(".reward-row").first().click();
  await expect(page.locator(".row.reward-discount")).toBeVisible();

  const cardFrame = page.frameLocator('iframe[title="Secure card payment input frame"]');
  await cardFrame.locator('[name="cardnumber"]').fill("4242424242424242");
  await cardFrame.locator('[name="exp-date"]').fill("12/34");
  await cardFrame.locator('[name="cvc"]').fill("123");
  await cardFrame.locator('[name="postal"]').fill("94103");

  await page.locator(".cta").click();

  await expect(page).toHaveURL(/\/confirmation\//, { timeout: 15000 });
  await expect(page.locator("h1")).toContainText("You're all set");
  await expect(page.getByText("Reward Used")).toBeVisible();
  await expect(page.getByText(/points earned/)).toBeVisible();
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
