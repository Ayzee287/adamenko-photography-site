import type { Metadata } from "next";
import { site } from "@/content/site";
import { absoluteUrl } from "@/lib/site";
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
// is correct.
//
// ── OG IMAGES, corrected 2026-07-28 ──────────────────────────────────────────────
// This block used to claim the `opengraph-image`/`twitter-image` file conventions were
// "inherited by every page". Production disproved it: 60 of 62 URLs shipped no
// `og:image` at all. The convention only survives on segments that DON'T declare their
// own `openGraph` — returning an explicit `openGraph` object here replaces the
// segment's, images included. Only `/` and `/en` (which never call this) kept theirs.
//
// So the image is now passed explicitly. `image` lets a page nominate a real
// photograph — which is the whole point for a photography site, where the shared card
// should be the work rather than a generated wordmark. Anything that doesn't nominate
// one falls back to the locale's generated card, so no page is ever imageless again.

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
  image,
  imageAlt,
}: {
  title?: string;
  description?: string;
  path?: string;
  locale?: Locale;
  /** A real photograph for the share card, site-root-relative. Falls back to the
   *  generated locale card when a page has no single representative frame. */
  image?: string;
  imageAlt?: string;
}): Metadata {
  const desc = description ?? getDictionary(locale).site.tagline;
  const ogTitle = title ? `${title} · ${site.brand}` : headlineFor(locale);
  const alternates = alternatesForPath(path, locale);
  // Dimensions are declared ONLY for the generated card, which really is 1200x630. A
  // nominated photograph is whatever aspect the frame was shot at, so it ships without
  // width/height rather than with a convenient lie — the platforms read the real file and
  // crop it themselves, and a wrong declared size is worse than an absent one.
  const images = [
    image
      ? { url: absoluteUrl(image), alt: imageAlt ?? ogTitle }
      : { url: absoluteUrl(`/${locale}/opengraph-image`), width: 1200, height: 630, alt: ogTitle },
  ];
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
      images,
    },
    twitter: {
      card: "summary_large_image",
      title: ogTitle,
      description: desc,
      images,
    },
  };
}
