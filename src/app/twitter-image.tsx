import { ogAlt, ogContentType, ogSize, renderOgImage } from "@/lib/og";

// Site-wide Twitter card image — same renderer as OpenGraph (summary_large_image).
export const alt = ogAlt;
export const size = ogSize;
export const contentType = ogContentType;

export default function TwitterImage() {
  return renderOgImage();
}
