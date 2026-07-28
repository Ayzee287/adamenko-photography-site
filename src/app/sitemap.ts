import type { MetadataRoute } from "next";
import { INDEXABLE_PATHS } from "@/lib/seo";
import { absoluteUrl } from "@/lib/site";
import { alternatesForPath, allGenreParams, allServiceParams } from "@/lib/routes";
import { activeLocales, type Locale } from "@/lib/i18n";
import { visibleStories } from "@/lib/stories";

// Every indexable path with its hreflang alternates — built from the same
// alternatesForPath() seam that buildMetadata() uses per page, so the sitemap URLs and
// the page canonicals can never disagree (localized EN slugs on both).
//
// ── Two corrections, 2026-07-28 ─────────────────────────────────────────────────
//
// ONE ENTRY PER LANGUAGE, not one per FR path. The file used to emit only the French
// canonical and hang the English URL off it as an `xhtml:link` alternate. Google's
// requirement is the other way round: *each* language version needs its own `<loc>`,
// carrying the complete set of alternates including itself. So half the site — all 30
// English URLs — was reachable and canonical but never actually submitted. Measured on
// production before this change: 60 pages crawlable from the homepage, 30 in the sitemap.
//
// `lastModified` ONLY WHERE IT IS TRUE. It used to be `new Date()`, so every one of the
// 30 URLs claimed to have changed at build time — a fresh lie on every deploy. Google
// states it may ignore lastmod entirely once it looks inaccurate, which would have cost
// us the signal on the pages where we DO know the date. Story pages have a real content
// date (earliest EXIF capture, or the human's override); everything else has none that
// the build can honestly compute, so it says nothing rather than something false.
export default function sitemap(): MetadataRoute.Sitemap {
  /** A real content date, where one exists. Keyed by FR path. */
  const contentDate = new Map<string, string>();
  for (const s of visibleStories) {
    if (s.date) contentDate.set(`/galeries/${s.category}/${s.slug}`, s.date);
  }

  const paths = [
    // INDEXABLE_PATHS already carries "/tarifs" — genre + per-service pages are appended.
    ...INDEXABLE_PATHS,
    ...allGenreParams.map((g) => `/galeries/${g}`),
    ...allServiceParams.map((s) => `/prestations/${s}`),
    // Story pages, read through the same publish gate as the routes themselves — a draft
    // has no page, so it must not have a sitemap entry either. In a production build
    // `visibleStories` is portfolio-only, so this cannot advertise an unpublished shoot.
    ...visibleStories.map((s) => `/galeries/${s.category}/${s.slug}`),
  ];

  return paths.flatMap((path) => {
    // The alternates are identical for every language version of a page, so they are
    // computed once and shared — which is also what guarantees each entry lists itself.
    const languages = Object.fromEntries(
      Object.entries(alternatesForPath(path).languages).map(([k, v]) => [k, absoluteUrl(v)]),
    );
    const date = contentDate.get(path);

    return activeLocales.map((locale: Locale) => ({
      url: absoluteUrl(alternatesForPath(path, locale).canonical),
      ...(date ? { lastModified: new Date(`${date}T00:00:00Z`) } : {}),
      alternates: { languages },
    }));
  });
}
