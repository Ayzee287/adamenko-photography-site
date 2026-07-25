"use client";

// exhibition — the Viewing Room. A genre's edit is hung as JUSTIFIED ROWS: every frame
// keeps its true aspect ratio (never cropped), rows are scaled to fill the wall exactly,
// and the photographer's ORDER is preserved strictly left-to-right, top-to-bottom. This
// browses comfortably whether the series holds a dozen frames or hundreds — dense but
// breathing, editorial, no oversized blocks and no technical labels: the photography is
// the only hero. Each frame develops out of the dark and opens the shared lightbox.

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { Photo } from "@/components/media/photo";
import { Lightbox, type LightboxLabels } from "@/components/media/lightbox";

export type ExhibitItem = {
  src: string;
  alt: string;
  /** True pixel dimensions — drive the justified layout, so nothing is ever cropped. */
  width: number;
  height: number;
  caption?: string;
};

type Dim = { i: number; w: number; h: number };
type Row = { items: Dim[]; partial: boolean };

// Target row height by available width — a few frames per row on a wide wall, two on a
// phone. The justify pass then scales each row to fill the width exactly.
function targetRowHeight(w: number): number {
  if (w < 560) return Math.max(200, w * 0.62);
  if (w < 900) return 300;
  if (w < 1240) return 340;
  return 384;
}

// Greedy justified rows: accumulate frames until the row overflows the width at the target
// height, then solve the height that makes that row fill the width exactly.
//
// Rows are returned EXPLICITLY (never left to flex-wrap): the container width is fractional
// once a scrollbar exists, and a row whose rounded widths sum to even 0.2px more than the
// container silently wraps its last frame away, stranding a dead column. Widths are floored
// and the row's rounding remainder is given to its last frame, so a row fits exactly.
//
// A sparse final row is not blown up to full width (one landscape frame would tower); it keeps
// a near-target height and is centred, so the closing frame reads as deliberate.
function justify(ars: number[], containerW: number, targetH: number, gap: number): Row[] {
  const rows: Row[] = [];
  let row: number[] = [];
  let startIndex = 0;
  let rowAr = 0;

  const flush = (isLast: boolean) => {
    if (row.length === 0) return;
    const gaps = gap * (row.length - 1);
    const avail = Math.floor(containerW) - gaps - 1; // 1px safety against sub-pixel widths
    let h = avail / rowAr;
    let partial = false;
    if (isLast && h > targetH * 1.18) {
      // Sparse closing row: don't blow it to full width (a wide frame would tower). A LONE
      // closing frame is enlarged into a deliberate final print — larger than the mosaic
      // above so it reads as a conclusion, not a leftover tile; a 2+ frame partial row
      // keeps the target height. Both are centred (.is-partial).
      h = row.length === 1 ? Math.min(h, targetH * 1.35) : targetH;
      partial = true;
    }
    const height = Math.round(h);
    const items: Dim[] = row.map((ar, k) => ({
      i: startIndex + k,
      w: Math.floor(ar * height),
      h: height,
    }));
    if (!partial) {
      // hand the rounding remainder to the last frame so the row fills the width exactly
      const used = items.reduce((n, it) => n + it.w, 0);
      items[items.length - 1].w += avail - used;
    }
    rows.push({ items, partial });
    startIndex += row.length;
    row = [];
    rowAr = 0;
  };

  for (const ar of ars) {
    row.push(ar);
    rowAr += ar;
    if (rowAr * targetH + gap * (row.length - 1) >= containerW) flush(false);
  }
  flush(true);
  return rows;
}

export function Exhibition(props: {
  items: ExhibitItem[];
  /** Retained for API compatibility; the hang carries no labels. */
  serie?: string;
  labels: LightboxLabels & { enlarge: string };
}) {
  const { items, labels } = props;
  const gridRef = useRef<HTMLDivElement>(null);
  const [rows, setRows] = useState<Row[] | null>(null);
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const ars = items.map((it) => it.width / it.height);

  const recompute = useCallback(() => {
    const el = gridRef.current;
    if (!el) return;
    // the fractional box, not clientWidth (which rounds up and overflows the row)
    const w = el.getBoundingClientRect().width;
    if (w <= 0) return;
    const gap = w < 560 ? 8 : 14;
    setRows(justify(ars, w, targetRowHeight(w), gap));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items]);

  useLayoutEffect(() => {
    recompute();
    const el = gridRef.current;
    if (!el || typeof ResizeObserver === "undefined") return;
    const ro = new ResizeObserver(recompute);
    ro.observe(el);
    return () => ro.disconnect();
  }, [recompute]);

  // Develop-in reveal — one IntersectionObserver, tiles armed only below the fold and
  // unobserved once shown (cheap even for hundreds of frames). Re-runs on relayout but
  // never re-hides a frame that has already developed.
  useEffect(() => {
    const el = gridRef.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (!("IntersectionObserver" in window)) return;
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            e.target.classList.add("is-in");
            io.unobserve(e.target);
          }
        }
      },
      { threshold: 0.04, rootMargin: "0px 0px -5% 0px" },
    );
    const vh = window.innerHeight || 0;
    el.querySelectorAll<HTMLElement>(".ex-tile").forEach((t) => {
      if (t.classList.contains("is-in")) return;
      if (t.getBoundingClientRect().top < vh * 0.92) {
        t.classList.add("is-in");
        return;
      }
      t.classList.add("arm");
      io.observe(t);
    });
    return () => io.disconnect();
  }, [rows]);

  const tile = (i: number, style: React.CSSProperties) => {
    const it = items[i];
    return (
      <button
        key={it.src}
        type="button"
        className="ex-tile"
        style={style}
        onClick={() => setOpenIndex(i)}
        aria-label={`${labels.enlarge} : ${it.alt}`}
      >
        <Photo src={it.src} alt="" sizes="(min-width: 75rem) 34vw, (min-width: 45rem) 46vw, 92vw" />
      </button>
    );
  };

  return (
    <div className="ex">
      <div className="ex-grid" ref={gridRef}>
        {rows === null
          ? // pre-measurement (SSR + first paint): one wrapping band, ratio-proportioned
            <div className="ex-row is-fallback">
              {items.map((_, i) =>
                tile(i, {
                  flexGrow: ars[i],
                  flexBasis: `calc(${ars[i].toFixed(3)} * var(--ex-row))`,
                  height: "var(--ex-row)",
                }),
              )}
            </div>
          : rows.map((row, r) => (
              <div key={r} className={`ex-row${row.partial ? " is-partial" : ""}`}>
                {row.items.map((d) => tile(d.i, { width: d.w, height: d.h, flex: "0 0 auto" }))}
              </div>
            ))}
      </div>

      <Lightbox
        images={items.map(({ src, alt, caption }) => ({ src, alt, caption }))}
        index={openIndex ?? 0}
        open={openIndex !== null}
        onClose={() => setOpenIndex(null)}
        onNavigate={(i) => setOpenIndex(i)}
        labels={labels}
      />
    </div>
  );
}
