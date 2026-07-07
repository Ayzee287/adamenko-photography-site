/**
 * Deployment-level constants. The canonical origin is read from
 * NEXT_PUBLIC_SITE_URL (set in Vercel) so canonical/OpenGraph URLs resolve
 * against the real production origin; it falls back to localhost in dev.
 *
 * In production this is https://www.adamenko-photography.com (the custom domain,
 * live since 2026-06-29; apex and /fr both 308 to it). Changing domains is an
 * env-var edit, never a code change.
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
