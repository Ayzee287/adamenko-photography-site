// The exhibition wall — layout invariants that must hold for ANY edit.
//
// These are deliberately independent of WHICH photographs are hung: the curation sheet is a
// human decision that will change, but a justified wall must never collapse a row into
// postage stamps, never crop, never overflow, and never ask a phone to download a master it
// will paint at a fraction of the size. Each assertion below corresponds to a defect that was
// measured on the real page (a 390px viewport hung a row of 78px frames while its neighbours
// were 157px, and every mobile tile was served at 1080px regardless of its rendered width).

import { expect, test, type Page } from "@playwright/test";

// The wall now lives on STORY pages: a category page became an index of shoots, so it
// hangs covers rather than an exhibition. These invariants follow the wall to where it is.
// One story per category keeps the matrix meaningful without re-testing 890 frames.
import { stories } from "../../src/content/stories.generated";

const WALLS = ["familles", "grossesse", "couples", "mariages"]
  .map((c) => stories.find((s) => s.category === c && s.visibility === "portfolio"))
  .filter((s): s is NonNullable<typeof s> => Boolean(s))
  .map((s) => ({ name: s.id, url: `/galeries/${s.category}/${s.slug}` }));

/**
 * Scroll the whole wall, then wait for the layout to actually STOP MOVING.
 *
 * The row solver runs from a ResizeObserver, so scrolling (which can show or hide a
 * scrollbar, changing the container width by a few pixels) can schedule one more pass.
 * Sampling geometry immediately after the scroll therefore reads a frame mid-relayout —
 * which showed up as tests failing on a different story on each parallel run and never
 * twice on the same one. Waiting for two identical consecutive measurements asserts the
 * settled wall, which is the thing the invariants are actually about.
 */
async function settle(page: Page) {
  await page.waitForSelector(".ex-row .ex-tile");
  await page.evaluate(async () => {
    const step = window.innerHeight * 0.8;
    for (let y = 0; y < document.body.scrollHeight; y += step) {
      window.scrollTo(0, y);
      await new Promise((r) => setTimeout(r, 80));
    }
    window.scrollTo(0, 0);

    const measure = () =>
      [...document.querySelectorAll(".ex-tile")]
        .map((t) => {
          const b = t.getBoundingClientRect();
          return `${Math.round(b.width)}x${Math.round(b.height)}`;
        })
        .join(",");

    let previous = "";
    for (let i = 0; i < 40; i++) {
      await new Promise((r) => requestAnimationFrame(() => setTimeout(r, 50)));
      const now = measure();
      if (now === previous && now !== "") return;
      previous = now;
    }
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

for (const { name: genre, url: wallUrl } of WALLS) {
  test(`${genre}: no row collapses far below its neighbours`, async ({ page }) => {
    await page.goto(wallUrl);
    await settle(page);
    const all = await tiles(page);
    expect(all.length).toBeGreaterThan(0);

    // The defect this guards: a greedy row break that overshoots leaves one row a fraction of
    // the height of the rest. Compare the shortest row against the median row height.
    // Polled for the same reason as the width check: read the settled wall, not a frame of
    // it mid-relayout.
    await expect
      .poll(
        async () => {
          const hs = (await tiles(page)).map((t) => t.h).sort((a, b) => a - b);
          return hs[0] / hs[Math.floor(hs.length / 2)];
        },
        { message: "a row collapsed far below the median row height", timeout: 5000 },
      )
      .toBeGreaterThan(0.5);
    expect(all.length).toBeGreaterThan(0);
  });

  test(`${genre}: every frame is legible and uncropped`, async ({ page }) => {
    await page.goto(wallUrl);
    await settle(page);

    // Polled: the narrowest frame is read from a live layout, and a relayout landing between
    // the scroll and the read would otherwise fail a wall that is correct once settled.
    // A frame small enough to be a thumbnail is never the right answer on a photography wall.
    await expect
      .poll(
        async () => Math.min(...(await tiles(page)).map((t) => t.w)),
        { message: "narrowest frame is a postage stamp", timeout: 5000 },
      )
      .toBeGreaterThanOrEqual(150);

    const all = await tiles(page);
    for (const t of all) {
      // The wall hangs true aspect ratios; object-cover would silently crop a mismatch.
      expect(t.ar).toBeGreaterThan(0.3);
      expect(t.ar).toBeLessThan(3.5);
    }
  });

  test(`${genre}: the wall never overflows its viewport`, async ({ page }) => {
    await page.goto(wallUrl);
    await settle(page);
    // The invariant is "the wall does not overflow AT REST". Sampling once can catch the
    // instant between a ResizeObserver relayout and the row solver's next pass, where a
    // sub-pixel width briefly exceeds the container — polling asserts the settled state
    // instead of racing it. (Confirmed a race, not an overflow: it failed on a different
    // story on each parallel run and never twice on the same one.)
    await expect
      .poll(
        () => page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth),
        { message: "horizontal overflow at rest", timeout: 5000 },
      )
      .toBeLessThanOrEqual(0);
  });

  test(`${genre}: delivery is declared at the size actually painted`, async ({ page }) => {
    await page.goto(wallUrl);
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
  await page.goto(WALLS[WALLS.length - 1].url);
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
  await page.goto(WALLS[WALLS.length - 1].url);
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
