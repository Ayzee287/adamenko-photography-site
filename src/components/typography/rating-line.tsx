// rating-line — ambient proof: the Google rating as plain text + the profile
// link (lives only inside the review group / proof chapters). Template and
// label come from content (home.reviews strings). Text only — this number is
// never emitted as self-serving structured data (frozen policy; the
// content-guards test enforces the banned key repo-wide).

import { TextLink } from "@/components/actions/text-link";
import type { Locale } from "@/lib/i18n";

export function RatingLine(props: {
  rating: number;
  count: number;
  href: string;
  summary: string; // e.g. "Note Google {rating} / 5 · d'après {count} avis"
  linkLabel: string; // e.g. "Voir tous les avis sur Google"
  locale: Locale;
}) {
  const { rating, count, href, summary, linkLabel, locale } = props;
  const formatted = rating.toLocaleString(locale === "fr" ? "fr-FR" : "en-GB", {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  });
  const text = summary
    .replace("{rating}", formatted)
    .replace("{count}", String(count));
  return (
    <p className="flex flex-wrap items-center gap-3 text-small text-ink-secondary">
      <span>{text}</span>
      <TextLink href={href}>{linkLabel}</TextLink>
    </p>
  );
}
