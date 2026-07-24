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
  kicker: string;
  title: React.ReactNode;
  intro?: string;
  /** The mono index mark before the eyebrow. */
  mark?: string;
}) {
  const { kicker, title, intro, mark = "§" } = props;
  return (
    <div className="ch-movement ch-wrap ch-chapter">
      <p className="ch-mono ch-kicker">
        <span className="n">{mark}</span> {kicker}
      </p>
      <h1 className="ch-display ch-chapter-title">{title}</h1>
      {intro && <p className="ch-lead">{intro}</p>}
    </div>
  );
}
