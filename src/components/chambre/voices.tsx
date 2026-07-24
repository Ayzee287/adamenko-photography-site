"use client";

// voices — the reviews, told two ways. On a wide screen they hang as three quiet quotes
// side by side (the photography stays the hero; the words are overheard in the dark). On a
// phone that same three-high wall was a long scroll of text, so there they become a
// horizontal, snap-scrolling carousel: one review at a time, the next one peeking to invite
// a swipe, dots to show how many there are and let you jump. Star ratings and the Google
// attribution carry the proof; the aggregate links out to the full profile. Excerpts stay
// clamped so a card is a glance, not a paragraph.

import { useRef, useState } from "react";

type Voice = { text: string; name: string; rating?: number };

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

export function Voices(props: {
  items: Voice[];
  attribution: string;
  carouselLabel: string;
  aggregate?: { rating: number; count: number } | null;
  aggregateTemplate?: string;
  viewAllLabel?: string;
  viewAllHref?: string;
}) {
  const { items, attribution, carouselLabel, aggregate, aggregateTemplate, viewAllLabel, viewAllHref } = props;
  const railRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);

  const onScroll = () => {
    const el = railRef.current;
    if (!el) return;
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
    const el = railRef.current;
    if (!el) return;
    const child = el.children[i] as HTMLElement | undefined;
    child?.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
  };

  const aggregateLine =
    aggregate && aggregateTemplate
      ? aggregateTemplate.replace("{rating}", String(aggregate.rating)).replace("{count}", String(aggregate.count))
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
          <figure className="ch-voice" key={i}>
            {v.rating ? <Stars n={v.rating} /> : null}
            <blockquote className="ch-voice-quote">« {v.text} »</blockquote>
            <figcaption className="ch-voice-cite">
              {v.name} · {attribution}
            </figcaption>
          </figure>
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
          {aggregateLine && viewAllHref ? <span className="ch-voices-agg-sep" aria-hidden> · </span> : null}
          {viewAllHref && viewAllLabel && (
            <a href={viewAllHref} target="_blank" rel="noopener noreferrer" className="ch-voices-agg-link">
              {viewAllLabel}
            </a>
          )}
        </p>
      )}
    </div>
  );
}
