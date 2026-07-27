// JSON-LD structured data (locale-aware). Built from the typed content via the
// dictionary so it can never drift from the UI and so it localizes for free once a
// locale ships (description + future localized fields resolve through getDictionary,
// French as the fallback). A photography studio is a local service business →
// LocalBusiness, with the photographer as a linked Person and `areaServed` sourced
// from the locations model. Unknown fields are OMITTED, never faked.

import { photographer } from "@/content/photographer";
import { home } from "@/content/home";
import { absoluteUrl } from "@/lib/site";
import { defaultLocale, type Locale } from "@/lib/i18n";
import { getDictionary } from "@/lib/dictionary";

type JsonLdObject = Record<string, unknown>;

/** Person.jobTitle, localised (proper-noun fields stay; this is a translatable label). */
const JOB_TITLE: Record<Locale, string> = {
  fr: "Photographe",
  en: "Photographer",
  ru: "Фотограф",
  uk: "Фотограф",
};

// schema.org areaServed prefers Place subtypes; "Continent" isn't a clean areaServed
// type, so it maps to the generic Place.
function areaType(schemaType: string): string {
  return schemaType === "Continent" ? "Place" : schemaType;
}

/** LocalBusiness graph for the site (injected once, site-wide, in the root layout). */
export function localBusinessJsonLd(locale: Locale = defaultLocale): JsonLdObject {
  const dict = getDictionary(locale);
  // Address + contact are locale-independent (proper nouns / facts); the specialties
  // and area labels localise via the dictionary.
  const { location, contact } = photographer;
  const specialties = dict.photographer.specialties;

  const address: JsonLdObject = {
    "@type": "PostalAddress",
    addressLocality: location.city,
    addressRegion: location.region,
    addressCountry: "FR",
  };
  if (location.streetAddress) address.streetAddress = location.streetAddress;
  if (location.postalCode) address.postalCode = location.postalCode;

  // Public profiles that corroborate the business identity (local-SEO / E-E-A-T).
  // Telegram is deliberately excluded (personal account, not a business channel).
  const sameAs = [contact.instagram, contact.facebook].filter(Boolean);

  const business: JsonLdObject = {
    "@context": "https://schema.org",
    "@type": ["LocalBusiness", "ProfessionalService"],
    "@id": absoluteUrl("/#business"),
    name: photographer.brand,
    url: absoluteUrl("/"),
    // A real signature photograph (better for local SEO than the typographic card).
    // Derived from the hero content so it can never drift from the actual asset
    // (the hardcoded "/home/hero.jpg" 404'd — the real file is hero-lavande.jpg).
    image: absoluteUrl(home.hero.image.src),
    description: dict.site.tagline,
    address,
    areaServed: dict.locations.areas.map((a) => ({
      "@type": areaType(a.schemaType),
      name: a.label,
    })),
    knowsAbout: [...specialties],
    sameAs,
  };

  if (contact.email) business.email = contact.email;
  if (contact.phone) business.telephone = contact.phone;

  if (photographer.name) {
    const founder: JsonLdObject = {
      "@type": "Person",
      name: photographer.name,
      jobTitle: JOB_TITLE[locale],
    };
    if (photographer.portrait?.src) founder.image = absoluteUrl(photographer.portrait.src);
    business.founder = founder;
  }

  return business;
}

/** FAQPage for the questions actually rendered on /tarifs.
 *
 *  Sourced from the same `dict.faq` the accordion renders, so the markup can never
 *  describe a question the visitor cannot see — which is precisely the condition
 *  Google's FAQ guidelines impose. Emitted ONLY on the page that shows the FAQ;
 *  duplicating it site-wide would mark up content that is not on the page. */
export function faqPageJsonLd(locale: Locale = defaultLocale): JsonLdObject {
  const { items } = getDictionary(locale).faq;
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: { "@type": "Answer", text: item.a },
    })),
  };
}

/** BreadcrumbList for a nested page.
 *
 *  The hierarchy is already real — a story lives under its category, a dossier under
 *  its section — so this only states in machine-readable form what the URL already
 *  says. Positions are 1-based and the trail always starts at the localized home.
 *  `url` values must be absolute for Google to resolve them. */
export function breadcrumbJsonLd(trail: ReadonlyArray<{ name: string; path: string }>): JsonLdObject {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: trail.map((crumb, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: crumb.name,
      item: absoluteUrl(crumb.path),
    })),
  };
}
