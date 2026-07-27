// Guards for the dossier depth pass. The point of the design is that the four commercial
// pages are COMPOSED from modules that own their facts, rather than restating them. These
// tests hold that property, because the moment a fact is copied it can drift.
//
// Each of these failed against a real defect or a real risk:
//   1. The EN Service node announced the FRENCH url — structured data telling Google an
//      English page is the French one. Caught in the built HTML, fixed, now frozen.
//   2. The dictionary deep-merges over French: any serviceDossier key en.ts omits renders
//      French on an English page.
//   3. The dossier cites FAQ entries by id. An id that no longer exists must fail the build,
//      not silently render three questions where four were intended.
//   4. The process steps restate four FAQ answers; the dossier's own FAQ block must not then
//      repeat those same four, or the page says everything twice.

import { describe, expect, it } from "vitest";
import { getDictionary } from "@/lib/dictionary";
import { activeLocales, defaultLocale, type Locale } from "@/lib/i18n";
import { serviceJsonLd } from "@/lib/structured-data";
import { alternatesForPath } from "@/lib/routes";
import { serviceForGenre } from "@/lib/service-genre";
import { storiesIn } from "@/lib/stories";
import type { GenreSlug } from "@/types/gallery";

const GENRES: GenreSlug[] = ["familles", "grossesse", "couples", "mariages"];
/** The four answers the process steps already give — the FAQ block must avoid them. */
const ANSWERED_BY_STEPS = ["reserver", "preparation", "delai-livraison", "livraison"];

describe("the dossier cites real content, by key", () => {
  it.each(activeLocales)("%s: every cited FAQ id resolves to a real question", (locale) => {
    const dict = getDictionary(locale);
    for (const genre of GENRES) {
      const cited = dict.serviceDossier.faq[genre];
      expect(cited.length).toBeGreaterThan(0);
      for (const id of cited) {
        const item = dict.faq.items.find((f) => f.id === id);
        expect(item, `${locale}/${genre} cites missing FAQ id "${id}"`).toBeDefined();
        expect(item!.q.length).toBeGreaterThan(0);
        expect(item!.a.length).toBeGreaterThan(0);
      }
    }
  });

  it("no dossier repeats a question its own process steps already answer", () => {
    const dict = getDictionary(defaultLocale);
    for (const genre of GENRES) {
      for (const id of dict.serviceDossier.faq[genre]) {
        expect(ANSWERED_BY_STEPS, `${genre} repeats "${id}"`).not.toContain(id);
      }
    }
  });

  it.each(activeLocales)("%s: every cited add-on id resolves, and none is off-topic", (locale) => {
    const dict = getDictionary(locale);
    for (const genre of GENRES) {
      for (const id of dict.serviceDossier.addons[genre]) {
        expect(dict.pricing.addons.items.find((a) => a.id === id), `${genre} → "${id}"`).toBeDefined();
      }
      // The defect this replaced: a blind slice(0,3) advertised the pre-WEDDING engagement
      // session on the maternity and family pages.
      if (genre === "familles" || genre === "grossesse") {
        expect(dict.serviceDossier.addons[genre]).not.toContain("engagement");
      }
      // A wedding shows its three packages instead; it must not also list séance options.
      if (genre === "mariages") expect(dict.serviceDossier.addons[genre]).toHaveLength(0);
    }
  });

  it("every genre has an on-the-day step and a real gallery to show", () => {
    const dict = getDictionary(defaultLocale);
    for (const genre of GENRES) {
      expect(dict.serviceDossier.steps.onTheDay[genre].length).toBeGreaterThan(40);
      // The dossier teases the genre's shoots; a genre with none renders no work section.
      expect(storiesIn(genre).length).toBeGreaterThan(0);
    }
  });
});

describe("English never falls back to French on the dossier", () => {
  const fr = getDictionary("fr").serviceDossier;
  const en = getDictionary("en").serviceDossier;

  it("section headings are overridden", () => {
    expect(en.work.title).not.toBe(fr.work.title);
    expect(en.work.weddingTitle).not.toBe(fr.work.weddingTitle);
    expect(en.included.title).not.toBe(fr.included.title);
    expect(en.included.weddingTitle).not.toBe(fr.included.weddingTitle);
    expect(en.process.title).not.toBe(fr.process.title);
    expect(en.coverage.title).not.toBe(fr.coverage.title);
    expect(en.questions.title).not.toBe(fr.questions.title);
  });

  it("every process step is overridden", () => {
    fr.steps.shared.forEach((step, i) => {
      expect(en.steps.shared[i].title).not.toBe(step.title);
      expect(en.steps.shared[i].body).not.toBe(step.body);
    });
    expect(en.steps.delivery.body).not.toBe(fr.steps.delivery.body);
    expect(en.steps.daySession).not.toBe(fr.steps.daySession);
    for (const genre of GENRES) {
      expect(en.steps.onTheDay[genre]).not.toBe(fr.steps.onTheDay[genre]);
    }
  });
});

describe("Service structured data states the page it is on", () => {
  const build = (locale: Locale, genre: GenreSlug) => {
    const dict = getDictionary(locale);
    const item = dict.services.items.find((s) => s.slug === genre)!;
    const session = dict.pricing.sessions.items.find((s) => s.slug === genre);
    const path = `/prestations/${serviceForGenre[genre]}`;
    return serviceJsonLd({
      name: item.title,
      description: item.metaDescription,
      path,
      locale,
      price: session?.price ?? Math.min(...dict.pricing.wedding.packages.map((p) => p.price)),
      exactPrice: session?.exactPrice ?? false,
      areas: dict.locations.areas.map((a) => ({ label: a.label, schemaType: a.schemaType })),
    });
  };

  it.each(activeLocales)("%s: url is the LOCALIZED canonical, not the French path", (locale) => {
    for (const genre of GENRES) {
      const ld = build(locale, genre);
      const expected = alternatesForPath(`/prestations/${serviceForGenre[genre]}`, locale).canonical;
      expect(String(ld.url)).toContain(expected);
      expect(String((ld.offers as Record<string, unknown>).url)).toContain(expected);
      if (locale === "en") {
        // The specific defect: an English page announcing the French URL.
        expect(String(ld.url)).toContain("/en/");
      }
    }
  });

  it("a fixed-price session states a price; a wedding states a MINIMUM", () => {
    const dict = getDictionary(defaultLocale);
    const session = build(defaultLocale, "familles").offers as Record<string, unknown>;
    expect(session.price).toBe(dict.pricing.sessions.items.find((s) => s.slug === "familles")!.price);
    expect(session.priceSpecification).toBeUndefined();

    const wedding = build(defaultLocale, "mariages").offers as Record<string, unknown>;
    const min = Math.min(...dict.pricing.wedding.packages.map((p) => p.price));
    expect(wedding.price).toBeUndefined();
    expect((wedding.priceSpecification as Record<string, unknown>).minPrice).toBe(min);
  });

  it("never emits aggregateRating, and never a FAQPage on a dossier", () => {
    for (const locale of activeLocales) {
      for (const genre of GENRES) {
        const json = JSON.stringify(build(locale, genre));
        expect(json).not.toContain("aggregateRating");
        expect(json).not.toContain("FAQPage");
      }
    }
  });

  it("a séance claims only the Lyon area; a wedding also claims France", () => {
    // The page states its own coverage, so the markup must match what the visitor reads.
    const dict = getDictionary(defaultLocale);
    const all = dict.locations.areas.map((a) => a.label);
    expect(all).toHaveLength(2);
    const wedding = build(defaultLocale, "mariages").areaServed as Array<{ name: string }>;
    expect(wedding.map((a) => a.name)).toEqual(all);
  });
});
