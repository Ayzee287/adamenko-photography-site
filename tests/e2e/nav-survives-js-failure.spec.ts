// Regression guard for the "the menu disappeared" production defect.
//
// The homepage overture is server-rendered OPAQUE, full-viewport, at z-index 200 — above the
// header. Until something removes it, the site has no navigation and no content. Every removal
// path lived in client JS (React state + timers), and the only fallback was a <noscript> rule,
// which covers the one case that is not the risk: JS *disabled* is fine, JS *enabled but not
// running* is the real world (a chunk that 404s after a deploy, a hydration error, a slow phone).
// Measured on production before the fix: a failed chunk left the black curtain up permanently.
//
// Every earlier audit missed this because it asserted that nav links were VISIBLE — which they
// were, underneath an opaque layer — and always ran with healthy JS. So these tests assert the
// two things that actually failed: the curtain clears WITHOUT working JS, and header controls are
// HIT-TESTABLE rather than merely visible.

import { expect, test, type Page } from "@playwright/test";

/** The CSS backstop starts at 3.2s and fades for 0.85s; allow margin for slow CI. */
const BACKSTOP_SETTLED_MS = 5_000;

/** Is the curtain still blocking the page? Absent, transparent or hidden all count as clear. */
const curtainState = (page: Page) =>
  page.evaluate(() => {
    const el = document.querySelector(".ch-overture");
    if (!el) return "unmounted";
    const s = getComputedStyle(el);
    return Number(s.opacity) < 0.05 || s.visibility === "hidden" ? "clear" : "BLOCKING";
  });

/**
 * Every visible control in the header must be the element actually hit at its own centre.
 * `toBeVisible()` cannot see an opaque layer stacked on top — that is precisely the gap that
 * let this ship. Returns the controls found so a caller can assert the nav is not simply empty.
 */
const unreachableHeaderControls = (page: Page) =>
  page.evaluate(() => {
    const header = document.querySelector("header");
    if (!header) return { controls: 0, unreachable: ["no <header> at all"] };
    const visible = [...header.querySelectorAll("a, button")].filter((el) => {
      const s = getComputedStyle(el);
      const r = el.getBoundingClientRect();
      return (
        r.width > 0 && r.height > 0 && s.visibility !== "hidden" && s.display !== "none" &&
        Number(s.opacity) > 0.05
      );
    });
    const unreachable = visible
      .filter((el) => {
        const r = el.getBoundingClientRect();
        const hit = document.elementFromPoint(r.x + r.width / 2, r.y + r.height / 2);
        return !hit || (hit !== el && !el.contains(hit) && !hit.contains(el));
      })
      .map((el) => {
        const r = el.getBoundingClientRect();
        const hit = document.elementFromPoint(r.x + r.width / 2, r.y + r.height / 2);
        const label = (el.textContent || el.getAttribute("aria-label") || "?").trim();
        return `"${label}" covered by ${hit ? hit.className || hit.tagName : "nothing"}`;
      });
    return { controls: visible.length, unreachable };
  });

test("the curtain lifts even when the script that removes it never arrives", async ({ page }) => {
  await page.route("**/*.js", (route) => route.abort());
  await page.goto("/", { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(BACKSTOP_SETTLED_MS);

  expect(await curtainState(page)).not.toBe("BLOCKING");

  const { controls, unreachable } = await unreachableHeaderControls(page);
  expect(controls, "header must still offer a way to navigate").toBeGreaterThan(0);
  expect(unreachable).toEqual([]);
});

test("the curtain lifts even when hydration runs but its timers never fire", async ({ page }) => {
  // The component's own failsafe is a setTimeout; if timers are the thing that is broken, it
  // cannot save itself. Only a mechanism outside JS can.
  await page.addInitScript(() => {
    window.setTimeout = (() => 0) as unknown as typeof window.setTimeout;
  });
  await page.goto("/", { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(BACKSTOP_SETTLED_MS);

  expect(await curtainState(page)).not.toBe("BLOCKING");
  expect((await unreachableHeaderControls(page)).unreachable).toEqual([]);
});

test("a healthy load still plays the designed intro, then unmounts it", async ({ page }) => {
  // The backstop must not change what a normal visitor sees: JS still lifts the curtain at
  // ~1.65s and unmounts it at ~2.5s, well before the 3.2s CSS backstop would begin.
  await page.goto("/", { waitUntil: "domcontentloaded" });

  const curtain = page.locator(".ch-overture");
  await expect(curtain).toHaveCount(1, { timeout: 1_000 });
  await expect(curtain).toHaveCount(0, { timeout: 4_000 });

  expect((await unreachableHeaderControls(page)).unreachable).toEqual([]);
});

test("under reduced motion the curtain still clears without working JS", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.route("**/*.js", (route) => route.abort());
  await page.goto("/", { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(2_000); // reduced-motion backstop is 0.8s + 0.2s
  expect(await curtainState(page)).not.toBe("BLOCKING");
});

test("header controls are reachable, not merely visible, across the site", async ({ page }) => {
  // Both locales, and a nested page as well as a top-level one: the overture is homepage-only,
  // but a covering layer anywhere is the same class of defect and this is the assertion that
  // catches it.
  for (const path of [
    "/",
    "/galeries",
    "/galeries/mariages",
    "/tarifs",
    "/contact",
    "/en",
    "/en/galleries",
    "/en/pricing",
  ]) {
    await page.goto(path, { waitUntil: "domcontentloaded" });
    await page.waitForTimeout(3_000); // let the homepage intro finish before hit-testing
    const { controls, unreachable } = await unreachableHeaderControls(page);
    expect(controls, `${path}: header offers no way to navigate`).toBeGreaterThan(0);
    expect(unreachable, `${path}: header controls are covered`).toEqual([]);
  }
});
