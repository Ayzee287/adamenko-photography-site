// CHAMBRE page scaffolding — the two pieces every interior chapter composes from,
// so the whole product speaks one language without a second design system.
//
// ChambreScene: opts the page into the dark re-theme ([data-chambre] → chambre.css),
// carries the fixed film grain, and clips decorative overflow. ChapterOpening: the
// book-chapter title page — mono eyebrow, serif display title, optional lead — with
// top room reserved for the transparent floating header. Both are server components.

import { cn } from "@/lib/utils/cn";

export function ChambreScene({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div data-chambre className={cn("ch-root", className)}>
      {children}
    </div>
  );
}

export function ChapterOpening(props: {
  /** Optional mono eyebrow above the title. Omit for a clean, title-only opening
   *  (e.g. /tarifs, where the "Investissement" chapter label was retired). */
  kicker?: string;
  title: React.ReactNode;
  intro?: string;
  /** The mono index mark before the eyebrow. */
  mark?: string;
  /** A tight opening — reduced clearance + a smaller title — for pages whose primary
   *  content should be reachable immediately (e.g. /tarifs, where a visitor came for
   *  the prices, not a full-screen statement). */
  tight?: boolean;
  /** BCP-47 tag when this opening's text is not in the page's language — the legal pages
   *  are French on /en by law, and an untagged block makes a screen reader read French
   *  with English pronunciation rules. */
  lang?: string;
}) {
  const { kicker, title, intro, mark = "§", tight = false, lang } = props;
  return (
    <div
      lang={lang}
      className={cn("ch-movement ch-wrap ch-chapter", tight && "ch-chapter--tight")}
    >
      {kicker && (
        <p className="ch-mono ch-kicker">
          <span className="n">{mark}</span> {kicker}
        </p>
      )}
      <h1 className="ch-display ch-chapter-title">{title}</h1>
      {intro && <p className="ch-lead">{intro}</p>}
    </div>
  );
}
