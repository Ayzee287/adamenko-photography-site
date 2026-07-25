import type { MetadataRoute } from "next";
import { siteUrl, allowIndexing } from "@/lib/site";

// Only the production deployment is indexable (allowIndexing = VERCEL_ENV
// "production"); preview + local builds disallow everything so review URLs never
// compete in search. The dev tooling routes are always kept out of the index.
export default function robots(): MetadataRoute.Robots {
  if (!allowIndexing) {
    return { rules: { userAgent: "*", disallow: "/" } };
  }
  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/dev/", "/*/dev/"] },
    sitemap: new URL("/sitemap.xml", siteUrl).toString(),
    host: siteUrl.origin,
  };
}
