import type { MetadataRoute } from "next";
import { INDEXABLE_PATHS } from "@/lib/seo";
import { absoluteUrl } from "@/lib/site";
import { alternatesForPath, allGenreParams, allServiceParams } from "@/lib/routes";
import { visibleStories } from "@/lib/stories";

// Every indexable path with its hreflang alternates — built from the same
// alternatesForPath() seam that buildMetadata() uses per page, so the sitemap URLs and
// the page canonicals can never disagree (localized EN slugs on both).
export default function sitemap(): MetadataRoute.Sitemap {
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

  return paths.map((path) => {
    const alt = alternatesForPath(path);
    return {
      url: absoluteUrl(alt.canonical),
      lastModified: new Date(),
      alternates: {
        languages: Object.fromEntries(
          Object.entries(alt.languages).map(([k, v]) => [k, absoluteUrl(v)]),
        ),
      },
    };
  });
}
