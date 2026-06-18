/**
 * Deployment-level constants. The canonical origin is read from
 * NEXT_PUBLIC_SITE_URL (set in Vercel) so canonical/OpenGraph URLs resolve
 * against the real production origin; it falls back to localhost in dev.
 *
 * At launch this will be the Vercel subdomain; a custom domain is deferred
 * (vault D009) — change the env var, not the code, when it arrives.
 */
export const siteUrl = new URL(
  process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
);

/** Absolute URL for a path, resolved against the single site origin. */
export function absoluteUrl(path: string = "/"): string {
  return new URL(path, siteUrl).toString();
}

/**
 * Only the production deployment is indexable. Preview + local builds are
 * disallowed in robots so review URLs never compete in search. Vercel sets
 * VERCEL_ENV = "production" only on the production deployment.
 */
export const allowIndexing = process.env.VERCEL_ENV === "production";
