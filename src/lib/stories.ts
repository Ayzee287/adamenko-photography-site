// The publish gate + locale resolution for stories.
//
// One rule, enforced in one place: NOTHING but `portfolio` reaches the public site.
// `draft` is visible only when running locally, so the photographer can look at a story
// before deciding; `private` is never routed at all. Pages, static params, sitemap and
// navigation all read through here, so there is no second path that could leak a story.

import { stories } from "@/content/stories.generated";
import type { Story } from "@/types/story";
import type { GenreSlug } from "@/types/gallery";
import type { Locale } from "@/lib/i18n";

/**
 * Drafts are browsable off-production only. This mirrors the review-mode convention used
 * elsewhere in the studio: `NODE_ENV !== "production"` rather than a runtime env var, so a
 * production build cannot be talked into exposing a draft by configuration.
 */
const includeDrafts = process.env.NODE_ENV !== "production";

/** Every story the current environment may show, in the order the generator emitted. */
export const visibleStories: Story[] = stories.filter(
  (s) => s.visibility === "portfolio" || (includeDrafts && s.visibility === "draft"),
);

/** Stories in one category. Newest first when dated; undated stories keep generator order. */
export function storiesIn(category: GenreSlug): Story[] {
  return visibleStories
    .filter((s) => s.category === category)
    .slice()
    .sort((a, b) => (b.date || "").localeCompare(a.date || ""));
}

export function findStory(category: string, slug: string): Story | undefined {
  return visibleStories.find((s) => s.category === category && s.slug === slug);
}

/** `generateStaticParams` fodder — only what may be built. */
export const allStoryParams: Array<{ genre: string; story: string }> = visibleStories.map((s) => ({
  genre: s.category,
  story: s.slug,
}));

/** True when a category has stories to index (drives the genre page's shape). */
export function hasStories(category: GenreSlug): boolean {
  return visibleStories.some((s) => s.category === category);
}

type Localized = { fr: string; en: string };
const pick = (v: Localized, locale: Locale) => (locale === "en" ? v.en || v.fr : v.fr);

export const storyTitle = (s: Story, locale: Locale) => pick(s.title, locale);
export const storyDescription = (s: Story, locale: Locale) => pick(s.description, locale);
export const storyAlt = (img: { alt: string; altEn: string }, locale: Locale) =>
  locale === "en" ? img.altEn || img.alt : img.alt;

/**
 * A story's date, formatted for display, or "" when undated. Month precision only: the
 * exact day of a private event is more than a public portfolio needs to say.
 */
export function storyDateLabel(s: Story, locale: Locale): string {
  if (!s.date) return "";
  const d = new Date(`${s.date}T12:00:00Z`);
  if (Number.isNaN(d.getTime())) return "";
  return new Intl.DateTimeFormat(locale === "en" ? "en-GB" : "fr-FR", {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(d);
}
