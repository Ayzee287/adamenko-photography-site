"use client";

import { useState } from "react";
import { Container } from "@/components/layout/container";
import { SectionHeading } from "./section-heading";
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

  return (
    <section className="py-28 sm:py-36">
      <Container>
        <SectionHeading eyebrow={t.eyebrow} title={t.title} align="center" />
        <div className="mx-auto mt-12 max-w-3xl text-center">
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
            <div className="px-6 py-10">
              <span
                aria-hidden
                className="block font-serif text-7xl leading-none text-clay/25"
              >
                &ldquo;
              </span>
              <p className="mt-2 text-balance font-serif text-xl text-muted sm:text-2xl">
                {t.empty}
              </p>
            </div>
          )}
        </div>
      </Container>
    </section>
  );
}
