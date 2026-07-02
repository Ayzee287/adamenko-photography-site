import { cn } from "@/lib/utils";

/**
 * The one inner-page header — the page-level sibling of the homepage `SectionHeading`
 * (D030 inner-page consistency pass). A quiet eyebrow, a warm serif H1, an optional
 * intro, on the same type rhythm and voice as the homepage, so an inner page never
 * reads as an older, plainer site. H1 (one per page) is a touch larger than a section
 * H2 to hold page rank.
 */
export function PageHeader({
  eyebrow,
  title,
  intro,
  className,
}: {
  eyebrow?: string;
  title: string;
  intro?: string;
  className?: string;
}) {
  return (
    <div className={cn("max-w-3xl", className)}>
      {eyebrow ? (
        <p className="text-xs uppercase tracking-eyebrow text-muted">{eyebrow}</p>
      ) : null}
      <h1 className="mt-3 text-balance font-serif text-4xl leading-tight text-ink sm:text-5xl">
        {title}
      </h1>
      {intro ? (
        <p className="mt-4 max-w-2xl text-pretty text-muted">{intro}</p>
      ) : null}
    </div>
  );
}
