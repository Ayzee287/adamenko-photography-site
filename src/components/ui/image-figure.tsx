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
   * For cards inside a `group`: a slow scale within the frame once a real photo
   * is present. The one sanctioned transform-transition (vault motion-concept);
   * everything else uses the global interaction clock.
   */
  interactive?: boolean;
};

/**
 * The single way photography is presented — now **borderless** (D021): the image
 * is the object, with no ring/card around it. With a real export it renders an
 * optimised `next/image` (responsive, lazy, fades in). Without one it renders a
 * *directed* reserved frame: a warm tonal field + a quiet art-direction note
 * (`image.hint`) naming the photograph that belongs here, so the placeholder
 * reads as intentional, not empty. Space is reserved via the aspect-ratio token
 * (CLS ≈ 0), so the real photo drops in with no layout shift.
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
        "relative overflow-hidden bg-gradient-to-br from-[#efe7db] to-[#ddd0bf]",
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
              "transition-transform duration-[650ms] ease-[var(--ease-settle)] group-hover:scale-[1.04]",
          )}
        />
      ) : (
        <span
          aria-hidden
          className="pointer-events-none absolute inset-0 flex flex-col justify-end p-5"
        >
          {index ? (
            <span className="absolute left-5 top-5 font-serif text-sm tabular-nums text-ink/30">
              {index}
            </span>
          ) : null}
          {image.hint ? (
            <span className="max-w-[24ch] font-serif text-sm italic leading-snug text-ink/45">
              {image.hint}
            </span>
          ) : null}
        </span>
      )}
    </figure>
  );
}
