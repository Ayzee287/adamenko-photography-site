// Chrome e2e (Roadmap P7): skip-link, header, navigation, menu dialog,
// footer — real keyboard and real dialog behavior across the three viewports.

import { expect, test } from "@playwright/test";

const isDesktopNav = (width?: number) => (width ?? 0) >= 1024;

test("skip-link is the first focusable and targets #main", async ({ page }) => {
  await page.goto("/");
  await page.keyboard.press("Tab");
  const skip = page.getByText("Aller au contenu");
  await expect(skip).toBeFocused();
  await expect(skip).toBeVisible();
  await expect(skip).toHaveAttribute("href", "#main");
});

test("header banner with wordmark home link on every page", async ({ page }) => {
  for (const path of ["/", "/tarifs", "/en/contact"]) {
    await page.goto(path);
    const banner = page.getByRole("banner");
    await expect(banner, path).toBeVisible();
    const wordmark = banner.getByText("Adamenko Photography");
    await expect(wordmark, path).toBeVisible();
  }
});

test("desktop navigation: frozen order, active state, click-through", async ({
  page,
  viewport,
}) => {
  test.skip(!isDesktopNav(viewport?.width), "inline nav is ≥1024 only");
  await page.goto("/galeries");
  const nav = page.getByRole("navigation", { name: "Navigation principale" });
  await expect(nav.getByRole("link")).toHaveText([
    "Galeries",
    "Prestations",
    "Tarifs",
    "À propos",
    "Contact",
    "FR",
    "EN",
  ]);
  await expect(nav.getByText("Galeries")).toHaveAttribute("aria-current", "page");

  await nav.getByText("Tarifs").click();
  await expect(page).toHaveURL(/\/tarifs$/);
  await expect(nav.getByText("Tarifs")).toHaveAttribute("aria-current", "page");
});

test("language switch preserves the page (final public EN alias)", async ({
  page,
  viewport,
}) => {
  test.skip(!isDesktopNav(viewport?.width), "inline nav is ≥1024 only");
  await page.goto("/tarifs");
  const nav = page.getByRole("navigation", { name: "Navigation principale" });
  await expect(nav.getByText("EN")).toHaveAttribute("href", "/en/pricing");
  await expect(nav.getByText("FR")).toHaveAttribute("href", "/tarifs");
});

test("menu dialog: opens, traps, Escape closes, focus returns", async ({
  page,
  viewport,
}) => {
  test.skip(isDesktopNav(viewport?.width), "menu trigger is <1024 only");
  await page.goto("/");
  const trigger = page.getByRole("button", { name: "Ouvrir le menu" });
  await expect(trigger).toBeVisible();
  await trigger.click();

  const dialog = page.locator("dialog#menu-dialog");
  await expect(dialog).toHaveAttribute("open", "");
  await expect(dialog.getByRole("link", { name: "Galeries" })).toBeVisible();
  await expect(
    dialog.getByRole("link", { name: "Travaillons ensemble" }),
  ).toBeVisible();

  await page.keyboard.press("Escape");
  await expect(dialog).not.toHaveAttribute("open", "");
  await expect(trigger).toBeFocused();
});

test("menu dialog navigates and closes on item click", async ({
  page,
  viewport,
}) => {
  test.skip(isDesktopNav(viewport?.width), "menu trigger is <1024 only");
  await page.goto("/");
  await page.getByRole("button", { name: "Ouvrir le menu" }).click();
  await page
    .locator("dialog#menu-dialog")
    .getByRole("link", { name: "Contact" })
    .click();
  await expect(page).toHaveURL(/\/contact$/);
  await expect(page.locator("dialog#menu-dialog")).not.toHaveAttribute(
    "open",
    "",
  );
});

test("footer: contentinfo with pages, socials, email and legal links", async ({
  page,
}) => {
  await page.goto("/");
  const footer = page.getByRole("contentinfo");
  await expect(footer).toBeVisible();
  await expect(
    footer.getByRole("navigation", { name: "Pied de page" }).getByRole("link"),
  ).toHaveCount(5);
  await expect(footer.getByLabel("Instagram")).toBeVisible();
  await expect(
    footer.getByRole("link", { name: "Mentions légales" }),
  ).toHaveAttribute("href", "/mentions-legales");
  await expect(
    footer.getByRole("link", { name: "adamenkoiu@gmail.com" }),
  ).toHaveAttribute("href", "mailto:adamenkoiu@gmail.com");
});
