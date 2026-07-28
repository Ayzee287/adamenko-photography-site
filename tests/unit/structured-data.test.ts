// Structured-data builders (SEO growth phase, batch 1).
//
// The two per-page graphs are only worth emitting if they stay TRUE: a FAQPage that
// claims a question the page does not answer, or a breadcrumb naming a URL that
// redirects, is worse than no markup at all. These tests pin both properties to the
// content model rather than to a snapshot, so a future content edit cannot silently
// invalidate the markup.
//
// The site-wide LocalBusiness node is covered by content-guards.test.ts (which also
// enforces the frozen "no aggregateRating" policy).

import { describe, expect, it } from "vitest";
import { faqPageJsonLd, breadcrumbJsonLd, webSiteJsonLd } from "@/lib/structured-data";
import { getDictionary } from "@/lib/dictionary";
import { activeLocales } from "@/lib/i18n";
import { faq } from "@/content/faq";
import { photographer } from "@/content/photographer";
import { absoluteUrl } from "@/lib/site";

describe("webSiteJsonLd", () => {
  it("states the site name Google should show, from the content model not a literal", () => {
    const ld = webSiteJsonLd();
    expect(ld["@type"]).toBe("WebSite");
    expect(ld.name).toBe(photographer.brand);
    expect(ld.alternateName).toBe(photographer.shortBrand);
  });

  it("points url at the domain root — Google requires the root URI, not a subpath", () => {
    // Asserted through absoluteUrl so the test pins the SHAPE (root, absolute, trailing
    // slash) rather than whichever base URL the environment happens to supply.
    expect(webSiteJsonLd().url).toBe(absoluteUrl("/"));
    expect(String(webSiteJsonLd().url)).toMatch(/\/$/);
  });

  it("links the publisher to the one business node instead of restating it", () => {
    const publisher = webSiteJsonLd().publisher as { "@id": string };
    expect(publisher["@id"]).toBe(absoluteUrl("/#business"));
  });
});

describe("faqPageJsonLd", () => {
  it("marks up every question the page renders, and only those", () => {
    const ld = faqPageJsonLd("fr");
    expect(ld["@type"]).toBe("FAQPage");
    const entities = ld.mainEntity as Array<{ name: string; acceptedAnswer: { text: string } }>;
    expect(entities).toHaveLength(faq.items.length);
    expect(entities.map((e) => e.name)).toEqual(faq.items.map((i) => i.q));
  });

  it("gives every question a non-empty answer (an empty Answer is invalid markup)", () => {
    for (const locale of activeLocales) {
      const entities = faqPageJsonLd(locale).mainEntity as Array<{
        name: string;
        acceptedAnswer: { "@type": string; text: string };
      }>;
      for (const e of entities) {
        expect(e.name.trim().length).toBeGreaterThan(0);
        expect(e.acceptedAnswer["@type"]).toBe("Answer");
        expect(e.acceptedAnswer.text.trim().length).toBeGreaterThan(0);
      }
    }
  });

  it("follows the locale, so the EN page never ships French questions", () => {
    const en = faqPageJsonLd("en").mainEntity as Array<{ name: string }>;
    const expected = getDictionary("en").faq.items.map((i) => i.q);
    expect(en.map((e) => e.name)).toEqual(expected);
  });
});

describe("breadcrumbJsonLd", () => {
  const trail = [
    { name: "Accueil", path: "/" },
    { name: "Galeries", path: "/galeries" },
    { name: "Mariages", path: "/galeries/mariages" },
  ];

  it("numbers positions from 1, in order", () => {
    const items = breadcrumbJsonLd(trail).itemListElement as Array<{
      position: number;
      name: string;
    }>;
    expect(items.map((i) => i.position)).toEqual([1, 2, 3]);
    expect(items.map((i) => i.name)).toEqual(["Accueil", "Galeries", "Mariages"]);
  });

  it("emits ABSOLUTE urls — Google cannot resolve a relative crumb", () => {
    const items = breadcrumbJsonLd(trail).itemListElement as Array<{ item: string }>;
    for (const i of items) expect(i.item).toMatch(/^https?:\/\//);
  });

  it("is a well-formed, empty-safe ItemList", () => {
    const ld = breadcrumbJsonLd([]);
    expect(ld["@type"]).toBe("BreadcrumbList");
    expect(ld.itemListElement).toEqual([]);
  });
});
