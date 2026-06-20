import { ogAlt, ogContentType, ogSize, renderOgImage } from "@/lib/og";

// Site-wide OpenGraph image (inherited by every page via Next's file convention).
export const alt = ogAlt;
export const size = ogSize;
export const contentType = ogContentType;

export default function OpengraphImage() {
  return renderOgImage();
}
