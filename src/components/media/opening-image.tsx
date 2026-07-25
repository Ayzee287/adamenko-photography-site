// opening-image — the full-bleed media layer (hero + story beats). Owns
// PRIORITY loading (the LCP — everything else is lazy). context:
// viewport-height (hero: --size-opening) | ratio (story beats: intrinsic).
// Optional scrim = the approved opening gradient, capped ≤40% height.

import { Photo } from "./photo";
import { cn } from "@/lib/utils/cn";
import type { ImageRatio } from "./image-frame";

const ratioClass: Record<ImageRatio, string> = {
  "3:2": "aspect-3/2",
  "2:3": "aspect-2/3",
  "4:5": "aspect-4/5",
  "5:4": "aspect-5/4",
  "1:1": "aspect-square",
};

export function OpeningImage(props: {
  src: string;
  alt: string;
  context?: "viewport-height" | "ratio";
  ratio?: ImageRatio;
  scrim?: boolean;
  priority?: boolean;
}) {
  const {
    src,
    alt,
    context = "viewport-height",
    ratio = "3:2",
    scrim = false,
    priority = true,
  } = props;
  return (
    <div
      className={cn(
        "relative w-full overflow-hidden",
        context === "viewport-height"
          ? "h-(--size-opening)"
          : ratioClass[ratio],
      )}
    >
      <Photo src={src} alt={alt} sizes="100vw" priority={priority} />
      {scrim && (
        <div
          aria-hidden
          className="scrim-opening absolute inset-x-0 bottom-0 h-2/5"
        />
      )}
    </div>
  );
}
