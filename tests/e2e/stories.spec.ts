// Story routing and the publish gate, end to end.
//
// These run against whatever the current edit contains. Until the photographer's first real
// story lands the generated model is empty, so the route tests skip rather than fail — but
// the PRIVACY assertions below run either way, because "there are no stories yet" is exactly
// when a leak would go unnoticed.

import { expect, test } from "@playwright/test";
import { stories } from "../../src/content/stories.generated";

const portfolio = stories.filter((s) => s.visibility === "portfolio");
const notPortfolio = stories.filter((s) => s.visibility !== "portfolio");

test.describe("story pages", () => {
  test.skip(portfolio.length === 0, "no published stories in the current edit");

  test("a published story renders its frames in both locales", async ({ page }) => {
    const s = portfolio[0];
    for (const url of [
      `/galeries/${s.category}/${s.slug}`,
      `/en/galleries/${{ familles: "families", grossesse: "maternity", couples: "couples", portraits: "portraits", mariages: "weddings" }[s.category]}/${s.slug}`,
    ]) {
      const res = await page.goto(url);
      expect(res?.status(), url).toBe(200);
      await page.waitForSelector(".ex-tile");
      const tiles = await page.locator(".ex-tile").count();
      expect(tiles, `${url} should hang all ${s.images.length} frames`).toBe(s.images.length);
      await expect(page.locator("h1")).toHaveCount(1);
    }
  });

  test("a story is reachable from its category, and the category does not preload it", async ({
    page,
  }) => {
    const s = portfolio[0];
    const imageRequests: string[] = [];
    page.on("request", (r) => {
      if (r.url().includes("/_next/image")) imageRequests.push(r.url());
    });

    await page.goto(`/galeries/${s.category}`);
    const door = page.locator(`a[href$="/galeries/${s.category}/${s.slug}"]`).first();
    await expect(door).toBeVisible();

    // Entering a category must cost its story COVERS, not every frame inside them. A wedding
    // holding 50+ photographs would otherwise make the category page ruinous on mobile.
    await page.waitForTimeout(1200);
    const framesOfThisStory = imageRequests.filter(
      (u) => u.includes(`${s.slug}-`) && !u.includes(encodeURIComponent(s.cover)),
    );
    expect(
      framesOfThisStory.length,
      "category page pulled interior frames of a story it only links to",
    ).toBeLessThanOrEqual(1);

    await door.click();
    await expect(page).toHaveURL(new RegExp(`/galeries/${s.category}/${s.slug}$`));
    await page.waitForSelector(".ex-tile");
  });

  test("every frame declares real alt text", async ({ page }) => {
    const s = portfolio[0];
    await page.goto(`/galeries/${s.category}/${s.slug}`);
    await page.waitForSelector(".ex-tile");
    // The wall labels the BUTTON (the raster is decorative), so the accessible name is there.
    const labels = await page.locator(".ex-tile").evaluateAll((els) =>
      els.map((e) => e.getAttribute("aria-label") ?? ""),
    );
    expect(labels.length).toBeGreaterThan(0);
    for (const l of labels) expect(l.trim().length).toBeGreaterThan(3);
  });
});

test.describe("the publish gate", () => {
  test("nothing but a portfolio story is served from the public image root", async () => {
    for (const s of stories) {
      const root = s.visibility === "portfolio" ? "/stories/" : "/stories-draft/";
      for (const img of s.images) expect(img.src.startsWith(root), `${s.id} → ${img.src}`).toBe(true);
    }
  });

  test("an unpublished story has no page", async ({ page }) => {
    test.skip(notPortfolio.length === 0, "no unpublished stories in the current edit");
    // Production builds exclude drafts from generateStaticParams, and dynamicParams=false
    // turns everything else into a 404. (A dev server deliberately shows drafts.)
    const s = notPortfolio[0];
    const res = await page.goto(`/galeries/${s.category}/${s.slug}`);
    const status = res?.status();
    if (process.env.NODE_ENV === "production") expect(status).toBe(404);
    else expect([200, 404]).toContain(status);
  });

  test("the sitemap advertises published stories only", async ({ request }) => {
    const xml = await (await request.get("/sitemap.xml")).text();
    for (const s of stories) {
      const path = `/galeries/${s.category}/${s.slug}`;
      if (s.visibility === "portfolio") {
        expect(xml, `${s.id} should be listed`).toContain(path);
      } else {
        expect(xml, `${s.id} is not published and must not be advertised`).not.toContain(path);
      }
    }
  });
});
