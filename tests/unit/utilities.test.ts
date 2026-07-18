// Utility contracts (Roadmap P5): cn (relocated V1 helper, behavior frozen)
// and the kept V1 dictionary loader (deep-merge fallback to French — the
// mechanism the V2 chrome micro-labels ride on).

import { describe, expect, it } from "vitest";
import { cn } from "../../src/lib/utils/cn";
import { getDictionary } from "../../src/lib/dictionary";
import { fr } from "../../src/content/dictionaries/fr";

describe("cn — class joiner", () => {
  it("joins strings and drops every falsy", () => {
    expect(cn("a", false, "b", null, undefined, "c")).toBe("a b c");
  });
  it("supports conditional composition", () => {
    const revealed = false;
    expect(cn("base", revealed && "revealed")).toBe("base");
  });
  it("empty call yields empty string", () => {
    expect(cn()).toBe("");
  });
});

describe("getDictionary — V1 loader kept (reconciliation contract)", () => {
  it("french resolves to the base dictionary", () => {
    expect(getDictionary("fr")).toEqual(fr);
  });

  it("every locale deep-merges over french — no key can be missing", () => {
    for (const locale of ["en", "ru", "uk"] as const) {
      const dict = getDictionary(locale);
      const missing: string[] = [];
      const walk = (base: unknown, other: unknown, path: string) => {
        if (typeof base !== "object" || base === null || Array.isArray(base))
          return;
        for (const key of Object.keys(base)) {
          const b = (base as Record<string, unknown>)[key];
          if (b === undefined) continue; // fr itself leaves it unset (e.g. no phone)
          const o = (other as Record<string, unknown> | undefined)?.[key];
          if (o === undefined) missing.push(`${locale}:${path}${key}`);
          else walk(b, o, `${path}${key}.`);
        }
      };
      walk(fr, dict, "");
      expect(missing).toEqual([]);
    }
  });
});
