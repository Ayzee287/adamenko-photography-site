// On-page SEO invariants for the four commercial dossiers and their galleries.
//
// These are guards, not documentation of intent: each one failed, or would have failed,
// against a real defect found by auditing the live site.
//
//   1. /prestations/<service> and /galeries/<genre> shipped titles that were byte-identical
//      in one case ("Grossesse · Adamenko Photography") and near-identical in the other
//      three. Two pages competing for one query is a choice handed to Google.
//   2. The English dictionary deep-merges over French, so a key it does not override
//      silently resolves to the FRENCH string. `galleryMeta` is a new top-level key, and
//      omitting it would have put "Photos de mariage" in the <title> of an English page.
//   3. A meta description states a price. Prices live in content/pricing.ts. If one moves
//      and the other does not, the SERP advertises a price the page no longer charges.

import { describe, expect, it } from "vitest";
import { getDictionary } from "@/lib/dictionary";
import { activeLocales, type Locale } from "@/lib/i18n";
import { serviceForGenre } from "@/lib/service-genre";
import type { GenreSlug } from "@/types/gallery";

const GENRES: GenreSlug[] = ["familles", "grossesse", "couples", "mariages"];

/** The <title> a page emits, before the layout appends " · <brand>". */
const dossierTitle = (locale: Locale, genre: GenreSlug) =>
  getDictionary(locale).services.items.find((s) => s.slug === genre)!.title;
const galleryTitle = (locale: Locale, genre: GenreSlug) =>
  getDictionary(locale).galleryMeta[genre].metaTitle;

/** Compare on words, not on typography: French uses a narrow no-break space before €. */
const normalize = (s: string) => s.replace(/\s+/g, " ").trim();

describe("dossier ↔ gallery titles do not cannibalise", () => {
  it.each(activeLocales)("%s: the two intents ship different titles", (locale) => {
    for (const genre of GENRES) {
      expect(normalize(galleryTitle(locale, genre)).toLowerCase()).not.toBe(
        normalize(dossierTitle(locale, genre)).toLowerCase(),
      );
    }
  });

  it.each(activeLocales)("%s: every emitted title is unique across both page types", (locale) => {
    const all = GENRES.flatMap((g) => [dossierTitle(locale, g), galleryTitle(locale, g)]).map((t) =>
      normalize(t).toLowerCase(),
    );
    expect(new Set(all).size).toBe(all.length);
  });
});

describe("English never falls back to French metadata", () => {
  // The deep-merge makes an un-overridden key resolve to French. For a <title> that is not
  // a missing translation, it is the wrong language on an indexable page.
  it("galleryMeta is overridden for every genre", () => {
    for (const genre of GENRES) {
      expect(galleryTitle("en", genre)).not.toBe(galleryTitle("fr", genre));
    }
  });

  it("service titles, descriptions and anchors are overridden for every service", () => {
    for (const genre of GENRES) {
      const fr = getDictionary("fr").services.items.find((s) => s.slug === genre)!;
      const en = getDictionary("en").services.items.find((s) => s.slug === genre)!;
      expect(en.title).not.toBe(fr.title);
      expect(en.metaDescription).not.toBe(fr.metaDescription);
      expect(en.linkLabel).not.toBe(fr.linkLabel);
    }
  });
});

describe("dossier metadata is well-formed", () => {
  it.each(activeLocales)("%s: every service carries the four SEO fields", (locale) => {
    for (const genre of GENRES) {
      const s = getDictionary(locale).services.items.find((it) => it.slug === genre)!;
      expect(s.title.length).toBeGreaterThan(0);
      expect(s.shortTitle.length).toBeGreaterThan(0);
      expect(s.metaDescription.length).toBeGreaterThan(0);
      expect(s.linkLabel.length).toBeGreaterThan(0);
    }
  });

  it.each(activeLocales)("%s: descriptions fit a result snippet", (locale) => {
    for (const genre of GENRES) {
      const { metaDescription } = getDictionary(locale).services.items.find(
        (it) => it.slug === genre,
      )!;
      // Google truncates around 160 characters; below ~80 wastes the slot.
      expect(metaDescription.length).toBeGreaterThan(80);
      expect(metaDescription.length).toBeLessThanOrEqual(165);
    }
  });

  it.each(activeLocales)("%s: the plaque label stays short enough to sit on a photograph", (locale) => {
    for (const genre of GENRES) {
      const { shortTitle } = getDictionary(locale).services.items.find((it) => it.slug === genre)!;
      expect(shortTitle.length).toBeLessThanOrEqual(16);
    }
  });

  it("every service resolves to a real service route", () => {
    for (const genre of GENRES) {
      expect(serviceForGenre[genre]).toBeTruthy();
    }
  });
});

describe("advertised prices match content/pricing.ts", () => {
  // The three fixed sessions are exact prices; weddings quote the package minimum. A meta
  // description that names a price must name the one actually charged.
  it.each(activeLocales)("%s: session descriptions quote the real session price", (locale) => {
    const dict = getDictionary(locale);
    for (const genre of ["familles", "grossesse", "couples"] as GenreSlug[]) {
      const session = dict.pricing.sessions.items.find((s) => s.slug === genre)!;
      const { metaDescription } = dict.services.items.find((it) => it.slug === genre)!;
      expect(normalize(metaDescription)).toContain(String(session.price));
    }
  });

  it.each(activeLocales)("%s: the wedding description quotes the package minimum", (locale) => {
    const dict = getDictionary(locale);
    const min = Math.min(...dict.pricing.wedding.packages.map((pk) => pk.price));
    const { metaDescription } = dict.services.items.find((it) => it.slug === "mariages")!;
    expect(normalize(metaDescription)).toContain(String(min));
  });

  it("no session description quotes a price that is not the session's own", () => {
    const dict = getDictionary("fr");
    const wedding = Math.min(...dict.pricing.wedding.packages.map((pk) => pk.price));
    for (const genre of ["familles", "grossesse", "couples"] as GenreSlug[]) {
      const { metaDescription } = dict.services.items.find((it) => it.slug === genre)!;
      expect(metaDescription).not.toContain(String(wedding));
    }
  });
});
