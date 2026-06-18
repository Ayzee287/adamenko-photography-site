import type { MetadataRoute } from "next";
import { INDEXABLE_PATHS } from "@/lib/seo";
import { genreSlugs } from "@/content/galleries";
import { absoluteUrl } from "@/lib/site";

// Fixed pages plus the five genre galleries, derived from the galleries
// collection so the sitemap cannot drift from the routable set. Absolute URLs
// come from the single resolved site origin (lib/site.ts) — no localhost leak.
export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();
  const paths = [
    ...INDEXABLE_PATHS,
    ...genreSlugs.map((slug) => `/galeries/${slug}`),
  ];

  return paths.map((path) => ({
    url: absoluteUrl(path),
    lastModified,
    changeFrequency: "monthly" as const,
    priority: path === "/" ? 1 : 0.7,
  }));
}
