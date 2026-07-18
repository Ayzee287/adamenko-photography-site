// Phase 1 smoke: the placeholder shell serves both locales with correct lang
// attributes through the kept locale proxy (FR unprefixed, EN under /en).
// Real page flows replace/extend this from Phase 12 onward.

import { expect, test } from "@playwright/test";

test("FR placeholder renders unprefixed at / with lang=fr", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator("html")).toHaveAttribute("lang", "fr");
  await expect(page.locator("main#main")).toContainText(
    "nouvelle version en préparation",
  );
});

test("EN placeholder renders at /en with lang=en", async ({ page }) => {
  await page.goto("/en");
  await expect(page.locator("html")).toHaveAttribute("lang", "en");
  await expect(page.locator("main#main")).toContainText(
    "a new version is in the making",
  );
});

test("/fr redirects permanently to / (default locale has no prefix)", async ({
  page,
}) => {
  const response = await page.goto("/fr");
  expect(response?.status()).toBe(200);
  await expect(page).toHaveURL(/\/$/);
});

test("inactive locale 404s", async ({ page }) => {
  const response = await page.goto("/ru");
  expect(response?.status()).toBe(404);
});
