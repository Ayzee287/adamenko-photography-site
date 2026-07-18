"use client";

// review-card — one imported voice, verbatim (curation is content governance,
// M7 — V1's testimonials module already implements it). Anatomy: stars row
// (5×14, decorative — the rating is announced once, textually) → text (≤40
// words, expandable in place) → optional "Voir l'original" toggle → name →
// date, hairline top/bottom. compact (≤25 words, no toggles) serves the
// contact reassurance slot.

import { useState } from "react";
import { cn } from "@/lib/utils/cn";

const TRUNCATE_WORDS = 40;

function Star() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-(--size-icon) w-(--size-icon) scale-75 text-ink"
      fill="currentColor"
      aria-hidden
    >
      <path d="M12 2l2.9 6.6 7.1.6-5.4 4.7 1.6 7L12 17l-6.2 3.9 1.6-7L2 9.2l7.1-.6z" />
    </svg>
  );
}

function truncate(text: string): { cut: string; truncated: boolean } {
  const words = text.split(/\s+/);
  if (words.length <= TRUNCATE_WORDS) return { cut: text, truncated: false };
  return { cut: words.slice(0, TRUNCATE_WORDS).join(" ") + "…", truncated: true };
}

export function ReviewCard(props: {
  text: string;
  original?: { text: string; toggleLabel: string };
  name: string;
  date: string;
  readMoreLabel: string;
  compact?: boolean;
}) {
  const { text, original, name, date, readMoreLabel, compact = false } = props;
  const [expanded, setExpanded] = useState(false);
  const [showOriginal, setShowOriginal] = useState(false);

  const active = showOriginal && original ? original.text : text;
  const { cut, truncated } = truncate(active);
  const shown = expanded ? active : cut;

  return (
    <article className="border-y border-hairline py-5">
      <div className="flex" aria-hidden>
        <Star />
        <Star />
        <Star />
        <Star />
        <Star />
      </div>
      <span className="sr-only">5 / 5</span>
      <p className={cn("mt-4 text-body text-ink", compact && "text-small")}>
        {shown}
      </p>
      {!compact && (
        <div className="mt-4 flex flex-wrap gap-5">
          {truncated && !expanded && (
            <button
              type="button"
              onClick={() => setExpanded(true)}
              className="text-button text-ink underline decoration-ink-secondary underline-offset-4 hover:decoration-ink"
            >
              {readMoreLabel}
            </button>
          )}
          {original && (
            <button
              type="button"
              onClick={() => setShowOriginal((v) => !v)}
              aria-pressed={showOriginal}
              className="text-button text-ink-secondary underline underline-offset-4 hover:text-ink"
            >
              {original.toggleLabel}
            </button>
          )}
        </div>
      )}
      <p className="mt-5 text-label text-ink">{name}</p>
      <p className="mt-1 text-small text-ink-secondary">{date}</p>
    </article>
  );
}
