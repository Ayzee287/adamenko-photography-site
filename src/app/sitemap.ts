import type { MetadataRoute } from "next";
import { INDEXABLE_PATHS } from "@/lib/seo";
import { absoluteUrl } from "@/lib/site";
import { localizedAlternates } from "@/lib/i18n";
import { allGenreParams, allServiceParams } from "@/lib/routes";

// Every indexable path with its hreflang alternates — built from the same
// localizedAlternates() seam that buildMetadata() uses per page, so the sitemap URLs
// and the page canonicals can never disagree.
export default function sitemap(): MetadataRoute.Sitemap {
  const paths = [
    ...INDEXABLE_PATHS,
    "/tarifs",
    ...allGenreParams.map((g) => `/galeries/${g}`),
    ...allServiceParams.map((s) => `/prestations/${s}`),
  ];

  return paths.map((path) => {
    const alt = localizedAlternates(path);
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
