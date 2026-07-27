// Locale-routing smoke: the real V2 app serves both locales with correct lang
// attributes through the kept locale proxy (FR unprefixed, EN under /en), and the
// dynamic-slug / 404 / landmark invariants hold. (The Phase-1 placeholder-copy
// assertions this file shipped with were retired once CHAMBRE replaced the shell.)

import { expect, test } from "@playwright/test";

test("FR home renders unprefixed at / with lang=fr", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator("html")).toHaveAttribute("lang", "fr");
  // Anchor on the brand wordmark: a fixed client fact, so this survives any
  // art-direction copy change while still proving the real chrome rendered.
  await expect(
    page.getByRole("banner").getByText("Adamenko Photography"),
  ).toBeVisible();
});

test("EN home renders at /en with lang=en", async ({ page }) => {
  await page.goto("/en");
  await expect(page.locator("html")).toHaveAttribute("lang", "en");
  await expect(
    page.getByRole("banner").getByText("Adamenko Photography"),
  ).toBeVisible();
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

test("service + gallery pages render for both locales through the proxy", async ({
  page,
}) => {
  // The dossier H1 names the service AND the city — it is the commercial landing page,
  // and the bare noun it used to carry ("Famille") said nothing to a reader arriving from
  // a search. The gallery H1 deliberately stays the plain genre noun: it sits under the
  // Galeries chapter kicker, which supplies the context a <title> cannot.
  await page.goto("/prestations/famille");
  await expect(page.locator("h1").first()).toHaveText("Photographe de famille à Lyon");
  await page.goto("/en/galleries/weddings");
  await expect(page.locator("h1").first()).toHaveText("Weddings");
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
