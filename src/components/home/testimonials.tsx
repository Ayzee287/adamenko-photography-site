"use client";

import {
  useEffect,
  useRef,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
} from "react";
import { Container } from "@/components/layout/container";
import { SectionHeading } from "./section-heading";
import { useDragScroll } from "@/components/gallery/use-drag-scroll";
import { cn } from "@/lib/utils";
import { testimonials, type Testimonial } from "@/content/testimonials";
import { googleRating } from "@/content/reviews.generated";
import type { Locale } from "@/lib/i18n";

/** Locale-resolved strings, passed from the server home page (this is a client island). */
export type TestimonialStrings = {
  eyebrow: string;
  title: string;
  empty: string;
  prevLabel: string;
  nextLabel: string;
  carouselLabel: string;
  readMore: string;
  readLess: string;
  /** Aggregate line; {rating} and {count} are replaced with live values. */
  summary: string;
};

// A quote longer than this gets clamped with a "read more" toggle. Chosen so a
// card that shows NO toggle can never visibly truncate either: at the narrowest
// card width the clamp (6 lines) holds ~200+ characters. Deterministic (character
// count, not measurement) so server and client render identically.
const CLAMP_CHARS = 180;

/**
 * Section 9 — testimonials. Real only (never fabricated): a quiet reserved state
 * while empty; once real words exist (the synced Google reviews curated in
 * content/testimonials.ts), a horizontally scrollable wall of review cards —
 * 1 visible on mobile, 2 from sm, 3 from lg, 4 from xl, however many reviews
 * exist (the section never assumes a count). Cards are quiet paper plates:
 * rounded, hairline border, no shadow; stars in clay; meta in the site's
 * uppercase tracking. The strip rides the SAME drag/inertia/wheel physics as the
 * featured reel (useDragScroll), with borderless ‹ › paging (R9 vocabulary) and
 * the Google aggregate line underneath. Long reviews clamp with a per-card
 * "read more" (expansion is user-initiated → CLS-exempt); the words themselves
 * stay verbatim and complete in the DOM either way.
 *
 * Mounted on the homepage: the production Google Reviews integration is live —
 * the Place ID (a pure Service Area Business, discovered via Places API (New)
 * Text Search) is pinned in .env.local and `npm run sync:reviews` fills
 * content/reviews.generated.ts, curated in content/testimonials.ts. See
 * docs/google-reviews.md.
 */
export function Testimonials({ t, locale }: { t: TestimonialStrings; locale: Locale }) {
  const items = testimonials;
  const scrollerRef = useRef<HTMLDivElement | null>(null);
  const { dragHandlers, stopInertia, reduced } = useDragScroll(scrollerRef);

  // Whether each direction still has content — drives the arrows' disabled state.
  // SSR renders both disabled; the mount effect corrects it (opacity-only, no shift).
  const [can, setCan] = useState({ left: false, right: false });
  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;
    const update = () =>
      setCan({
        left: el.scrollLeft > 4,
        right: el.scrollLeft < el.scrollWidth - el.clientWidth - 4,
      });
    update();
    el.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      el.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, [items.length]);

  // Arrows + keyboard advance one card — the reel's nudge, without the loop.
  const nudge = (dir: 1 | -1) => {
    const el = scrollerRef.current;
    if (!el) return;
    stopInertia();
    const kids = Array.from(el.children) as HTMLElement[];
    const cur = el.scrollLeft;
    const target =
      dir > 0
        ? (kids.find((k) => k.offsetLeft > cur + 4)?.offsetLeft ?? cur + el.clientWidth)
        : ([...kids].reverse().find((k) => k.offsetLeft < cur - 4)?.offsetLeft ?? 0);
    el.scrollTo({ left: target, behavior: reduced ? "auto" : "smooth" });
  };
  const onKeyDown = (e: ReactKeyboardEvent) => {
    if (e.key === "ArrowRight") {
      e.preventDefault();
      nudge(1);
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      nudge(-1);
    }
  };

  const arrow =
    "flex h-11 w-11 items-center justify-center text-xl text-ink/70 hover:text-clay disabled:pointer-events-none disabled:opacity-25";

  return (
    <section className="py-10 sm:py-16">
      <Container>
        <SectionHeading eyebrow={t.eyebrow} title={t.title} align="center" />
        {items.length > 0 ? (
          <div className="mt-10 sm:mt-16">
            <div
              ref={scrollerRef}
              role="region"
              aria-label={t.carouselLabel}
              tabIndex={0}
              {...dragHandlers}
              onKeyDown={onKeyDown}
              className={cn(
                "reviews-region flex cursor-grab items-stretch gap-5 overflow-x-auto overscroll-x-contain select-none active:cursor-grabbing",
                "[-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
              )}
            >
              {items.map((item, i) => (
                <ReviewCard key={i} item={item} t={t} locale={locale} />
              ))}
            </div>

            {/* Aggregate + paging — one quiet row under the wall. The rating line
                renders only from real synced values (never fabricated). */}
            <div className="mt-8 flex items-center justify-between gap-6">
              {googleRating ? (
                <p className="text-sm text-muted">
                  {t.summary
                    .replace(
                      "{rating}",
                      new Intl.NumberFormat(locale === "fr" ? "fr-FR" : "en-GB", {
                        minimumFractionDigits: 1,
                        maximumFractionDigits: 1,
                      }).format(googleRating.rating),
                    )
                    .replace("{count}", String(googleRating.count))}
                </p>
              ) : (
                <span />
              )}
              {items.length > 1 ? (
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => nudge(-1)}
                    disabled={!can.left}
                    aria-label={t.prevLabel}
                    className={arrow}
                  >
                    ‹
                  </button>
                  <button
                    type="button"
                    onClick={() => nudge(1)}
                    disabled={!can.right}
                    aria-label={t.nextLabel}
                    className={arrow}
                  >
                    ›
                  </button>
                </div>
              ) : null}
            </div>
          </div>
        ) : (
          // Reserved-by-choice empty state (v3 QA) — unchanged: a short, confident
          // statement of integrity, not a gap.
          <div className="mx-auto mt-6 max-w-2xl text-center sm:mt-10">
            <span aria-hidden className="mx-auto mb-6 block h-px w-12 bg-clay/60" />
            <p className="text-balance font-serif text-2xl leading-snug text-ink/75 sm:text-3xl">
              {t.empty}
            </p>
          </div>
        )}
      </Container>
    </section>
  );
}

/**
 * One review card — a quiet paper plate. Widths are exact fractions of the strip
 * (minus the flex gap) so 1 / 2 / 3 / 4 cards fit at the breakpoints; mobile keeps
 * a peek of the next card so the strip is obviously scrollable. `items-stretch`
 * on the strip equalises heights; the attribution anchors to the bottom.
 */
function ReviewCard({
  item,
  t,
  locale,
}: {
  item: Testimonial;
  t: TestimonialStrings;
  locale: Locale;
}) {
  const [expanded, setExpanded] = useState(false);
  const long = item.quote.length > CLAMP_CHARS;

  return (
    // `relative` is load-bearing: the star row's sr-only span is absolutely
    // positioned, and without a positioned ancestor INSIDE the scroller its
    // containing block is the page — it would escape the strip's clipping and
    // widen the document at narrow viewports (the "invisible" a11y span was
    // measurably stretching the mobile page before this).
    <article className="relative flex shrink-0 basis-[85%] flex-col rounded-2xl border border-line p-6 sm:basis-[calc(50%-0.625rem)] sm:p-7 lg:basis-[calc(33.333%-0.834rem)] xl:basis-[calc(25%-0.9375rem)]">
      {item.rating || item.date ? (
        <div className="flex items-center justify-between gap-4">
          {item.rating ? <Stars rating={item.rating} /> : <span />}
          {item.date ? (
            <time dateTime={item.date} className="text-xs text-muted">
              {formatMonth(item.date, locale)}
            </time>
          ) : null}
        </div>
      ) : null}

      <blockquote
        className={cn(
          "mt-4 text-[0.95rem] leading-relaxed text-ink/85",
          long && !expanded && "line-clamp-6",
        )}
      >
        {item.quote}
      </blockquote>

      {long ? (
        <button
          type="button"
          aria-expanded={expanded}
          onClick={() => setExpanded((v) => !v)}
          className="mt-3 self-start text-xs uppercase tracking-meta text-muted hover:text-clay"
        >
          {expanded ? t.readLess : t.readMore}
        </button>
      ) : null}

      <footer className="mt-auto pt-5 text-sm uppercase tracking-meta text-ink/80">
        {item.name}
        {item.city ? ` · ${item.city}` : ""}
      </footer>
    </article>
  );
}

/** Five small stars, `rating` of them at full strength — clay, like every accent. */
function Stars({ rating }: { rating: number }) {
  return (
    <span className="flex items-center gap-1 text-clay">
      {[1, 2, 3, 4, 5].map((n) => (
        <svg
          key={n}
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="currentColor"
          aria-hidden
          className={n <= rating ? undefined : "opacity-25"}
        >
          <path d="M12 2.5l2.95 5.98 6.6.96-4.78 4.66 1.13 6.57L12 17.57l-5.9 3.1 1.13-6.57L2.45 9.44l6.6-.96L12 2.5z" />
        </svg>
      ))}
      <span className="sr-only">{rating}/5</span>
    </span>
  );
}

/** "mai 2026" / "May 2026" from a YYYY-MM date — UTC-pinned so the server and the
 *  visitor's browser format the same month regardless of timezone. */
function formatMonth(date: string, locale: Locale): string {
  const [y, m] = date.split("-").map(Number);
  if (!y || !m) return date;
  return new Intl.DateTimeFormat(locale === "fr" ? "fr-FR" : "en-GB", {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(Date.UTC(y, m - 1, 15)));
}
