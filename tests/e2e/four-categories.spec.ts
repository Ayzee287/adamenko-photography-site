// Portrait was retired as a business category, and a category is now an index of shoots.
//
// Both are product decisions that a future content edit could silently undo — a stray
// "portraits" slug re-appearing in a registry, or a category quietly going back to dumping
// its photographs. These lock the shape rather than the copy.

import { expect, test } from "@playwright/test";
import { stories } from "../../src/content/stories.generated";

const CATEGORIES = ["familles", "grossesse", "couples", "mariages"] as const;
const EN = { familles: "families", grossesse: "maternity", couples: "couples", mariages: "weddings" } as const;

test("the portfolio offers exactly four categories", async ({ page }) => {
  await page.goto("/galeries");
  const hrefs = await page
    .locator('a[href^="/galeries/"]')
    .evaluateAll((els) => els.map((e) => e.getAttribute("href") ?? ""));
  const categories = new Set(
    hrefs.map((h) => h.split("/")[2]).filter((s): s is string => Boolean(s)),
  );
  expect([...categories].sort()).toEqual([...CATEGORIES].sort());
});

test("retired portrait URLs redirect rather than 404", async ({ page }) => {
  for (const [from, to] of [
    ["/galeries/portraits", "/galeries"],
    ["/prestations/portrait", "/tarifs"],
    ["/en/galleries/portraits", "/en/galleries"],
    ["/en/services/portrait", "/en/pricing"],
  ]) {
    const res = await page.goto(from);
    expect(res?.status(), from).toBe(200); // followed the redirect
    expect(new URL(page.url()).pathname, `${from} should land on ${to}`).toBe(to);
  }
});

test("no surface still advertises a portrait category", async ({ page }) => {
  for (const path of ["/", "/galeries", "/tarifs", "/contact", "/en", "/en/galleries"]) {
    await page.goto(path);
    // A link to a portrait gallery or service is the unambiguous signal; the WORD portrait
    // is fine (the couple session is named "Couple & portrait", and CSS uses it for shape).
    const dead = await page
      .locator('a[href*="portrait"]')
      .evaluateAll((els) => els.map((e) => e.getAttribute("href")));
    expect(dead, `${path} links to a retired portrait route`).toEqual([]);
  }
  const sitemap = await (await page.request.get("/sitemap.xml")).text();
  expect(sitemap).not.toContain("portrait");
});

test("a category presents its shoots, not a wall of photographs", async ({ page }) => {
  for (const cat of CATEGORIES) {
    const has = stories.some((s) => s.category === cat && s.visibility === "portfolio");
    if (!has) continue;
    await page.goto(`/galeries/${cat}`);
    await page.waitForSelector(".ch-story-wall .ch-plate");

    // Every story in this category is reachable from its index...
    const expected = stories.filter((s) => s.category === cat && s.visibility === "portfolio");
    for (const s of expected) {
      await expect(
        page.locator(`a[href="/galeries/${cat}/${s.slug}"]`),
        `${cat} index is missing ${s.slug}`,
      ).toHaveCount(1);
    }
    // ...and the category itself hangs NO exhibition: entering it must not download the
    // interiors of shoots that can run past a hundred frames.
    expect(await page.locator(".ex-tile").count(), `${cat} dumped photographs`).toBe(0);
  }
});

test("story pages resolve in both locales", async ({ page }) => {
  const sample = CATEGORIES.map((c) =>
    stories.find((s) => s.category === c && s.visibility === "portfolio"),
  ).filter(Boolean);
  expect(sample.length).toBeGreaterThan(0);

  // `domcontentloaded`, not `load`: this asserts ROUTING and the frame count, and waiting
  // for every image of eight story pages turns a routing test into a bandwidth benchmark
  // that cannot fit one test budget on a throttled mobile profile. The tile-count
  // assertion below is the real signal and waits on its own.
  for (const s of sample) {
    if (!s) continue;
    const fr = await page.goto(`/galeries/${s.category}/${s.slug}`, {
      waitUntil: "domcontentloaded",
    });
    expect(fr?.status(), `${s.id} FR`).toBe(200);
    await expect(page.locator(".ex-tile")).toHaveCount(s.images.length);

    const en = await page.goto(`/en/galleries/${EN[s.category as keyof typeof EN]}/${s.slug}`, {
      waitUntil: "domcontentloaded",
    });
    expect(en?.status(), `${s.id} EN`).toBe(200);
    await expect(page.locator("html")).toHaveAttribute("lang", "en");
  }
});

test("the footer contact group is three labelled icon controls", async ({ page }) => {
  await page.goto("/");
  const footer = page.getByRole("contentinfo");
  for (const name of ["Instagram", "Facebook", "Envoyer un e-mail"]) {
    const link = footer.getByRole("link", { name });
    await expect(link, name).toHaveCount(1);
    const box = await link.boundingBox();
    expect(Math.round(box!.width), `${name} target`).toBeGreaterThanOrEqual(44);
    expect(Math.round(box!.height), `${name} target`).toBeGreaterThanOrEqual(44);
  }
  await expect(footer.getByRole("link", { name: "Envoyer un e-mail" })).toHaveAttribute(
    "href",
    /^mailto:/,
  );
  // the address is an action here, not a printed line
  expect(await footer.textContent()).not.toContain("@gmail.com");
});
