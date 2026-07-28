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

// Target row height by available width — a few frames per row on a wide wall, one or two on
// a phone. The justify pass then scales each row to fill the width exactly.
function targetRowHeight(w: number): number {
  if (w < 560) return Math.max(200, w * 0.62);
  if (w < 900) return 300;
  if (w < 1240) return 340;
  return 384;
}

// A frame wider than this reads as landscape; below it as portrait/square. Used only by the
// phone rhythm below, where the two orientations genuinely cannot share a row.
const WIDE = 1.2;

// Greedy justified rows, but the break is CHOSEN rather than stumbled into.
//
// The naive greedy pass (accumulate until the row overflows the width at the target height,
// then solve) has a failure mode that is invisible on a wide wall and disfiguring on a phone:
// the frame that tips the row over may overshoot badly, and the solved height then collapses
// far BELOW the target. Measured on a 390px viewport, two portraits (Σar 1.34, solving to
// 254px) took a third landscape frame (Σar 2.84) and the whole row dropped to 118px — three
// postage stamps in a wall whose other rows were 157px. So: grow the row while it is still
// taller than the target, then keep whichever of the last two candidates sits CLOSER to the
// target (compared in log space, so "40% too short" and "40% too tall" weigh the same).
//
// Rows are returned EXPLICITLY (never left to flex-wrap): the container width is fractional
// once a scrollbar exists, and a row whose rounded widths sum to even 0.2px more than the
// container silently wraps its last frame away, stranding a dead column. Widths are floored
// and the row's rounding remainder is given to its last frame, so a row fits exactly.
//
// A sparse final row is not blown up to full width (one landscape frame would tower); it keeps
// a near-target height and is centred, so the closing frame reads as deliberate.
function justify(
  ars: number[],
  containerW: number,
  targetH: number,
  gap: number,
  phone: boolean,
): Row[] {
  const rows: Row[] = [];
  const n = ars.length;

  // Solved height for frames [from, to) laid edge to edge across the wall.
  const heightFor = (from: number, to: number) => {
    let sum = 0;
    for (let k = from; k < to; k++) sum += ars[k];
    const avail = Math.floor(containerW) - gap * (to - from - 1) - 1;
    return avail / sum;
  };
  const deviation = (h: number) => Math.abs(Math.log(h / targetH));

  // How many frames may share this row, starting at `i`.
  //
  // On a phone the honest answer is dictated by orientation, not by arithmetic: a landscape
  // frame needs the full width to stay legible, and pairing one with a portrait squeezes the
  // portrait to ~106px. So a wide frame takes the row alone, and portraits pair only with
  // portraits. That yields a real phone rhythm — full-width wide frames, portrait diptychs,
  // the occasional centred portrait plate — instead of a squeezed mosaic.
  const rowCap = (i: number) => {
    if (!phone) return 5;
    if (ars[i] >= WIDE) return 1;
    return i + 1 < n && ars[i + 1] < WIDE ? 2 : 1;
  };

  let i = 0;
  while (i < n) {
    const cap = rowCap(i);
    let end = i + 1;
    // grow while the row is still TALLER than the target and we may still add frames
    while (end < n && end - i < cap && heightFor(i, end) > targetH) end++;
    // `end` now undershoots (or hit a cap / the last frame). Prefer the closer candidate.
    if (end - i > 1 && heightFor(i, end) < targetH) {
      if (deviation(heightFor(i, end - 1)) < deviation(heightFor(i, end))) end -= 1;
    }

    const count = end - i;
    const gaps = gap * (count - 1);
    const avail = Math.floor(containerW) - gaps - 1; // 1px safety against sub-pixel widths
    let h = heightFor(i, end);
    let partial = false;

    // A row that still overshoots the target once we have run out of frames is a sparse
    // closing row — or, on a phone, a lone portrait that would otherwise tower over the
    // viewport. Cap it and centre it so it reads as a chosen plate, not a leftover.
    const lone = count === 1;
    if (h > targetH * 1.18 && (end === n || (phone && lone))) {
      h = lone ? Math.min(h, targetH * (phone ? 1.62 : 1.35)) : targetH;
      partial = true;
    }

    const height = Math.round(h);
    const items: Dim[] = [];
    for (let k = i; k < end; k++) items.push({ i: k, w: Math.floor(ars[k] * height), h: height });
    if (!partial) {
      // hand the rounding remainder to the last frame so the row fills the width exactly
      const used = items.reduce((acc, it) => acc + it.w, 0);
      items[items.length - 1].w += avail - used;
    }
    rows.push({ items, partial });
    i = end;
  }
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
    setRows(justify(ars, w, targetRowHeight(w), gap, w < 560));
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

  // Hover-readiness — the compositor layer a tile needs in order to lift SMOOTHLY.
  //
  // A tile painted into its ancestor's layer sits at a fractional device-pixel offset; the
  // instant its hover transform starts, Chrome moves it to its own layer and snaps that
  // layer's raster to whole pixels, so the photograph jumps before the zoom has begun
  // (measured here: 0.59 device px — the worst on the site). Holding the layer from the
  // start removes the promotion, and with it the jump.
  //
  // Which is why this is an observer and not the line of CSS the plates get: a wall can run
  // to a hundred frames, and promoting all of them costs real frame time. Scrolling a
  // 105-frame wall at 4x CPU throttle, four alternating runs each way: 26.7ms median frame
  // and 9 frames over 33ms this way, against 28.6ms and up to 16 the other — every run of
  // one faster than every run of the other. Only what is on or near the screen can be
  // hovered, so only that is promoted (~10-25 tiles), and the layer always exists well
  // before the pointer can reach it.
  useEffect(() => {
    const el = gridRef.current;
    if (!el) return;
    if (!window.matchMedia("(hover: hover)").matches) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (!("IntersectionObserver" in window)) return;
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) e.target.classList.toggle("is-near", e.isIntersecting);
      },
      { rootMargin: "60% 0px" },
    );
    el.querySelectorAll<HTMLElement>(".ex-tile").forEach((t) => io.observe(t));
    return () => io.disconnect();
  }, [rows]);

  // Once the rows are solved every tile knows its EXACT rendered width, and saying so is the
  // difference between a phone downloading a 1080px master for a 170px frame and fetching what
  // it will actually paint — a justified wall cannot be described by a viewport formula.
  //
  // The first paint matters too: the server-rendered band is in the HTML and the browser may
  // start fetching from it before hydration solves the rows. What it must NOT do is disagree
  // with the solved width — a fallback that predicts a different size than the row solver
  // lands on costs a SECOND request for the same frame (measured: a landscape gallery went
  // from 7 requests to 14). So the fallback predicts the same thing the solver will do, using
  // the one fact available server-side — orientation: wide frames end up spanning the wall,
  // tall ones end up sharing it.
  const fallbackSizes = (ar: number) =>
    ar >= WIDE
      ? "(min-width: 75rem) 40vw, (min-width: 45rem) 50vw, 92vw"
      : "(min-width: 75rem) 20vw, (min-width: 45rem) 25vw, 46vw";

  const tile = (i: number, style: React.CSSProperties, sizes: string) => {
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
        {/* The frame carries its real alt again. Blanking it kept the a11y tree clean but
            cost the portfolio the only description Google Images can read — ~1000 published
            photographs offered to the largest image index in the world as untitled files.
            Measured rather than reasoned: with a plain alt, Chrome's tree exposed 44 tiles
            AND 44 separate image nodes repeating the same text, so browse mode would have
            heard every caption twice. `decorativeInContext` keeps the attribute for crawlers
            and drops the node for assistive tech; the button's aria-label stays the single
            announcement. Re-checked in the tree afterwards, not assumed. */}
        <Photo src={it.src} alt={it.alt} sizes={sizes} decorativeInContext />
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
                tile(
                  i,
                  {
                    flexGrow: ars[i],
                    flexBasis: `calc(${ars[i].toFixed(3)} * var(--ex-row))`,
                    height: "var(--ex-row)",
                  },
                  fallbackSizes(ars[i]),
                ),
              )}
            </div>
          : rows.map((row, r) => (
              <div key={r} className={`ex-row${row.partial ? " is-partial" : ""}`}>
                {row.items.map((d) =>
                  tile(d.i, { width: d.w, height: d.h, flex: "0 0 auto" }, `${d.w}px`),
                )}
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
