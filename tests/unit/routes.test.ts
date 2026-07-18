// Route registry contract (Frontend Architecture §3, Roadmap P2 acceptance).
// The registry is the single source of truth for every locale-aware path;
// these tests freeze its invariants: bijective slug maps, unique paths per
// locale, complete locale coverage, EN prefix discipline, and a closed nav
// inventory.

import { describe, expect, it } from "vitest";
import {
  allGenreParams,
  allServiceParams,
  genreSlugs,
  getAlternates,
  link,
  navInventory,
  pageIds,
  serviceSlugs,
  type PageRef,
} from "@/lib/routes";

const allRefs: PageRef[] = [
  ...pageIds.map((page) => ({ page }) as PageRef),
  ...allServiceParams.map((service) => ({ page: "service", service }) as PageRef),
  ...allGenreParams.map((genre) => ({ page: "genre", genre }) as PageRef),
];

describe("route registry — bijectivity & uniqueness", () => {
  it("FR paths are unique across all pages", () => {
    const paths = allRefs.map((r) => link("fr", r));
    expect(new Set(paths).size).toBe(paths.length);
  });

  it("EN paths are unique across all pages", () => {
    const paths = allRefs.map((r) => link("en", r));
    expect(new Set(paths).size).toBe(paths.length);
  });

  it("service slug map is bijective (no duplicate EN aliases)", () => {
    const en = Object.values(serviceSlugs);
    expect(new Set(en).size).toBe(en.length);
  });

  it("genre slug map is bijective (no duplicate EN aliases)", () => {
    const en = Object.values(genreSlugs);
    expect(new Set(en).size).toBe(en.length);
  });
});

describe("route registry — locale discipline", () => {
  it("every EN path is /en-prefixed; no FR path is", () => {
    for (const ref of allRefs) {
      expect(link("en", ref)).toMatch(/^\/en(\/|$)/);
      expect(link("fr", ref)).not.toMatch(/^\/en/);
    }
  });

  it("FR default locale is unprefixed at root", () => {
    expect(link("fr", { page: "home" })).toBe("/");
    expect(link("en", { page: "home" })).toBe("/en");
  });

  it("frozen EN alias table holds", () => {
    expect(link("en", { page: "prestations" })).toBe("/en/services");
    expect(link("en", { page: "service", service: "famille" })).toBe(
      "/en/services/family",
    );
    expect(link("en", { page: "galeries" })).toBe("/en/galleries");
    expect(link("en", { page: "genre", genre: "mariages" })).toBe(
      "/en/galleries/weddings",
    );
    expect(link("en", { page: "seances" })).toBe("/en/stories");
    expect(link("en", { page: "tarifs" })).toBe("/en/pricing");
    expect(link("en", { page: "a-propos" })).toBe("/en/about");
    expect(link("en", { page: "mentions-legales" })).toBe("/en/legal-notice");
    expect(link("en", { page: "confidentialite" })).toBe("/en/privacy");
  });

  it("story slugs are shared across locales", () => {
    expect(link("fr", { page: "story", slug: "camille-automne" })).toBe(
      "/seances/camille-automne",
    );
    expect(link("en", { page: "story", slug: "camille-automne" })).toBe(
      "/en/stories/camille-automne",
    );
  });
});

describe("route registry — alternates & navigation", () => {
  it("alternates emit fr + en + x-default(=fr) for every page", () => {
    for (const ref of allRefs) {
      const alt = getAlternates(ref);
      expect(alt.fr).toBe(link("fr", ref));
      expect(alt.en).toBe(link("en", ref));
      expect(alt["x-default"]).toBe(alt.fr);
    }
  });

  it("nav inventory is the frozen header set, in order", () => {
    expect(navInventory.map((n) => n.id)).toEqual([
      "galeries",
      "prestations",
      "tarifs",
      "seances",
      "a-propos",
      "contact",
    ]);
  });

  it("only Séances is gated; every nav id resolves through the registry", () => {
    for (const item of navInventory) {
      expect(pageIds).toContain(item.id);
      expect(item.label.fr.length).toBeGreaterThan(0);
      expect(item.label.en.length).toBeGreaterThan(0);
      if (item.gated) expect(item.id).toBe("seances");
    }
  });
});
