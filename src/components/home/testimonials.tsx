"use client";

import { useState } from "react";
import { Container } from "@/components/layout/container";
import { SectionHeading } from "./section-heading";
import { cn } from "@/lib/utils";
import { home } from "@/content/home";
import { testimonials } from "@/content/testimonials";

/**
 * Section 9 — testimonials. Real only (never fabricated): a quiet reserved state
 * while empty, a manual carousel (no autoplay — the visitor stays in control)
 * once real words exist. Same layout either way, so nothing shifts when filled.
 */
export function Testimonials() {
  const t = home.testimonials;
  const items = testimonials;
  const [i, setI] = useState(0);
  const has = items.length > 0;

  const prev = () => setI((n) => (n - 1 + items.length) % items.length);
  const next = () => setI((n) => (n + 1) % items.length);
  const arrow =
    "flex h-11 w-11 items-center justify-center rounded-full border border-line text-xl text-ink hover:border-clay";

  // Tighter when empty (v3 QA): the no-testimonials state is no longer a lonely line
  // floating in a void — it's a short, confident statement of integrity (real words
  // only, never invented), tightened so it reads as intentional, not as a gap.
  return (
    <section className={has ? "py-24 sm:py-40" : "py-12 sm:py-18"}>
      <Container>
        <SectionHeading eyebrow={t.eyebrow} title={t.title} align="center" />
        <div
          className={cn(
            "mx-auto max-w-2xl text-center",
            has ? "mt-12 max-w-3xl sm:mt-18" : "mt-8 sm:mt-12",
          )}
        >
          {has ? (
            <>
              <blockquote className="font-serif text-2xl leading-snug text-ink sm:text-3xl">
                « {items[i].quote} »
              </blockquote>
              <p className="mt-6 text-sm uppercase tracking-[0.16em] text-muted">
                {items[i].name}
                {items[i].city ? ` · ${items[i].city}` : ""}
              </p>
              {items.length > 1 ? (
                <div className="mt-8 flex items-center justify-center gap-4">
                  <button
                    type="button"
                    onClick={prev}
                    aria-label="Témoignage précédent"
                    className={arrow}
                  >
                    ‹
                  </button>
                  <span className="text-xs tabular-nums text-muted">
                    {i + 1} / {items.length}
                  </span>
                  <button
                    type="button"
                    onClick={next}
                    aria-label="Témoignage suivant"
                    className={arrow}
                  >
                    ›
                  </button>
                </div>
              ) : null}
            </>
          ) : (
            <>
              <span aria-hidden className="mx-auto mb-6 block h-px w-12 bg-clay/60" />
              <p className="text-balance font-serif text-2xl leading-snug text-ink/75 sm:text-3xl">
                {t.empty}
              </p>
            </>
          )}
        </div>
      </Container>
    </section>
  );
}
