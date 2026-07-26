// The exhibition wall — layout invariants that must hold for ANY edit.
//
// These are deliberately independent of WHICH photographs are hung: the curation sheet is a
// human decision that will change, but a justified wall must never collapse a row into
// postage stamps, never crop, never overflow, and never ask a phone to download a master it
// will paint at a fraction of the size. Each assertion below corresponds to a defect that was
// measured on the real page (a 390px viewport hung a row of 78px frames while its neighbours
// were 157px, and every mobile tile was served at 1080px regardless of its rendered width).

import { expect, test, type Page } from "@playwright/test";

const GENRES = ["familles", "grossesse", "couples", "portraits", "mariages"] as const;

/** Scroll the whole wall so every tile has developed and settled at its final size. */
async function settle(page: Page) {
  await page.waitForSelector(".ex-row .ex-tile");
  await page.evaluate(async () => {
    const step = window.innerHeight * 0.8;
    for (let y = 0; y < document.body.scrollHeight; y += step) {
      window.scrollTo(0, y);
      await new Promise((r) => setTimeout(r, 80));
    }
    window.scrollTo(0, 0);
    await new Promise((r) => setTimeout(r, 200));
  });
}

type Tile = { w: number; h: number; ar: number; sizes: string | null; natural: number };

async function tiles(page: Page): Promise<Tile[]> {
  return page.$$eval(".ex-tile", (els) =>
    els.map((el) => {
      const b = el.getBoundingClientRect();
      const img = el.querySelector("img");
      return {
        w: Math.round(b.width),
        h: Math.round(b.height),
        ar: b.width / b.height,
        sizes: img?.getAttribute("sizes") ?? null,
        natural: img?.naturalWidth ?? 0,
      };
    }),
  );
}

for (const genre of GENRES) {
  test(`${genre}: no row collapses far below its neighbours`, async ({ page }) => {
    await page.goto(`/galeries/${genre}`);
    await settle(page);
    const all = await tiles(page);
    expect(all.length).toBeGreaterThan(0);

    // The defect this guards: a greedy row break that overshoots leaves one row a fraction of
    // the height of the rest. Compare the shortest row against the median row height.
    const heights = all.map((t) => t.h).sort((a, b) => a - b);
    const median = heights[Math.floor(heights.length / 2)];
    expect(heights[0], `shortest tile ${heights[0]}px vs median ${median}px`).toBeGreaterThan(
      median * 0.5,
    );
  });

  test(`${genre}: every frame is legible and uncropped`, async ({ page }) => {
    await page.goto(`/galeries/${genre}`);
    await settle(page);
    const all = await tiles(page);

    for (const t of all) {
      // A frame small enough to be a thumbnail is never the right answer on a photography wall.
      expect(t.w, `tile ${t.w}x${t.h} is a postage stamp`).toBeGreaterThanOrEqual(150);
      // The wall hangs true aspect ratios; object-cover would silently crop a mismatch.
      expect(t.ar).toBeGreaterThan(0.3);
      expect(t.ar).toBeLessThan(3.5);
    }
  });

  test(`${genre}: the wall never overflows its viewport`, async ({ page }) => {
    await page.goto(`/galeries/${genre}`);
    await settle(page);
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - window.innerWidth,
    );
    expect(overflow, "horizontal overflow").toBeLessThanOrEqual(0);
  });

  test(`${genre}: delivery is declared at the size actually painted`, async ({ page }) => {
    await page.goto(`/galeries/${genre}`);
    await settle(page);
    const all = await tiles(page);

    for (const t of all) {
      // Once the rows are solved each tile declares its exact width; a viewport-relative
      // formula cannot describe a justified wall and made phones fetch 1080px for 106px frames.
      expect(t.sizes, `tile ${t.w}px has no measured sizes`).toMatch(/^\d+px$/);
      const declared = Number.parseInt(t.sizes!, 10);
      expect(Math.abs(declared - t.w), `declared ${declared}px vs painted ${t.w}px`).toBeLessThanOrEqual(1);
    }
  });
}

test("the lightbox opens, navigates by keyboard, and returns focus to its frame", async ({
  page,
}) => {
  await page.goto("/galeries/mariages");
  await settle(page);

  const third = page.locator(".ex-tile").nth(2);
  await third.focus();
  await third.press("Enter");

  const dialog = page.locator("dialog.lb");
  await expect(dialog).toBeVisible();
  // native <dialog> puts the viewer in the top layer, which is what gives us the focus trap
  await expect(dialog).toHaveJSProperty("open", true);

  const counter = page.locator(".lb-counter");
  const before = await counter.innerText();
  await page.keyboard.press("ArrowRight");
  await expect(counter).not.toHaveText(before);

  await page.keyboard.press("Escape");
  await expect(dialog).toBeHidden();
  // focus must land back on the frame that opened the viewer, not at the top of the document
  await expect(third).toBeFocused();
});

test("lightbox controls meet the 44px touch target on every viewport", async ({ page }) => {
  await page.goto("/galeries/mariages");
  await settle(page);
  await page.locator(".ex-tile").first().click();
  await expect(page.locator("dialog.lb")).toBeVisible();

  for (const cls of [".lb-close", ".lb-prev", ".lb-next"]) {
    const box = await page.locator(cls).boundingBox();
    expect(box, `${cls} missing`).not.toBeNull();
    expect(Math.round(box!.width), `${cls} width`).toBeGreaterThanOrEqual(44);
    expect(Math.round(box!.height), `${cls} height`).toBeGreaterThanOrEqual(44);
  }
});
