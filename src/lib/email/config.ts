// Email delivery configuration — read + validated at REQUEST time (never at module
// load / build time), so a deployment with no mail credentials still builds and
// renders. The contact route calls getEmailConfig() and degrades to a 503 + the
// client fallback whenever it isn't `ok`.
//
// AFTER a production domain is verified in Resend, the ONLY change required is the
// three env vars below in Vercel — there is no code edit. See
// docs/email-architecture.md and .env.example.

/** Resend's transactional-email REST endpoint (no SDK — we POST with `fetch`). */
export const RESEND_ENDPOINT = "https://api.resend.com/emails";

/** The env vars that must all be set for the contact form to deliver mail. */
export const REQUIRED_EMAIL_ENV = [
  "RESEND_API_KEY",
  "CONTACT_TO_EMAIL",
  "CONTACT_FROM_EMAIL",
] as const;

export type EmailConfig = {
  /** Resend API key (`re_…`). */
  apiKey: string;
  /** Inbox that receives inquiries (the photographer's real address). */
  to: string;
  /** The From address — MUST be on a Resend-verified domain or sends are rejected. */
  from: string;
};

export type EmailConfigResult =
  | { ok: true; config: EmailConfig; warnings: string[] }
  | { ok: false; missing: string[] };

const EMAIL_SHAPE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Validate and return the email configuration from the environment.
 *
 * - Incomplete → `{ ok: false, missing }` (the route logs the names and returns 503).
 * - Complete → `{ ok: true, config, warnings }`. `warnings` is non-fatal and flags
 *   values that look like a placeholder or a temporary sender, so a misconfigured
 *   production deploy is loud in the logs without ever breaking the build or page.
 */
export function getEmailConfig(): EmailConfigResult {
  const apiKey = process.env.RESEND_API_KEY?.trim() ?? "";
  const to = process.env.CONTACT_TO_EMAIL?.trim() ?? "";
  const from = process.env.CONTACT_FROM_EMAIL?.trim() ?? "";

  const missing: string[] = [];
  if (!apiKey) missing.push("RESEND_API_KEY");
  if (!to) missing.push("CONTACT_TO_EMAIL");
  if (!from) missing.push("CONTACT_FROM_EMAIL");
  if (missing.length) return { ok: false, missing };

  const warnings: string[] = [];
  if (!EMAIL_SHAPE.test(to))
    warnings.push("CONTACT_TO_EMAIL is not a valid e-mail address");
  if (!EMAIL_SHAPE.test(from))
    warnings.push("CONTACT_FROM_EMAIL is not a valid e-mail address");
  // Policy (production email prep): the From must be a real verified sending domain —
  // never the Resend onboarding domain (poor deliverability) or an example placeholder.
  if (/@resend\.dev$/i.test(from))
    warnings.push(
      "CONTACT_FROM_EMAIL uses the temporary resend.dev domain — set a verified production domain",
    );
  if (/@example\.(com|org|net)$/i.test(from) || /@example\.(com|org|net)$/i.test(to))
    warnings.push("A contact address still uses an example.* placeholder");

  return { ok: true, config: { apiKey, to, from }, warnings };
}
