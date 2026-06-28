import type { MetadataRoute } from "next";
import { INDEXABLE_PATHS } from "@/lib/seo";
import { genreSlugs } from "@/content/galleries";
import { absoluteUrl } from "@/lib/site";
import {
  activeLocales,
  defaultLocale,
  htmlLang,
  localizedPath,
} from "@/lib/i18n";

// Fixed pages plus the five genre galleries, derived from the galleries collection so
// the sitemap cannot drift from the routable set. Each path is emitted once per ACTIVE
// locale (French at the unprefixed root, English under /en), and every entry carries
// the full hreflang alternates + x-default, so search engines see the locale pairs.
export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();
  const paths = [
    ...INDEXABLE_PATHS,
    ...genreSlugs.map((slug) => `/galeries/${slug}`),
  ];

  const languagesFor = (path: string): Record<string, string> => {
    const languages: Record<string, string> = {};
    for (const l of activeLocales) {
      languages[htmlLang[l]] = absoluteUrl(localizedPath(l, path));
    }
    languages["x-default"] = absoluteUrl(localizedPath(defaultLocale, path));
    return languages;
  };

  return activeLocales.flatMap((locale) =>
    paths.map((path) => ({
      url: absoluteUrl(localizedPath(locale, path)),
      lastModified,
      changeFrequency: "monthly" as const,
      priority: path === "/" ? 1 : 0.7,
      alternates: { languages: languagesFor(path) },
    })),
  );
}
