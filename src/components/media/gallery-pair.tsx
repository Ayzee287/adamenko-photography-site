// gallery-pair — the authored loud/quiet editorial pair (one loud, one
// quiet — the DNA's image conversation). Desktop: side by side, gutter
// space/5, optional quiet offset (space/8 — the sanctioned stagger).
// Mobile: stacks loud→quiet, gap space/6. Order = the edit, never reordered.

import { ImageFrame, type ImageFrameProps } from "./image-frame";
import { cn } from "@/lib/utils/cn";

export function GalleryPair(props: {
  loud: ImageFrameProps;
  quiet: ImageFrameProps;
  offset?: boolean;
}) {
  const { loud, quiet, offset = false } = props;
  return (
    <div className="flex flex-col gap-6 md:flex-row md:items-start md:gap-5">
      <div className="md:basis-3/5">
        <ImageFrame {...loud} />
      </div>
      <div className={cn("md:basis-2/5", offset && "md:pt-8")}>
        <ImageFrame {...quiet} />
      </div>
    </div>
  );
}
