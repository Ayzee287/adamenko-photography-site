// Base metadata builder (Architecture §13 — the scaffold; page-level
// metadata, JSON-LD and alternates land in P16). Mined from V1's
// production-proven layout metadata verbatim.

import type { Metadata } from "next";
import type { Locale } from "@/lib/i18n";
import { ogLocale } from "@/lib/i18n";
import { siteUrl, allowIndexing } from "@/lib/site";
import { site } from "@/content/site";
import { headlineFor } from "@/lib/seo";
import { getDictionary } from "@/lib/dictionary";

export function buildBaseMetadata(locale: Locale): Metadata {
  const dict = getDictionary(locale);
  return {
    metadataBase: siteUrl,
    title: {
      default: headlineFor(locale),
      template: `%s · ${site.brand}`,
    },
    description: dict.site.tagline,
    // Belt-and-braces with robots (P16): non-production deploys also carry a
    // meta noindex so a preview URL is never indexed even if robots.txt is
    // bypassed (V1 SEO5 rule — VERCEL_ENV gates it).
    robots: allowIndexing ? undefined : { index: false, follow: false },
    openGraph: {
      siteName: site.brand,
      locale: ogLocale[locale],
      type: "website",
    },
  };
}
