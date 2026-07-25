"use client";

// voices — the reviews, told two ways. On a wide screen they hang as quiet quotes side by
// side (the photography stays the hero; the words are overheard in the dark). On a phone that
// same wall was a long scroll of text, so there they become a horizontal, snap-scrolling
// carousel: one review at a time, the next one peeking to invite a swipe, dots to show how many
// there are and let you jump. Each quote is REAL — the verbatim Google review. When Google
// wrote it in another language the card shows its translation with a one-tap toggle back to the
// original; a long review clamps to a glance with "read more"; the star rating, the source and
// the date carry the proof, and the aggregate links out to the full profile. Nothing invented.

import { useRef, useState } from "react";

type Voice = {
  /** The words in their ORIGINAL language (verbatim). */
  quote: string;
  /** BCP-47 language of `quote` — sets the correct lang attribute + drives the toggle. */
  language?: string;
  /** Google's per-locale machine translations of `quote`. */
  translations?: Partial<Record<string, string>>;
  name: string;
  rating?: number;
  /** ISO YYYY-MM of the session — shown quietly on the card. */
  date?: string;
};

/** Clamp long reviews to a glance; the full words stay one tap away (never truncated data). */
const CLAMP_CHARS = 210;

function Stars({ n }: { n: number }) {
  return (
    <span className="ch-voice-stars" aria-label={`${n} / 5`}>
      {Array.from({ length: 5 }, (_, i) => (
        <span key={i} className={i < n ? "on" : ""} aria-hidden>
          ★
        </span>
      ))}
    </span>
  );
}

function formatDate(ym: string | undefined, locale: string): string | null {
  if (!ym) return null;
  const [y, m] = ym.split("-").map(Number);
  if (!y || !m) return null;
  try {
    return new Intl.DateTimeFormat(locale === "en" ? "en-GB" : "fr-FR", {
      month: "long",
      year: "numeric",
    }).format(new Date(y, m - 1, 1));
  } catch {
    return null;
  }
}

function VoiceCard(props: {
  voice: Voice;
  locale: string;
  attribution: string;
  readMore: string;
  readLess: string;
  viewOriginal: string;
  viewTranslation: string;
}) {
  const { voice, locale, attribution, readMore, readLess, viewOriginal, viewTranslation } = props;
  const [showOriginal, setShowOriginal] = useState(false);
  const [expanded, setExpanded] = useState(false);

  const translation = voice.translations?.[locale];
  const hasTranslation = Boolean(translation && translation !== voice.quote);
  const showingTranslation = hasTranslation && !showOriginal;

  const text = showingTranslation ? (translation as string) : voice.quote;
  const lang = showingTranslation ? locale : voice.language;

  const isLong = text.length > CLAMP_CHARS;
  const display = !isLong || expanded ? text : `${text.slice(0, CLAMP_CHARS).trimEnd()}…`;
  const date = formatDate(voice.date, locale);

  return (
    <figure className="ch-voice">
      {voice.rating ? <Stars n={voice.rating} /> : null}
      <blockquote className={`ch-voice-quote${expanded ? " is-open" : ""}`} lang={lang}>
        « {display} »
      </blockquote>

      {(isLong || hasTranslation) && (
        <div className="ch-voice-actions">
          {isLong && (
            <button
              type="button"
              className="ch-voice-toggle"
              aria-expanded={expanded}
              onClick={() => setExpanded((v) => !v)}
            >
              {expanded ? readLess : readMore}
            </button>
          )}
          {hasTranslation && (
            <button
              type="button"
              className="ch-voice-toggle"
              onClick={() => setShowOriginal((v) => !v)}
            >
              {showingTranslation ? viewOriginal : viewTranslation}
            </button>
          )}
        </div>
      )}

      <figcaption className="ch-voice-cite">
        {voice.name}
        <span className="ch-voice-meta">
          {attribution}
          {date ? ` · ${date}` : ""}
        </span>
      </figcaption>
    </figure>
  );
}

export function Voices(props: {
  items: Voice[];
  locale: string;
  attribution: string;
  carouselLabel: string;
  readMore: string;
  readLess: string;
  viewOriginal: string;
  viewTranslation: string;
  aggregate?: { rating: number; count: number } | null;
  aggregateTemplate?: string;
  viewAllLabel?: string;
  viewAllHref?: string;
}) {
  const {
    items,
    locale,
    attribution,
    carouselLabel,
    readMore,
    readLess,
    viewOriginal,
    viewTranslation,
    aggregate,
    aggregateTemplate,
    viewAllLabel,
    viewAllHref,
  } = props;
  const railRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);

  const onScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const el = e.currentTarget;
    const center = el.scrollLeft + el.clientWidth / 2;
    let best = 0;
    let bestD = Infinity;
    Array.from(el.children).forEach((c, i) => {
      const child = c as HTMLElement;
      const d = Math.abs(child.offsetLeft + child.offsetWidth / 2 - center);
      if (d < bestD) {
        bestD = d;
        best = i;
      }
    });
    setActive(best);
  };

  const toCard = (i: number) => {
    const child = railRef.current?.children[i] as HTMLElement | undefined;
    child?.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
  };

  const aggregateLine =
    aggregate && aggregateTemplate
      ? aggregateTemplate
          .replace("{rating}", String(aggregate.rating))
          .replace("{count}", String(aggregate.count))
      : null;

  return (
    <div className="ch-voices">
      <div
        className="ch-voices-rail"
        ref={railRef}
        onScroll={onScroll}
        role="group"
        aria-label={carouselLabel}
      >
        {items.map((v, i) => (
          <VoiceCard
            key={i}
            voice={v}
            locale={locale}
            attribution={attribution}
            readMore={readMore}
            readLess={readLess}
            viewOriginal={viewOriginal}
            viewTranslation={viewTranslation}
          />
        ))}
      </div>

      {items.length > 1 && (
        <div className="ch-voices-dots" role="tablist" aria-label={carouselLabel}>
          {items.map((_, i) => (
            <button
              key={i}
              type="button"
              className={i === active ? "on" : ""}
              aria-label={`${i + 1} / ${items.length}`}
              aria-selected={i === active}
              role="tab"
              onClick={() => toCard(i)}
            />
          ))}
        </div>
      )}

      {(aggregateLine || viewAllHref) && (
        <p className="ch-voices-agg">
          {aggregateLine}
          {aggregateLine && viewAllHref ? (
            <span className="ch-voices-agg-sep" aria-hidden>
              {" · "}
            </span>
          ) : null}
          {viewAllHref && viewAllLabel && (
            <a
              href={viewAllHref}
              target="_blank"
              rel="noopener noreferrer"
              className="ch-voices-agg-link"
            >
              {viewAllLabel}
            </a>
          )}
        </p>
      )}
    </div>
  );
}
