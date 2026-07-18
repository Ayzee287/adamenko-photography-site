// Token contract (Roadmap P3): the CSS must carry the Foundations v1.0.0
// values VERBATIM, the default Tailwind scales must be killed, and every
// frozen contrast requirement must hold mathematically (checked against
// paper/dark, never white/black — VLS §4).

import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import path from "node:path";

const css = readFileSync(
  path.resolve(__dirname, "../../src/styles/tokens.css"),
  "utf8",
).toLowerCase();

/* ── WCAG contrast math ── */
function luminance(hex: string): number {
  const [r, g, b] = [1, 3, 5].map((i) => {
    const c = parseInt(hex.slice(i, i + 2), 16) / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}
function ratio(fg: string, bg: string): number {
  const [hi, lo] = [luminance(fg), luminance(bg)].sort((a, b) => b - a);
  return (hi + 0.05) / (lo + 0.05);
}

const P = {
  paper: "#faf6ef",
  paperDeep: "#f2ebe0",
  ink: "#262119",
  inkSecondary: "#66615a",
  inkDisabled: "#a5a199",
  dark: "#221d17",
  creamOnDark: "#f5efe6",
  stoneOnDark: "#b3aba0",
  bronze: "#8a6a4c",
  error: "#8c4a3f",
};

describe("tokens.css — verbatim Foundations values", () => {
  it("carries all ten primitives", () => {
    for (const hex of Object.values(P)) expect(css).toContain(hex);
  });

  it("carries the 12 frozen spacing steps and no 13th", () => {
    const steps = [4, 8, 12, 16, 24, 32, 48, 64, 96, 128, 192, 256];
    steps.forEach((px, i) =>
      expect(css).toContain(`--spacing-${i + 1}: ${px}px`),
    );
    expect(css).not.toContain("--spacing-13");
  });

  it("carries the radius trio, breakpoints, containers, easing, durations", () => {
    for (const s of [
      "--radius-none: 0px",
      "--radius-field: 12px",
      "--radius-pill: 999px",
      "--breakpoint-md: 768px",
      "--breakpoint-lg: 1024px",
      "--breakpoint-xl: 1200px",
      "--container-site: 1280px",
      "--container-measure: 680px",
      "--container-image-col: 960px",
      "--ease-standard: cubic-bezier(0.2, 0, 0, 1)",
      "--duration-press: 80ms",
      "--duration-fast: 150ms",
      "--duration-standard: 200ms",
      "--duration-lightbox: 250ms",
      "--duration-decode: 300ms",
      "--duration-settle: 400ms",
      "--layer-header: 100",
      "--layer-lightbox: 1000",
      "--size-control-pill: 52px",
      "--size-control-field: 56px",
      "--size-target-min: 44px",
      "--blur-placeholder: 20px",
    ])
      expect(css, s).toContain(s);
  });

  it("kills every default scale (off-scale values are impossible)", () => {
    for (const kill of [
      "--color-*: initial",
      "--spacing: initial",
      "--spacing-*: initial",
      "--radius-*: initial",
      "--shadow-*: initial",
      "--ease-*: initial",
      "--breakpoint-*: initial",
      "--container-*: initial",
      "--blur-*: initial",
      "--animate-*: initial",
    ])
      expect(css, kill).toContain(kill);
  });

  it("dark scope exists and excludes bronze", () => {
    const darkBlock = css.match(/\.surface-dark\s*\{([^}]*)\}/)?.[1] ?? "";
    expect(darkBlock).toContain("#221d17");
    expect(darkBlock).toContain("#f5efe6");
    expect(darkBlock).not.toContain("#8a6a4c");
  });
});

describe("tokens — frozen contrast requirements (against paper/dark)", () => {
  it("ink on paper ≥ 7:1", () => {
    expect(ratio(P.ink, P.paper)).toBeGreaterThanOrEqual(7);
  });
  it("ink-secondary on paper ≥ 4.5:1 (small-text floor)", () => {
    expect(ratio(P.inkSecondary, P.paper)).toBeGreaterThanOrEqual(4.5);
  });
  it("ink-secondary on paper-deep ≥ 4.5:1", () => {
    expect(ratio(P.inkSecondary, P.paperDeep)).toBeGreaterThanOrEqual(4.5);
  });
  it("bronze on paper ≥ 4.5:1 (bronze text is ≥15px by law)", () => {
    expect(ratio(P.bronze, P.paper)).toBeGreaterThanOrEqual(4.5);
  });
  it("error on paper ≥ 4.5:1", () => {
    expect(ratio(P.error, P.paper)).toBeGreaterThanOrEqual(4.5);
  });
  it("cream on dark ≥ 7:1", () => {
    expect(ratio(P.creamOnDark, P.dark)).toBeGreaterThanOrEqual(7);
  });
  it("stone (secondary) on dark ≥ 4.5:1", () => {
    expect(ratio(P.stoneOnDark, P.dark)).toBeGreaterThanOrEqual(4.5);
  });
});
