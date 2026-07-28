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

import {
  activeLocales,
  defaultLocale,
  htmlLang,
  localizedPath,
  type Locale,
} from "@/lib/i18n";

/* ── Dynamic-segment slug tables (FR = filesystem slug, EN = public alias) ── */

export const serviceSlugs = {
  famille: "family",
  grossesse: "maternity",
  couple: "couple",
  mariage: "wedding",
} as const;

export const genreSlugs = {
  familles: "families",
  grossesse: "maternity",
  couples: "couples",
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
  // Contact can be opened with the séance already chosen. The slug is the FORM's submitted
  // value (the inquiry schema's enum), not a display string, so it stays French in both
  // locales — /en/contact?seance=mariage is correct, not a leak.
  | { page: "contact"; seance: ServiceSlug }
  | { page: "service"; service: ServiceSlug }
  | { page: "genre"; genre: GenreSlug }
  | { page: "story"; slug: string }
  // A story lives UNDER its category: /galeries/mariages/lucie-et-thomas. The nesting is
  // the point — it states the hierarchy the portfolio actually has, gives the genre page a
  // natural role as the index, and clusters a wedding's page with its category for search.
  // The story slug is shared across locales (it is the folder name on disk).
  | { page: "genreStory"; genre: GenreSlug; story: string };

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
    case "contact": {
      const base = prefix(locale, staticPages.contact[locale === "fr" ? "fr" : "en"]);
      return "seance" in ref && ref.seance ? `${base}?seance=${ref.seance}` : base;
    }
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
    case "genreStory": {
      const base = staticPages.galeries[locale === "fr" ? "fr" : "en"];
      const genre = locale === "fr" ? ref.genre : genreSlugs[ref.genre];
      return prefix(locale, `${base}/${genre}/${ref.story}`);
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
  // "Prestations" was removed from the nav (D095): its index duplicated the homepage
  // genre plates + the galleries index, and /tarifs is now the single "what I offer & what
  // it costs" hub. The per-service dossiers (/prestations/[service]) live on as SEO landing
  // pages, reached from Tarifs — not as a top-level destination.
  { id: "galeries", label: { fr: "Galeries", en: "Galleries" } },
  { id: "tarifs", label: { fr: "Tarifs", en: "Pricing" } },
  { id: "seances", label: { fr: "Séances", en: "Stories" }, gated: "showSeances" },
  { id: "a-propos", label: { fr: "À propos", en: "About" } },
  { id: "contact", label: { fr: "Contact", en: "Contact" } },
];

/* ── Service inventory (the four commercial dossiers, for the footer index) ──
   D095 kept "Prestations" out of the HEADER and that stands: the header is a short list of
   destinations, and /tarifs is the hub. The footer is a different object — it calls itself
   the site's complete index — and these four pages were missing from it. Measured
   2026-07-28 on the built site: /prestations/{service} was linked from /tarifs and from its
   own genre pages and nowhere else, so the four pages the business actually sells on had
   one or two internal links each while the site had zero indexed URLs. Order matches the
   header's logic — the work first, by what is most asked for. */

export const serviceInventory: ReadonlyArray<{
  id: ServiceSlug;
  label: Record<"fr" | "en", string>;
}> = [
  { id: "mariage", label: { fr: "Mariage", en: "Wedding" } },
  { id: "famille", label: { fr: "Famille", en: "Family" } },
  { id: "grossesse", label: { fr: "Grossesse", en: "Maternity" } },
  { id: "couple", label: { fr: "Couple", en: "Couple" } },
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

  // /galeries/<genre>/<story> — the only three-segment shape on the site.
  if (segments.length === 3) {
    const [head, genreSeg, story] = segments;
    if (head === "galeries" || head === "galleries") {
      const genre = (genreSlugs[genreSeg as GenreSlug] ? genreSeg : genreFromEn[genreSeg]) as
        | GenreSlug
        | undefined;
      return genre && story ? { page: "genreStory", genre, story } : null;
    }
  }

  return null;
}

/* ── P14: English alias rewrites (the missing routing layer) ─────────────────────
   The filesystem is FR-shaped under app/[locale], and `link()` already emits the
   final LOCALIZED public EN slugs (…/en/about). This resolver — called by the proxy —
   closes the loop: it rewrites the localized public URL to the FR-slug route that
   actually exists (…/en/a-propos, prerendered), and 308-redirects the FR-slug form
   under /en to the localized canonical, so every page has exactly ONE URL. Paths the
   ref parser doesn't recognize (dev routes, unknowns) pass through untouched. */
export function resolveEnRoute(pathname: string): {
  action: "rewrite" | "redirect" | "pass";
  target?: string;
} {
  const p = pathname.replace(/\/+$/, "") || "/";
  const ref = refFromPathname(p);
  if (!ref) return { action: "pass" };
  const canonical = link("en", ref); // localized public URL, e.g. /en/about
  const frPath = link("fr", ref); // unprefixed FR-slug path, e.g. /a-propos
  const internal = frPath === "/" ? "/en" : `/en${frPath}`; // FR-slug route under /en
  // Someone hit the internal FR-slug form under /en → send them to the localized URL.
  if (p === internal && internal !== canonical) {
    return { action: "redirect", target: canonical };
  }
  // The localized public URL has no matching route folder → rewrite to the FR-slug route.
  if (p === canonical && canonical !== internal) {
    return { action: "rewrite", target: internal };
  }
  return { action: "pass" };
}

/* ── Localized hreflang/canonical for a FR canonical path ────────────────────────
   The ONE alternates system, shared by per-page metadata (seo.ts) and the sitemap, so
   canonical + hreflang + nav all speak the same localized-slug URLs (…/en/about). A
   path the ref parser can't map falls back to the prefix-only form. */
export function alternatesForPath(frPath: string, locale: Locale = defaultLocale) {
  const ref = refFromPathname(frPath);
  const urlFor = (l: Locale) => (ref ? link(l, ref) : localizedPath(l, frPath));
  const languages: Record<string, string> = {};
  for (const l of activeLocales) languages[htmlLang[l]] = urlFor(l);
  languages["x-default"] = urlFor(defaultLocale);
  return { canonical: urlFor(locale), languages };
}
