import type { MetadataRoute } from "next";
import { absoluteUrl, allowIndexing } from "@/lib/site";

// Only the production deployment is indexable. Preview and local builds return a
// blanket disallow so review URLs never compete with the canonical site in search.
export default function robots(): MetadataRoute.Robots {
  if (!allowIndexing) {
    return { rules: { userAgent: "*", disallow: "/" } };
  }

  return {
    rules: { userAgent: "*", allow: "/" },
    sitemap: absoluteUrl("/sitemap.xml"),
    host: absoluteUrl(),
  };
}
