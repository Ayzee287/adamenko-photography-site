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

test("unknown dynamic slugs 404 (dynamicParams=false)", async ({ page }) => {
  for (const path of [
    "/prestations/inexistant",
    "/galeries/inexistant",
    "/seances/inexistant",
  ]) {
    const response = await page.goto(path);
    expect(response?.status(), path).toBe(404);
  }
});

test("stub pages render for both locales through the proxy", async ({
  page,
}) => {
  await page.goto("/prestations/famille");
  await expect(page.locator("h1")).toContainText("famille");
  await page.goto("/en/galeries/mariages");
  await expect(page.locator("h1")).toContainText("mariages");
});

test("the layout owns exactly one main#main landmark", async ({ page }) => {
  for (const path of ["/", "/tarifs", "/en/contact"]) {
    await page.goto(path);
    await expect(page.locator("main"), path).toHaveCount(1);
    await expect(page.locator("main#main"), path).toHaveCount(1);
  }
});

test("404 carries the spec copy, its own title, and the real status", async ({
  page,
}) => {
  const response = await page.goto("/page-inexistante");
  expect(response?.status()).toBe(404);
  await expect(page.locator("h1")).toContainText("Cette page n'existe pas.");
  await expect(page).toHaveTitle(/404 · Adamenko Photography/);
  await expect(
    page.locator("main").getByRole("link", { name: /Retour à l'accueil/ }),
  ).toHaveAttribute("href", "/");
});
