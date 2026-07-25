import type { MetadataRoute } from "next";
import { INDEXABLE_PATHS } from "@/lib/seo";
import { absoluteUrl } from "@/lib/site";
import { alternatesForPath, allGenreParams, allServiceParams } from "@/lib/routes";

// Every indexable path with its hreflang alternates — built from the same
// alternatesForPath() seam that buildMetadata() uses per page, so the sitemap URLs and
// the page canonicals can never disagree (localized EN slugs on both).
export default function sitemap(): MetadataRoute.Sitemap {
  const paths = [
    // INDEXABLE_PATHS already carries "/tarifs" — genre + per-service pages are appended.
    ...INDEXABLE_PATHS,
    ...allGenreParams.map((g) => `/galeries/${g}`),
    ...allServiceParams.map((s) => `/prestations/${s}`),
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
