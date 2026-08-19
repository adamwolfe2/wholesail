import { test, expect } from "@playwright/test";

test.describe("Marketing homepage", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/", { waitUntil: "networkidle" });
  });

  test("loads with correct title", async ({ page }) => {
    await expect(page).toHaveTitle(/Wholesail/);
  });

  test("hero section is visible", async ({ page }) => {
    const hero = page.locator("h1");
    await expect(hero).toBeVisible();
    await expect(hero).toContainText("ordering portals");
  });

  test("navigation links are present", async ({ page }) => {
    const nav = page.locator("nav");
    await expect(nav).toBeVisible();

    // The nav bar should contain the Wholesail brand
    const brand = page.locator("nav").getByText("WHOLESAIL");
    await expect(brand).toBeVisible();
  });

  test("footer is visible", async ({ page }) => {
    const footer = page.locator("footer");
    await expect(footer).toBeVisible();
    await expect(footer).toContainText("WHOLESAIL");
  });

  test("demo portal launcher button exists", async ({ page }) => {
    // The hero section has a "See a Live Demo" CTA linking to #demo
    const demoLink = page.locator('a[href="#demo"]').first();
    await expect(demoLink).toBeVisible();
    await expect(demoLink).toContainText("Live Demo");
  });

  test("scrolls to pricing section", async ({ page }) => {
    const pricingSection = page.locator("#pricing");
    await pricingSection.scrollIntoViewIfNeeded();
    await expect(pricingSection).toBeVisible();
  });
});
