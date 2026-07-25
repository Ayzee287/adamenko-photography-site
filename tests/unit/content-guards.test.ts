// V2 content-truth guards (Frontend Architecture §16, PBS §15).
//
// 1. "sur demande" is a banned phrase — V2 never hides a price behind a
//    euphemism. Legacy V1 content files are exempt UNTIL Phase 15 replaces the
//    content model; the exemption list below must shrink to empty there, and
//    this test fails if an exempt file disappears without being removed from
//    the list (so the list can never rot).
// 2. `aggregateRating` must never appear anywhere in src/ — frozen policy:
//    Google-sourced reviews are never marked up as self-serving ratings.

import { describe, expect, it } from "vitest";
import { readdirSync, readFileSync, statSync, existsSync } from "node:fs";
import path from "node:path";

const SRC = path.resolve(__dirname, "../../src");

// Phase 15 must empty this list.
const LEGACY_SUR_DEMANDE_EXEMPT = ["content/pricing.ts"];

function walk(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const full = path.join(dir, name);
    if (statSync(full).isDirectory()) return walk(full);
    return /\.(ts|tsx|mjs|json)$/.test(name) ? [full] : [];
  });
}

const files = walk(SRC);

describe("banned phrase: « sur demande »", () => {
  it("appears nowhere in src/ outside the legacy exemption list", () => {
    const offenders = files
      .filter((f) => /sur demande/i.test(readFileSync(f, "utf8")))
      .map((f) => path.relative(SRC, f).replace(/\\/g, "/"))
      .filter((rel) => !LEGACY_SUR_DEMANDE_EXEMPT.includes(rel));
    expect(offenders).toEqual([]);
  });

  it("every exempt legacy file still exists (empty the list in Phase 15)", () => {
    for (const rel of LEGACY_SUR_DEMANDE_EXEMPT) {
      expect(existsSync(path.join(SRC, rel)), `${rel} gone — remove it from the exemption list`).toBe(true);
    }
  });
});

describe("structured-data policy: aggregateRating", () => {
  it("never appears in src/", () => {
    const offenders = files
      .filter((f) => readFileSync(f, "utf8").includes("aggregateRating"))
      .map((f) => path.relative(SRC, f).replace(/\\/g, "/"));
    expect(offenders).toEqual([]);
  });
});
