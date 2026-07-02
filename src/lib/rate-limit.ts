// Per-IP fixed-window rate limiting for the contact endpoint. Deliberately
// in-memory and dependency-free — the same architecture bar as the rest of the
// pipeline (no SDK, no new service, nothing at build time).
//
// Serverless honesty: the window Map lives per warm instance. A cold start resets
// it and concurrent instances don't share it, so this is a FLOOR, not a fence — it
// stops runaway loops, naive scripts and accidental double-submits, which is the
// realistic abuse profile of a small portfolio's inquiry form (each accepted POST
// costs two provider emails, one of them to a visitor-supplied address). If the
// site ever outgrows this, the seam stays and the Map becomes a KV/Redis call.
//
// The window counts REQUESTS, not successful sends — every POST costs the
// attacker's budget the same. The client needs no changes: a 429 lands in the
// form's existing generic error state, whose copy already offers the direct-email
// fallback, so a rate-limited visitor is never stranded.

type Verdict = { ok: true } | { ok: false; retryAfterSeconds: number };

export type RateLimiter = {
  /** Count one request for `key`; `now` is injectable for tests. */
  check: (key: string, now?: number) => Verdict;
};

export function createFixedWindowLimiter({
  limit,
  windowMs,
  maxKeys = 1000,
}: {
  /** Requests allowed per key per window. */
  limit: number;
  windowMs: number;
  /** Memory bound — expired windows are pruned, then oldest evicted (FIFO). */
  maxKeys?: number;
}): RateLimiter {
  const windows = new Map<string, { count: number; resetAt: number }>();

  return {
    check(key, now = Date.now()) {
      // Keep the Map bounded: drop expired windows first, then (pathological
      // many-IPs case) the oldest entries — insertion order is window start.
      if (windows.size >= maxKeys) {
        for (const [k, w] of windows) if (w.resetAt <= now) windows.delete(k);
        while (windows.size >= maxKeys) {
          const oldest = windows.keys().next().value;
          if (oldest === undefined) break;
          windows.delete(oldest);
        }
      }

      const w = windows.get(key);
      if (!w || w.resetAt <= now) {
        windows.set(key, { count: 1, resetAt: now + windowMs });
        return { ok: true };
      }
      w.count += 1;
      if (w.count > limit) {
        return {
          ok: false,
          retryAfterSeconds: Math.max(1, Math.ceil((w.resetAt - now) / 1000)),
        };
      }
      return { ok: true };
    },
  };
}

/**
 * The rate-limit key for a request: the client IP. On Vercel `x-forwarded-for`
 * is "client, proxy1, …" — the first entry is the client. Local dev has neither
 * header, so everything shares the "unknown" bucket (irrelevant in production,
 * where the platform always sets the header).
 */
export function clientKey(req: Request): string {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) {
    const first = forwarded.split(",")[0]?.trim();
    if (first) return first;
  }
  return req.headers.get("x-real-ip")?.trim() || "unknown";
}
