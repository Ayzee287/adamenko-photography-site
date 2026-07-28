import { RESEND_ENDPOINT, type EmailConfig } from "@/lib/email/config";

// The one network call to Resend. Pure and dependency-free: it POSTs to the REST API
// with `fetch` (no SDK, nothing at build time) and returns a discriminated result so
// the caller decides the HTTP status + logs. It deliberately does no logging itself,
// and never throws — a network failure is returned as `{ ok: false, reason }`.
//
// `from` is ALWAYS the branded `CONTACT_FROM_EMAIL` (config.from), wrapped by fromHeader()
// so the studio's name — not a bare address — is what an inbox shows; only `to` and
// `replyTo` vary per message, so the same transport sends both the owner notification
// (Reply-To = visitor) and the visitor confirmation (Reply-To = owner inbox).

export type OutgoingEmail = {
  /** Recipient address. */
  to: string;
  /** Reply-To address — where a reply to this message should go. */
  replyTo: string;
  subject: string;
  text: string;
  html: string;
};

/**
 * The From header, with the studio's name on it.
 *
 * `CONTACT_FROM_EMAIL` is a bare address, and a bare address is what every inbox was
 * showing: "hello@adamenko-photography.com" in the sender column instead of the brand,
 * on both the inquiry and the client-facing confirmation. An operator who has already
 * written a display name into the env var keeps theirs.
 */
export function fromHeader(address: string): string {
  return address.includes("<") ? address : `Adamenko Photography <${address}>`;
}

export type SendResult =
  | { ok: true; id?: string }
  | {
      ok: false;
      /** "provider" = Resend rejected the request; "network" = it was unreachable. */
      reason: "provider" | "network";
      /** Provider HTTP status, when we got a response. */
      status?: number;
      /** Short provider/network detail for the logs (never contains visitor PII). */
      detail?: string;
    };

/** Deliver one email via Resend. Returns a result; never throws. */
export async function sendEmail(
  config: EmailConfig,
  message: OutgoingEmail,
): Promise<SendResult> {
  let res: Response;
  try {
    res = await fetch(RESEND_ENDPOINT, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${config.apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: fromHeader(config.from),
        to: [message.to],
        reply_to: message.replyTo,
        subject: message.subject,
        text: message.text,
        html: message.html,
      }),
    });
  } catch (err) {
    return {
      ok: false,
      reason: "network",
      detail: err instanceof Error ? err.message : "unknown network error",
    };
  }

  if (!res.ok) {
    // Resend returns a small JSON error body — safe to surface in logs (no PII).
    const detail = await res.text().catch(() => "");
    return { ok: false, reason: "provider", status: res.status, detail };
  }

  // Resend returns { id } on success; surfacing it makes a delivery traceable.
  const data = (await res.json().catch(() => null)) as { id?: string } | null;
  return { ok: true, id: data?.id };
}
