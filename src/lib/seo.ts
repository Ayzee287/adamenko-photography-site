import type { Metadata } from "next";
import { site } from "@/content/site";

// Per-page metadata builder (single-locale, D008). Next merges metadata
// shallowly and children inherit a parent's `alternates`/`openGraph` wholesale —
// so canonical MUST be set per page or every sub-page points at the home page.
// Page `title` is a plain string; the root layout's title template appends the
// brand suffix.

/** Indexable paths in sitemap order; genre galleries are appended in sitemap.ts. */
export const INDEXABLE_PATHS = [
  "/",
  "/galeries",
  "/a-propos",
  "/prestations",
  "/contact",
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
  const ogTitle = title ? `${title} — ${site.brand}` : `${site.brand} — Photographe à Lyon`;
  return {
    title,
    description: desc,
    alternates: { canonical: path },
    openGraph: {
      title: ogTitle,
      description: desc,
      url: path,
      siteName: site.brand,
      locale: "fr_FR",
      type: "website",
    },
  };
}
