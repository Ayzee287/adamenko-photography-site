import type { Metadata } from "next";
import { site, siteHeadline } from "@/content/site";
import { defaultLocale, localizedAlternates, ogLocale } from "@/lib/i18n";

// Per-page metadata builder. Next merges metadata shallowly and children inherit a
// parent's `alternates`/`openGraph` wholesale — so canonical MUST be set per page
// or every sub-page points at the home page. Page `title` is a plain string; the
// root layout's title template appends the brand suffix.
//
// Locale-aware by construction (sprint task 4): canonical + hreflang come from the
// i18n seam and the OpenGraph locale from `ogLocale`, so adding `/en` later needs
// no change here. OpenGraph/Twitter images are supplied site-wide by the
// `opengraph-image`/`twitter-image` file conventions in app/ and inherited by
// every page, so they are not repeated per page.

/** Indexable paths in sitemap order; genre galleries are appended in sitemap.ts. */
export const INDEXABLE_PATHS = [
  "/",
  "/galeries",
  "/a-propos",
  "/prestations",
  "/contact",
  "/mentions-legales",
  "/confidentialite",
] as const;

export function buildMetadata({
  title,
  description,
  path = "/",
}: {
  title?: string;
  description?: string;
  path?: string;
}): Metadata {
  const desc = description ?? site.tagline;
  const ogTitle = title ? `${title} · ${site.brand}` : siteHeadline;
  return {
    title,
    description: desc,
    alternates: localizedAlternates(path),
    openGraph: {
      title: ogTitle,
      description: desc,
      url: path,
      siteName: site.brand,
      locale: ogLocale[defaultLocale],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: ogTitle,
      description: desc,
    },
  };
}
