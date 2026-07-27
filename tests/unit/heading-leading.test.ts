// The line-height floor for the serif display roles.
//
// Fraunces puts 0.742em of ink above the baseline (l, b, d) and 0.234em below it (p, q, g).
// A heading that WRAPS therefore needs at least 0.976em of line-height before the descenders
// of one line touch the ascenders of the next. Any value below that guarantees a collision,
// at every viewport width — it is not a subtle optical preference.
//
// This was a real, shipped defect. `.ch-display` sat at 0.94, and the homepage hero
// ("Des photos qui / vous ressemblent.") overlapped by 3.7px of real ink at 1440px: the q of
// "qui" dropped 24px, the l and b of "ressemblent" rose 76px, into a 96.26px line.
// `.ch-title` at exactly 1 had 2.4% of margin, which a wrapped French heading opening on a
// capital or an accent also eats.
//
// The floor is a property of the typeface, so it is asserted here rather than left to the eye.

import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import path from "node:path";

const css = readFileSync(path.resolve(__dirname, "../../src/styles/chambre.css"), "utf8");

/** Fraunces ink extents, measured from the rendered font via canvas actualBoundingBox. */
const ASCENT = 0.742;
const DESCENT = 0.234;
const INK_FLOOR = ASCENT + DESCENT; // 0.976em

/** The declared line-height of a class, or null when it does not set one. */
function leading(selector: string): number | null {
  const i = css.indexOf(`${selector} {`);
  expect(i, `selector ${selector} not found`).toBeGreaterThan(-1);
  const block = css.slice(i, css.indexOf("}", i));
  const m = block.match(/line-height:\s*([\d.]+)\s*;/);
  return m ? Number(m[1]) : null;
}

describe("serif heading roles clear the ink floor", () => {
  // Every role that can wrap. `.ch-title--sub` deliberately sets no line-height — it is a
  // size modifier on .ch-title and must inherit its leading rather than re-declare a
  // tighter one (it shipped at 1.05, below the floor, and is now inherited).
  const WRAPPING_ROLES = [".ch-display", ".ch-title", ".ch-chapter-title"];

  it.each(WRAPPING_ROLES)("%s sets a line-height at or above the ink floor", (sel) => {
    const lh = leading(sel);
    expect(lh, `${sel} must declare a line-height`).not.toBeNull();
    expect(lh!).toBeGreaterThanOrEqual(INK_FLOOR);
  });

  it("each wrapping role keeps a real optical margin, not just bare contact", () => {
    for (const sel of WRAPPING_ROLES) {
      // 3% over the floor ≈ 3px at the hero's 102px — visible separation, still tight.
      expect(leading(sel)!, `${sel} is only just clear`).toBeGreaterThan(INK_FLOOR * 1.03);
    }
  });

  it("the sub-title modifier inherits its leading instead of re-declaring one", () => {
    expect(leading(".ch-title--sub")).toBeNull();
  });

  it("the roles stay TIGHT — a display face must not drift to body leading", () => {
    // The fix must not become "make everything roomy": these are display settings.
    for (const sel of WRAPPING_ROLES) expect(leading(sel)!).toBeLessThan(1.2);
  });
});

describe("the homepage genre rows can land their images at one height", () => {
  // Two images sit at equal height only if their columns are in the frames' OWN aspect
  // ratios. The counter row shipped 0.62fr/1.42fr — 2.290:1 against the real 2.249:1 — and
  // that 1.8% error dropped the Mariages plate 10px below its neighbour at every width.
  const ratios = (selector: string) => {
    const i = css.indexOf(`${selector} {`);
    expect(i, `${selector} not found`).toBeGreaterThan(-1);
    const block = css.slice(i, css.indexOf("}", i));
    const m = block.match(/grid-template-columns:\s*([\d.]+)fr\s+([\d.]+)fr/);
    expect(m, `${selector} must declare two fr columns`).not.toBeNull();
    return [Number(m![1]), Number(m![2])] as const;
  };

  it("both rows use the same landscape:portrait proportion, only mirrored", () => {
    const [featLandscape, featPortrait] = ratios(".ch-genres-row--feature");
    const [counterPortrait, counterLandscape] = ratios(".ch-genres-row--counter");
    expect(counterPortrait).toBeCloseTo(featPortrait, 3);
    expect(counterLandscape).toBeCloseTo(featLandscape, 3);
  });

  it("the proportions ARE the frames' aspect ratios (3:2 and 2:3)", () => {
    for (const sel of [".ch-genres-row--feature", ".ch-genres-row--counter"]) {
      const [a, b] = ratios(sel);
      const [landscape, portrait] = a > b ? [a, b] : [b, a];
      expect(landscape).toBeCloseTo(1.5, 2); // 3:2
      expect(portrait).toBeCloseTo(0.667, 2); // 2:3
      // Equal-height is exactly the columns being reciprocal.
      expect(landscape * portrait).toBeCloseTo(1, 2);
    }
  });
});
