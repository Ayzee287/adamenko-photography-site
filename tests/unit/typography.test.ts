// Typography contract (Roadmap P4): the 13 frozen roles verbatim, the type
// scale killed, the fonts module preserving V1's production config (incl. the
// load-bearing Cyrillic subset), and the French helpers exact to the
// character (U+202F).

import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import path from "node:path";
import {
  formatDuration,
  formatPrice,
  frPunctuation,
  NNBSP,
} from "../../src/lib/utils/format";

const css = readFileSync(
  path.resolve(__dirname, "../../src/styles/typography.css"),
  "utf8",
);
const fonts = readFileSync(
  path.resolve(__dirname, "../../src/lib/fonts.ts"),
  "utf8",
);

/** Extract one @utility block (split-based — blocks end at the next @utility). */
function role(name: string): string {
  const blocks = css.split("@utility ");
  const block = blocks.find((b) => b.startsWith(`${name} `));
  expect(block, `role ${name} missing`).toBeDefined();
  return block as string;
}

// name → [serif?, weight, mbSize, dtSize|null, lineHeight]
const table: Record<
  string,
  [serif: boolean, weight: number, mb: number, dt: number | null, lh: string]
> = {
  "text-display": [true, 400, 40, 64, "1.08"],
  "text-h2": [true, 400, 30, 40, "1.15"],
  "text-h3": [true, 400, 22, 26, "1.25"],
  "text-quote": [true, 400, 22, 26, "1.45"],
  "text-body-letter": [true, 400, 18, 19, "1.6"],
  "text-caption": [true, 400, 14, 15, "1.4"],
  "text-body": [false, 400, 16, 17, "1.55"],
  "text-small": [false, 400, 13, 14, "1.5"],
  "text-kicker": [false, 500, 12, 13, "1.2"],
  "text-nav": [false, 400, 16, null, "1.2"],
  "text-price": [false, 500, 22, 24, "1.3"],
  "text-button": [false, 500, 15, null, "1.2"],
  "text-label": [false, 500, 14, null, "1.3"],
};

describe("typography.css — the 13 frozen roles", () => {
  it("defines exactly the 13 roles + the wordmark component value", () => {
    const names = [...css.matchAll(/@utility (text-[\w-]+)/g)].map((m) => m[1]);
    expect(names.sort()).toEqual(
      [...Object.keys(table), "text-wordmark"].sort(),
    );
    // The wordmark is chrome, not typography: serif 20, no responsive pair.
    const wm = role("text-wordmark");
    expect(wm).toContain("font-size: 20px");
    expect(wm).not.toContain("@media");
  });

  for (const [name, [serif, weight, mb, dt, lh]] of Object.entries(table)) {
    it(`${name}: ${serif ? "serif" : "sans"} ${weight}, ${mb}/${dt ?? "—"} @ ${lh}`, () => {
      const b = role(name);
      expect(b).toContain(serif ? "var(--font-serif)" : "var(--font-sans)");
      expect(b).toContain(`font-weight: ${weight}`);
      expect(b).toContain(`font-size: ${mb}px`);
      expect(b).toContain(`line-height: ${lh}`);
      if (dt !== null) {
        expect(b).toContain("width >= 768px");
        expect(b).toContain(`font-size: ${dt}px`);
      } else {
        expect(b).not.toContain("@media");
      }
    });
  }

  it("kicker is the only tracking and the only caps register", () => {
    expect(css.match(/letter-spacing/g)).toHaveLength(1);
    expect(css.match(/text-transform/g)).toHaveLength(1);
    expect(role("text-kicker")).toContain("letter-spacing: 0.12em");
    expect(role("text-kicker")).toContain("text-transform: uppercase");
  });

  it("price uses tabular numerals; serif roles never exceed weight 400", () => {
    expect(role("text-price")).toContain("font-variant-numeric: tabular-nums");
    for (const [name, [serif, weight]] of Object.entries(table))
      if (serif) expect(weight, name).toBe(400);
  });

  it("kills the default type scales; medium is the only weight token", () => {
    for (const kill of [
      "--text-*: initial",
      "--leading-*: initial",
      "--tracking-*: initial",
      "--font-weight-*: initial",
      "--font-*: initial",
    ])
      expect(css).toContain(kill);
    expect(css).toContain("--font-weight-medium: 500");
    expect(css).not.toContain("--font-weight-bold");
  });
});

describe("fonts.ts — V1 production families preserved", () => {
  it("Fraunces: latin, weight 400 only, real italic", () => {
    expect(fonts).toContain("Fraunces");
    expect(fonts).toMatch(/subsets:\s*\["latin"\]/);
    expect(fonts).toMatch(/weight:\s*\["400"\]/);
    expect(fonts).toMatch(/style:\s*\["normal",\s*"italic"\]/);
  });

  it("Inter: latin + cyrillic (review names must never fall back)", () => {
    expect(fonts).toContain("Inter");
    expect(fonts).toMatch(/subsets:\s*\["latin",\s*"cyrillic"\]/);
  });

  it("both use display swap and expose CSS variables", () => {
    expect(fonts.match(/display:\s*"swap"/g)).toHaveLength(2);
    expect(fonts).toContain("--font-fraunces");
    expect(fonts).toContain("--font-inter");
  });
});

describe("French typography helpers — exact to the character (U+202F)", () => {
  it("NNBSP is U+202F", () => {
    expect(NNBSP).toBe(" ");
  });

  it("formatPrice fr: NNBSP grouping and before €", () => {
    expect(formatPrice(290, "fr")).toBe("290 €");
    expect(formatPrice(1250, "fr")).toBe("1 250 €");
  });

  it("formatPrice en: plain €-prefix", () => {
    expect(formatPrice(290, "en")).toBe("€290");
    expect(formatPrice(1250, "en")).toBe("€1,250");
  });

  it("frPunctuation: NNBSP before ;:!?» and after «, idempotent", () => {
    expect(frPunctuation("Une autre question ?")).toBe(
      "Une autre question ?",
    );
    expect(frPunctuation("Attention!")).toBe("Attention !");
    expect(frPunctuation("« La confiance »")).toBe(
      "« La confiance »",
    );
    const once = frPunctuation("Bonjour !");
    expect(frPunctuation(once)).toBe(once);
  });

  it("frPunctuation: leaves URLs and clock times alone", () => {
    expect(frPunctuation("https://example.com")).toBe("https://example.com");
    expect(frPunctuation("à 12:30")).toBe("à 12:30");
  });

  it("formatDuration: 1 h 30 / 2 h with NNBSP", () => {
    expect(formatDuration(1, 30)).toBe("1 h 30");
    expect(formatDuration(2)).toBe("2 h");
  });
});
