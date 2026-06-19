import Image from "next/image";
import { cn } from "@/lib/utils";
import type { GalleryImage } from "@/types/gallery";

type ImageFigureProps = {
  image: GalleryImage;
  /** Optional plate index for reserved frames, e.g. "01". */
  index?: string;
  sizes?: string;
  priority?: boolean;
  className?: string;
  /**
   * For cards inside a `group`: a quiet hover affordance — a clay frame, and a
   * slow scale within the frame once a real photo is present. The one sanctioned
   * transform-transition (vault motion-concept); everything else uses the global
   * interaction clock.
   */
  interactive?: boolean;
};

/**
 * The single way photography is presented. With a real export it renders an
 * optimised `next/image` (responsive, lazy by default, fades in). Without one it
 * renders an intentional reserved frame — corner marks + a quiet index — so the
 * layout and rhythm are real now and real photographs drop in with no layout
 * shift. The frame reserves space via the aspect-ratio token (CLS ≈ 0).
 */
export function ImageFigure({
  image,
  index,
  sizes,
  priority,
  className,
  interactive,
}: ImageFigureProps) {
  const ratio = image.ratio ?? "aspect-[4/5]";
  const hasImage = Boolean(image.src && image.width && image.height);

  return (
    <figure
      className={cn(
        "relative overflow-hidden bg-ink/[0.04] ring-1 ring-line",
        interactive && "group-hover:ring-clay/50",
        ratio,
        className,
      )}
    >
      {hasImage ? (
        <Image
          src={image.src as string}
          alt={image.alt}
          width={image.width as number}
          height={image.height as number}
          sizes={
            sizes ?? "(min-width:1024px) 33vw, (min-width:640px) 50vw, 100vw"
          }
          priority={priority}
          className={cn(
            "motion-image-fade absolute inset-0 h-full w-full object-cover",
            interactive &&
              "transition-transform duration-[650ms] ease-[var(--ease-settle)] group-hover:scale-[1.035]",
          )}
        />
      ) : (
        <span aria-hidden className="pointer-events-none absolute inset-0">
          <span className="absolute left-3 top-3 h-3 w-3 border-l border-t border-ink/20" />
          <span className="absolute right-3 top-3 h-3 w-3 border-r border-t border-ink/20" />
          <span className="absolute bottom-3 left-3 h-3 w-3 border-b border-l border-ink/20" />
          <span className="absolute bottom-3 right-3 h-3 w-3 border-b border-r border-ink/20" />
          {index ? (
            <span className="absolute left-4 top-4 font-serif text-sm tabular-nums text-ink/35">
              {index}
            </span>
          ) : null}
        </span>
      )}
    </figure>
  );
}
