// THE route registry — single source of truth for every locale-aware path
// (Frontend Architecture §3). Consumed by: internal links (`link`), navigation
// (`navInventory`), hreflang/canonical (`getAlternates`), sitemap (P16),
// EN alias rewrites + V1 301 map (P14/P16 read the same tables).
//
// Filesystem is FR-shaped under `app/[locale]`; FR is canonical and
// UNPREFIXED (the kept proxy rewrites "/" → "/fr"). EN uses localized public
// slugs (frozen Addendum C3 table) served via build-time rewrites from P14 —
// until then, `link()` already returns the final public EN paths, so no
// call-site ever changes.

import type { Locale } from "@/lib/i18n";

/* ── Dynamic-segment slug tables (FR = filesystem slug, EN = public alias) ── */

export const serviceSlugs = {
  famille: "family",
  grossesse: "maternity",
  couple: "couple",
  mariage: "wedding",
  portrait: "portrait",
} as const;

export const genreSlugs = {
  familles: "families",
  grossesse: "maternity",
  couples: "couples",
  portraits: "portraits",
  mariages: "weddings",
} as const;

export type ServiceSlug = keyof typeof serviceSlugs;
export type GenreSlug = keyof typeof genreSlugs;

/* ── Static page inventory ── */

const staticPages = {
  home: { fr: "/", en: "/" },
  prestations: { fr: "/prestations", en: "/services" },
  galeries: { fr: "/galeries", en: "/galleries" },
  seances: { fr: "/seances", en: "/stories" },
  "a-propos": { fr: "/a-propos", en: "/about" },
  tarifs: { fr: "/tarifs", en: "/pricing" },
  contact: { fr: "/contact", en: "/contact" },
  "mentions-legales": { fr: "/mentions-legales", en: "/legal-notice" },
  confidentialite: { fr: "/confidentialite", en: "/privacy" },
} as const;

export type StaticPageId = keyof typeof staticPages;

export type PageRef =
  | { page: StaticPageId }
  | { page: "service"; service: ServiceSlug }
  | { page: "genre"; genre: GenreSlug }
  | { page: "story"; slug: string };

export const pageIds = Object.keys(staticPages) as StaticPageId[];

/* ── Path building ── */

function prefix(locale: Locale, path: string): string {
  const p = path === "/" ? "" : path;
  if (locale === "fr") return p === "" ? "/" : p;
  return `/${locale}${p}`;
}

/** The one legal way to build an internal href (lint-enforced from P5). */
export function link(locale: Locale, ref: PageRef): string {
  switch (ref.page) {
    case "service": {
      const base = staticPages.prestations[locale === "fr" ? "fr" : "en"];
      const slug = locale === "fr" ? ref.service : serviceSlugs[ref.service];
      return prefix(locale, `${base}/${slug}`);
    }
    case "genre": {
      const base = staticPages.galeries[locale === "fr" ? "fr" : "en"];
      const slug = locale === "fr" ? ref.genre : genreSlugs[ref.genre];
      return prefix(locale, `${base}/${slug}`);
    }
    case "story": {
      const base = staticPages.seances[locale === "fr" ? "fr" : "en"];
      return prefix(locale, `${base}/${ref.slug}`); // story slugs are shared across locales
    }
    default:
      return prefix(locale, staticPages[ref.page][locale === "fr" ? "fr" : "en"]);
  }
}

/** hreflang/canonical pairs for a page — fr, en and x-default (= fr). */
export function getAlternates(ref: PageRef): Record<"fr" | "en" | "x-default", string> {
  return {
    fr: link("fr", ref),
    en: link("en", ref),
    "x-default": link("fr", ref),
  };
}

/* ── Navigation inventory (frozen header order; Tarifs per Addendum M1; ──
   ── Séances gated by showSeances, labels per frozen EN set)            ── */

export const navInventory: ReadonlyArray<{
  id: StaticPageId;
  label: Record<"fr" | "en", string>;
  gated?: "showSeances";
}> = [
  { id: "galeries", label: { fr: "Galeries", en: "Galleries" } },
  { id: "prestations", label: { fr: "Prestations", en: "Services" } },
  { id: "tarifs", label: { fr: "Tarifs", en: "Pricing" } },
  { id: "seances", label: { fr: "Séances", en: "Stories" }, gated: "showSeances" },
  { id: "a-propos", label: { fr: "À propos", en: "About" } },
  { id: "contact", label: { fr: "Contact", en: "Contact" } },
];

/* ── Enumerations for generateStaticParams ── */

export const allServiceParams = Object.keys(serviceSlugs) as ServiceSlug[];
export const allGenreParams = Object.keys(genreSlugs) as GenreSlug[];

/* ── Reverse lookup — pathname → PageRef ─────────────────────────────────────
   Required by the frozen language switch ("preserves the current page"): the
   switch's hrefs are getAlternates(refFromPathname(pathname)). Matches both
   FR-shaped paths (today's reality on /en/* before the P14 rewrites) AND the
   EN public aliases (after them) — one function, both eras. */

function invert(map: Record<string, string>): Record<string, string> {
  return Object.fromEntries(Object.entries(map).map(([k, v]) => [v, k]));
}
const serviceFromEn = invert(serviceSlugs);
const genreFromEn = invert(genreSlugs);

export function refFromPathname(pathname: string): PageRef | null {
  let path = pathname.replace(/\/+$/, "") || "/";
  // Strip the locale prefix — including "/fr": the proxy serves FR unprefixed
  // by REWRITING to /fr/*, and usePathname reports the rewritten form.
  for (const prefix of ["/en", "/fr"]) {
    if (path === prefix || path.startsWith(`${prefix}/`)) {
      path = path.slice(prefix.length) || "/";
      break;
    }
  }
  const segments = path.split("/").filter(Boolean);

  if (segments.length === 0) return { page: "home" };

  if (segments.length === 1) {
    const hit = (Object.entries(staticPages) as Array<[StaticPageId, { fr: string; en: string }]>).find(
      ([, p]) => p.fr === `/${segments[0]}` || p.en === `/${segments[0]}`,
    );
    return hit ? { page: hit[0] } : null;
  }

  if (segments.length === 2) {
    const [head, tail] = segments;
    if (head === "prestations" || head === "services") {
      const service = (serviceSlugs[tail as ServiceSlug] ? tail : serviceFromEn[tail]) as
        | ServiceSlug
        | undefined;
      return service ? { page: "service", service } : null;
    }
    if (head === "galeries" || head === "galleries") {
      const genre = (genreSlugs[tail as GenreSlug] ? tail : genreFromEn[tail]) as
        | GenreSlug
        | undefined;
      return genre ? { page: "genre", genre } : null;
    }
    if (head === "seances" || head === "stories") {
      return { page: "story", slug: tail };
    }
  }

  return null;
}
