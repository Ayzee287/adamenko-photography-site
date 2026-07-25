// pricing-block — state the number plainly. Name (h3) → price line ("à partir
// de" + amount in the price register, formatted by the ONE French-typography
// helper) → one description line → inclusion rows (hairline-separated, no
// bullets). The heirloom line and the adjacent review are CHAPTER composition
// (the adjacency law stays visible in page assembly — census note).
// ∅: no price → the parent doesn't render the block.

import { formatPrice } from "@/lib/utils/format";
import type { Locale } from "@/lib/i18n";

export function PricingBlock(props: {
  name: string;
  priceIntro: string; // "à partir de" / "from"
  priceFrom: number;
  locale: Locale;
  description: string;
  inclusions: string[];
}) {
  const { name, priceIntro, priceFrom, locale, description, inclusions } = props;
  return (
    <div className="w-full">
      <h3 className="text-h3 text-ink">{name}</h3>
      <p className="mt-3 flex items-baseline gap-2">
        <span className="text-body text-ink-secondary">{priceIntro}</span>
        <span className="text-price text-ink">{formatPrice(priceFrom, locale)}</span>
      </p>
      <p className="mt-4 text-body text-ink-secondary">{description}</p>
      <ul className="mt-5">
        {inclusions.map((row, i) => (
          <li key={i} className="border-t border-hairline py-3 text-body text-ink">
            {row}
          </li>
        ))}
      </ul>
    </div>
  );
}
