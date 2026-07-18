// review-group — the proof chapter unit (S9) and the price-adjacent single
// review. Desktop: equal-fill row, gap space/5, rating-line below at space/6.
// Mobile: stacked ≤2 (gap space/6) / native snap row ≥3 (the one horizontal
// scroll surface outside the lightbox). Labeled region ("Avis clients
// Google"); cards stay in DOM order for keyboard reach.

import { RatingLine } from "@/components/typography/rating-line";
import type { Locale } from "@/lib/i18n";
import { cn } from "@/lib/utils/cn";

export function ReviewGroup(props: {
  regionLabel: string;
  children: React.ReactNode[];
  showRating?: boolean;
  rating?: {
    rating: number;
    count: number;
    href: string;
    summary: string;
    linkLabel: string;
    locale: Locale;
  };
}) {
  const { regionLabel, children, showRating = true, rating } = props;
  const count = children.length;
  const snapRow = count >= 3;
  return (
    <section aria-label={regionLabel}>
      <div
        className={cn(
          "md:flex md:gap-5 md:overflow-visible",
          snapRow
            ? "flex snap-x snap-mandatory gap-5 overflow-x-auto md:snap-none"
            : "flex flex-col gap-6 md:flex-row",
        )}
      >
        {children.map((card, i) => (
          <div
            key={i}
            className={cn(
              "md:min-w-0 md:flex-1",
              snapRow && "w-4/5 shrink-0 snap-start md:w-auto md:shrink",
            )}
          >
            {card}
          </div>
        ))}
      </div>
      {showRating && rating && (
        <div className="mt-6">
          <RatingLine {...rating} />
        </div>
      )}
    </section>
  );
}
