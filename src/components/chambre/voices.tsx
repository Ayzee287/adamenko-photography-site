"use client";

// voices — the reviews as an editorial reader: ONE real Google review at a time, its full
// words shown (never truncated), held in a fixed "stage" that is always as tall as the
// LONGEST review — so moving between reviews cross-fades in place and never shifts the page.
// Quiet paddles, position dots and a horizontal swipe move between them; a review written in
// another language shows its translation with a one-tap toggle back to the verbatim original.
// The section heading and the aggregate line below carry the Google attribution once, so each
// quote needs only a name and a date. Nothing invented.
//
// Why a reader, not the old card carousel: it removes — structurally — the problems the cards
// had (uneven heights, the section jumping when a card expanded, long reviews truncated with
// "…", and per-card "Avis Google" repetition). Touch hover-stick is avoided by gating hover
// styling to fine-pointer devices (chambre.css).

import { useCallback, useRef, useState } from "react";

type Voice = {
  /** The words in their ORIGINAL language (verbatim). */
  quote: string;
  /** BCP-47 language of `quote`. */
  language?: string;
  /** Google's per-locale machine translations of `quote`. */
  translations?: Partial<Record<string, string>>;
  name: string;
  rating?: number;
  /** ISO YYYY-MM of the session. */
  date?: string;
};

function Stars({ n }: { n: number }) {
  return (
    <span className="ch-voice-stars" role="img" aria-label={`${n} / 5`}>
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

export function Voices(props: {
  items: Voice[];
  locale: string;
  carouselLabel: string;
  viewOriginal: string;
  viewTranslation: string;
  prevLabel: string;
  nextLabel: string;
  aggregate?: { rating: number; count: number } | null;
  aggregateTemplate?: string;
  viewAllLabel?: string;
  viewAllHref?: string;
}) {
  const {
    items,
    locale,
    carouselLabel,
    viewOriginal,
    viewTranslation,
    prevLabel,
    nextLabel,
    aggregate,
    aggregateTemplate,
    viewAllLabel,
    viewAllHref,
  } = props;
  const n = items.length;
  const [active, setActive] = useState(0);
  // Per-view toggle: show the verbatim original instead of the locale translation. Reset on move.
  const [showOriginal, setShowOriginal] = useState(false);

  const go = useCallback(
    (delta: number) => {
      if (n < 2) return;
      setActive((a) => (a + delta + n) % n);
      setShowOriginal(false);
    },
    [n],
  );
  const jump = useCallback((i: number) => {
    setActive(i);
    setShowOriginal(false);
  }, []);

  // Horizontal swipe (touch/pen) → previous / next. Mouse uses the paddles + arrow keys.
  const drag = useRef<{ x: number; active: boolean }>({ x: 0, active: false });
  const onPointerDown = (e: React.PointerEvent) => {
    if (e.pointerType === "mouse") return;
    drag.current = { x: e.clientX, active: true };
  };
  const onPointerUp = (e: React.PointerEvent) => {
    if (!drag.current.active) return;
    drag.current.active = false;
    const dx = e.clientX - drag.current.x;
    if (Math.abs(dx) > 45) go(dx < 0 ? 1 : -1);
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowLeft") {
      e.preventDefault();
      go(-1);
    } else if (e.key === "ArrowRight") {
      e.preventDefault();
      go(1);
    }
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
        className="ch-quotes"
        role="group"
        aria-roledescription="carousel"
        aria-label={carouselLabel}
        onKeyDown={n > 1 ? onKeyDown : undefined}
      >
        <div
          className="ch-quotes-stage"
          onPointerDown={n > 1 ? onPointerDown : undefined}
          onPointerUp={n > 1 ? onPointerUp : undefined}
          onPointerCancel={() => {
            drag.current.active = false;
          }}
        >
          {items.map((v, i) => {
            const isActive = i === active;
            const translation = v.translations?.[locale];
            const hasTranslation = Boolean(translation && translation !== v.quote);
            const showingTranslation = hasTranslation && !(isActive && showOriginal);
            const text = showingTranslation ? (translation as string) : v.quote;
            const lang = showingTranslation ? locale : v.language;
            const date = formatDate(v.date, locale);
            return (
              <figure key={i} className="ch-quote" data-active={isActive} aria-hidden={!isActive}>
                {v.rating ? <Stars n={v.rating} /> : null}
                <blockquote className="ch-quote-body" lang={lang}>
                  « {text} »
                </blockquote>
                <figcaption className="ch-quote-cite">
                  <span className="ch-quote-name">{v.name}</span>
                  {date ? <span className="ch-quote-date">{date}</span> : null}
                </figcaption>
                {hasTranslation && isActive && (
                  <button
                    type="button"
                    className="ch-voice-toggle ch-quote-toggle"
                    onClick={() => setShowOriginal((s) => !s)}
                  >
                    {showingTranslation ? viewOriginal : viewTranslation}
                  </button>
                )}
              </figure>
            );
          })}
        </div>

        {n > 1 && (
          <div className="ch-quotes-nav">
            <button
              type="button"
              className="ch-quotes-paddle"
              aria-label={prevLabel}
              onClick={() => go(-1)}
            >
              <svg viewBox="0 0 24 24" aria-hidden width="19" height="19" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
                <path d="M15 5l-7 7 7 7" />
              </svg>
            </button>
            <div className="ch-quotes-dots" role="tablist" aria-label={carouselLabel}>
              {items.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  className={i === active ? "on" : ""}
                  role="tab"
                  aria-selected={i === active}
                  aria-label={`${i + 1} / ${n}`}
                  onClick={() => jump(i)}
                />
              ))}
            </div>
            <button
              type="button"
              className="ch-quotes-paddle"
              aria-label={nextLabel}
              onClick={() => go(1)}
            >
              <svg viewBox="0 0 24 24" aria-hidden width="19" height="19" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        )}
      </div>

      {(aggregateLine || viewAllHref) && (
        <p className="ch-voices-agg">
          {aggregateLine && <span className="ch-voices-agg-note">{aggregateLine}</span>}
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
