// price-chapter — THE adjacency law, structural: Silence → heirloom line
// (serif, hers) → PricingBlock(s) → the review at ≤ space/8 → Silence.
// Price is NEVER assembled any other way (census: the law stays visible in
// page assembly). Two blocks (tarifs) sit 2-up ≥768; the review always
// follows within the gap-8 bond.

import { SilenceSpacer } from "./silence-spacer";
import { RichText } from "@/components/typography/rich-text";
import { cn } from "@/lib/utils/cn";

export function PriceChapter(props: {
  heirloom: string;
  blocks: React.ReactNode[];
  review: React.ReactNode;
}) {
  const { heirloom, blocks, review } = props;
  return (
    <div>
      <SilenceSpacer />
      <RichText voice="body-letter" paragraphs={[heirloom]} />
      <div
        className={cn(
          "mt-7",
          blocks.length > 1 ? "grid gap-6 md:grid-cols-2 md:gap-5" : "max-w-measure",
        )}
      >
        {blocks.map((block, i) => (
          <div key={i}>{block}</div>
        ))}
      </div>
      <div className="mt-8 max-w-measure">{review}</div>
      <SilenceSpacer />
    </div>
  );
}
