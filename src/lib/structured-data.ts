// JSON-LD structured data (locale-aware). Built from the typed content via the
// dictionary so it can never drift from the UI and so it localizes for free once a
// locale ships (description + future localized fields resolve through getDictionary,
// French as the fallback). A photography studio is a local service business →
// LocalBusiness, with the photographer as a linked Person and `areaServed` sourced
// from the locations model. Unknown fields are OMITTED, never faked.

import { photographer } from "@/content/photographer";
import { locations } from "@/content/locations";
import { absoluteUrl } from "@/lib/site";
import { defaultLocale, type Locale } from "@/lib/i18n";
import { getDictionary } from "@/lib/dictionary";

type JsonLdObject = Record<string, unknown>;

// schema.org areaServed prefers Place subtypes; "Continent" isn't a clean areaServed
// type, so it maps to the generic Place.
function areaType(schemaType: string): string {
  return schemaType === "Continent" ? "Place" : schemaType;
}

/** LocalBusiness graph for the site (injected once, site-wide, in the root layout). */
export function localBusinessJsonLd(locale: Locale = defaultLocale): JsonLdObject {
  const dict = getDictionary(locale);
  const { location, contact, specialties } = photographer;

  const address: JsonLdObject = {
    "@type": "PostalAddress",
    addressLocality: location.city,
    addressRegion: location.region,
    addressCountry: "FR",
  };
  if (location.streetAddress) address.streetAddress = location.streetAddress;
  if (location.postalCode) address.postalCode = location.postalCode;

  const sameAs = [contact.instagram].filter(Boolean);

  const business: JsonLdObject = {
    "@context": "https://schema.org",
    "@type": ["LocalBusiness", "ProfessionalService"],
    "@id": absoluteUrl("/#business"),
    name: photographer.brand,
    url: absoluteUrl("/"),
    image: absoluteUrl("/opengraph-image"),
    description: dict.site.tagline,
    address,
    areaServed: locations.areas.map((a) => ({
      "@type": areaType(a.schemaType),
      name: a.label,
    })),
    knowsAbout: specialties,
    sameAs,
  };

  if (contact.email) business.email = contact.email;
  if (contact.phone) business.telephone = contact.phone;

  if (photographer.name) {
    business.founder = {
      "@type": "Person",
      name: photographer.name,
      jobTitle: "Photographe",
    };
  }

  return business;
}
