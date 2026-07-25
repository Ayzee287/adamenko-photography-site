import type { Metadata } from "next";
import { site } from "@/content/site";
import { defaultLocale, ogLocale, type Locale } from "@/lib/i18n";
import { alternatesForPath } from "@/lib/routes";
import { getDictionary } from "@/lib/dictionary";

/** The localised home title / social headline: "<brand> · <localised descriptor>". */
export function headlineFor(locale: Locale = defaultLocale): string {
  return `${site.brand} · ${getDictionary(locale).copy.siteDescriptor}`;
}

// Per-page metadata builder. Next merges metadata shallowly and children inherit a
// parent's `alternates`/`openGraph` wholesale — so canonical MUST be set per page
// or every sub-page points at the home page. Page `title` is a plain string; the
// root layout's title template appends the brand suffix.
//
// Locale-aware by construction: canonical + hreflang come from the i18n seam and the
// OpenGraph locale from `ogLocale`. Pass the page's `locale` so the canonical is the
// localized path, the description falls back to the localized tagline, and og:locale
// is correct. OpenGraph/Twitter images are supplied site-wide by the `opengraph-image`/
// `twitter-image` file conventions in app/ and inherited by every page.

/** Indexable paths (canonical, FR-unprefixed) in sitemap order; genre galleries are
 *  appended in sitemap.ts. Each is emitted once per active locale. */
export const INDEXABLE_PATHS = [
  "/",
  "/galeries",
  "/tarifs",
  "/a-propos",
  "/contact",
  "/mentions-legales",
  "/confidentialite",
] as const;

export function buildMetadata({
  title,
  description,
  path = "/",
  locale = defaultLocale,
}: {
  title?: string;
  description?: string;
  path?: string;
  locale?: Locale;
}): Metadata {
  const desc = description ?? getDictionary(locale).site.tagline;
  const ogTitle = title ? `${title} · ${site.brand}` : headlineFor(locale);
  const alternates = alternatesForPath(path, locale);
  return {
    // Only set `title` when the page provides one. A present-but-`undefined` title
    // key is treated by Next's metadata merge as an explicit empty title and WIPES the
    // layout's `title.default` — which is exactly how the homepage (no page title) lost
    // its <title> entirely. Omitting the key lets the home inherit `title.default`
    // (= headlineFor(locale)); interior pages pass a string and get the template.
    ...(title !== undefined ? { title } : {}),
    description: desc,
    alternates,
    openGraph: {
      title: ogTitle,
      description: desc,
      url: alternates.canonical,
      siteName: site.brand,
      locale: ogLocale[locale],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: ogTitle,
      description: desc,
    },
  };
}
