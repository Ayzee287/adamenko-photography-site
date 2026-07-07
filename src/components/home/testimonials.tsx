"use client";

import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
} from "react";
import { Container } from "@/components/layout/container";
import { SectionHeading } from "./section-heading";
import { useDragScroll } from "@/components/gallery/use-drag-scroll";
import { usePrefersReducedMotion } from "@/components/motion/use-prefers-reduced-motion";
import { ButtonLink } from "@/components/ui/button-link";
import { cn } from "@/lib/utils";
import { testimonials, type Testimonial } from "@/content/testimonials";
import { googleRating, googleProfile } from "@/content/reviews.generated";
import type { Locale } from "@/lib/i18n";

// Measuring the review body before/after a translation swap has to happen before
// the browser paints (no flash) — useLayoutEffect. On the server it must be a no-op
// (React warns otherwise); the isomorphic alias keeps SSR silent.
const useIsomorphicLayoutEffect = typeof window !== "undefined" ? useLayoutEffect : useEffect;

/** Locale-resolved strings, passed from the server home page (this is a client island). */
export type TestimonialStrings = {
  title: string;
  empty: string;
  prevLabel: string;
  nextLabel: string;
  carouselLabel: string;
  readMore: string;
  readLess: string;
  /** Aggregate line; {rating} and {count} are replaced with live values. */
  summary: string;
  /** Per-card "from Google" attribution (e.g. "Avis Google"). */
  attribution: string;
  /** Translation toggle labels — shown only when the review was written in
   *  another language and Google supplies a translation. */
  viewOriginal: string;
  viewTranslation: string;
  /** Secondary CTA under the aggregate line → the Google profile. */
  viewAllOnGoogle: string;
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
    // offsetLeft is measured from the positioned ancestor OUTSIDE this scroller, so
    // raw values carry the page gutter (32px at sm) — comparing them to scrollLeft
    // made the first press a 32px no-op and clipped every snap by the same amount.
    // Normalising to the first card yields true scroll-content coordinates.
    const base = kids[0]?.offsetLeft ?? 0;
    const lefts = kids.map((k) => k.offsetLeft - base);
    const cur = el.scrollLeft;
    const target =
      dir > 0
        ? (lefts.find((x) => x > cur + 4) ?? cur + el.clientWidth)
        : ([...lefts].reverse().find((x) => x < cur - 4) ?? 0);
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

  // The aggregate line, formatted once so it can serve as the link text too.
  const summaryText = googleRating
    ? t.summary
        .replace(
          "{rating}",
          new Intl.NumberFormat(locale === "fr" ? "fr-FR" : "en-GB", {
            minimumFractionDigits: 1,
            maximumFractionDigits: 1,
          }).format(googleRating.rating),
        )
        .replace("{count}", String(googleRating.count))
    : "";

  return (
    <section className="py-10 sm:py-16">
      <Container>
        {/* Eyebrow intentionally omitted — the heading carries the section on its
            own; the trust cue now lives in the per-card Google attribution and the
            aggregate + "view all reviews" links to the real profile. */}
        <SectionHeading title={t.title} align="center" />
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

            {/* Footer of the wall — a top-down cluster: the aggregate rating (social
                proof, linking to the real profile to verify), then the "view all
                reviews" CTA (the site's secondary text link — clay underline-draw +
                arrow) with the carousel paging on the right. The rating sits on its
                own line so it never wraps against the arrows on narrow viewports. */}
            <div className="mt-8">
              {googleRating ? (
                googleProfile ? (
                  <a
                    href={googleProfile.profileUri}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-muted hover:text-clay"
                  >
                    {summaryText}
                  </a>
                ) : (
                  <p className="text-sm text-muted">{summaryText}</p>
                )
              ) : null}
              {googleProfile || items.length > 1 ? (
                <div
                  className={cn(
                    "flex items-center justify-between gap-6",
                    googleRating && "mt-3",
                  )}
                >
                  {googleProfile ? (
                    <ButtonLink href={googleProfile.reviewsUri} variant="secondary">
                      {t.viewAllOnGoogle}
                    </ButtonLink>
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
 *
 * Source + language (trust polish): Google reviews carry a quiet "Avis Google"
 * attribution under the stars (the small Google mark + localized wording, in the
 * site's own meta type — authenticity, not a badge). When a review was written in
 * another language, the card shows Google's translation in the visitor's language
 * by default with a "view original" toggle (Google-Maps behaviour) — the swap is
 * client-only (both texts are already in the DOM props, no network, no reload) and
 * the body height eases between the two lengths (reduced-motion → instant). The
 * original words are never discarded; a review with no translation for this locale
 * simply shows its original and hides the toggle.
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
  const reduced = usePrefersReducedMotion();
  const isGoogle = item.source === "google";

  // Translation state. A translation exists only when Google returned one for this
  // locale AND it isn't just the original again. Default view = the translation;
  // the toggle reveals the untranslated original.
  const translated = isGoogle ? item.translations?.[locale] : undefined;
  const hasTranslation = Boolean(translated && translated !== item.quote);
  const [showOriginal, setShowOriginal] = useState(false);
  const showingTranslation = hasTranslation && !showOriginal;

  const body = showingTranslation ? (translated as string) : item.quote;
  // Correct pronunciation for screen readers: mark the body with the language it's
  // actually in (the translation's locale, or the review's original language).
  const bodyLang = showingTranslation ? locale : item.language || undefined;

  const [expanded, setExpanded] = useState(false);
  const long = body.length > CLAMP_CHARS;

  // Smoothly ease the body's height across a translation swap. Capture the height
  // just before the text changes, then animate from it to the new natural height.
  const bodyRef = useRef<HTMLQuoteElement | null>(null);
  const fromHeight = useRef<number | null>(null);

  const toggleTranslation = () => {
    if (bodyRef.current) fromHeight.current = bodyRef.current.offsetHeight;
    setShowOriginal((v) => !v);
  };

  useIsomorphicLayoutEffect(() => {
    const el = bodyRef.current;
    if (!el || fromHeight.current == null) return;
    const from = fromHeight.current;
    fromHeight.current = null;
    const to = el.offsetHeight;
    if (reduced || from === to || typeof el.animate !== "function") return;
    // Reuse the site's easing token — never invent a timing/easing.
    const ease =
      getComputedStyle(document.documentElement).getPropertyValue("--ease-settle").trim() ||
      "ease";
    el.style.overflow = "hidden";
    const animation = el.animate(
      [{ height: `${from}px` }, { height: `${to}px` }],
      { duration: 300, easing: ease },
    );
    const restore = () => {
      el.style.overflow = "";
    };
    animation.addEventListener("finish", restore);
    animation.addEventListener("cancel", restore);
  }, [showOriginal, reduced]);

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

      {isGoogle ? (
        <p className="mt-2.5 flex items-center gap-1.5 text-[0.62rem] uppercase tracking-meta text-muted">
          <GoogleGlyph className="h-3 w-3 shrink-0" />
          {t.attribution}
        </p>
      ) : null}

      <blockquote
        ref={bodyRef}
        lang={bodyLang}
        className={cn(
          "mt-4 text-[0.95rem] leading-relaxed text-ink/85",
          long && !expanded && "line-clamp-6",
        )}
      >
        {body}
      </blockquote>

      {/* Action hierarchy (interaction-design pass): "read more" is the primary
          reading action — the site's clay underline-draw, in ink — and sits first.
          "view original" is a subordinate LANGUAGE utility: quieter (muted, no
          underline, a step smaller) and stacked beneath, so the two never read as
          equal-weight twins. Order = importance; treatment = role. */}
      {long || hasTranslation ? (
        <div className="mt-3 flex flex-col items-start gap-1.5">
          {long ? (
            <button
              type="button"
              aria-expanded={expanded}
              onClick={() => setExpanded((v) => !v)}
              className="group py-0.5 text-xs uppercase tracking-meta text-ink/75"
            >
              <span className="relative pb-0.5">
                {expanded ? t.readLess : t.readMore}
                <span
                  aria-hidden
                  className="absolute inset-x-0 bottom-0 h-px bg-current opacity-20"
                />
                <span
                  aria-hidden
                  className="link-draw absolute inset-x-0 bottom-0 h-px bg-clay"
                />
              </span>
            </button>
          ) : null}
          {hasTranslation ? (
            <button
              type="button"
              onClick={toggleTranslation}
              className="py-0.5 text-[0.7rem] uppercase tracking-meta text-muted hover:text-clay"
            >
              {showingTranslation ? t.viewOriginal : t.viewTranslation}
            </button>
          ) : null}
        </div>
      ) : null}

      <footer className="mt-auto pt-5 text-sm uppercase tracking-meta text-ink/80">
        {item.name}
        {item.city ? ` · ${item.city}` : ""}
      </footer>
    </article>
  );
}

/** The Google "G" — the official four-colour mark, unmodified (brand-compliant),
 *  rendered small so it reads as a quiet source cue beside the attribution, not a
 *  badge. Decorative: the adjacent "Avis Google" text carries the meaning. */
function GoogleGlyph({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden focusable="false">
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      />
    </svg>
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
