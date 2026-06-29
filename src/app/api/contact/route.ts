import { NextResponse } from "next/server";
import { isBot, validateContact, type ContactInput } from "@/lib/contact";
import { getEmailConfig } from "@/lib/email/config";
import { buildOwnerNotification, buildVisitorConfirmation } from "@/lib/email/templates";
import { sendEmail } from "@/lib/email/send";
import { createLogger } from "@/lib/log";

// Contact delivery endpoint. Production-ready and dependency-free: it posts to the
// Resend REST API with `fetch`, so there is no SDK to install and nothing runs at
// build time. The pieces are split into testable modules:
//   • lib/contact      — shared validation + honeypot (client & server agree)
//   • lib/email/config — request-time env validation (safe when unconfigured)
//   • lib/email/templates — owner notification + visitor confirmation (HTML + text)
//   • lib/email/send   — the single Resend call (returns a result, never throws)
//   • lib/log          — structured JSON logging (no PII)
//
// Pipeline:
//   1. parse JSON                 → 400 on a malformed body
//   2. honeypot                   → pretend success, send nothing (don't tip bots)
//   3. server-side validation     → 422 + the offending field names
//   4. config check (env present) → 503 if the inbox isn't wired yet
//   5. send OWNER notification    → 502 if the provider rejects / is unreachable
//   6. send VISITOR confirmation  → best-effort, only after (5) succeeds; a failure
//                                   here is logged but never fails the submission
//   7. ok                         → 200 { ok: true }
//
// `from` is always the branded CONTACT_FROM_EMAIL; Reply-To differs per message:
//   - owner notification → Reply-To = the visitor (the photographer replies to them)
//   - visitor confirmation → Reply-To = the owner inbox (their reply reaches her)

export const runtime = "nodejs";

const log = createLogger("contact");

export async function POST(req: Request) {
  let body: ContactInput;
  try {
    body = (await req.json()) as ContactInput;
  } catch {
    return NextResponse.json({ ok: false, error: "invalid_request" }, { status: 400 });
  }

  // Honeypot: a bot filled a field no human can see. Respond 200 so the bot learns
  // nothing, but send no mail.
  if (isBot(body)) {
    log.info("honeypot_drop");
    return NextResponse.json({ ok: true });
  }

  const result = validateContact(body);
  if (!result.ok) {
    return NextResponse.json(
      { ok: false, error: "validation", fields: result.fields },
      { status: 422 },
    );
  }
  const { data } = result;

  const config = getEmailConfig();
  if (!config.ok) {
    // Not a user error — the deployment isn't finished. Logged for the operator; the
    // form shows a graceful error and offers the email/Instagram fallback.
    log.error("unconfigured", { missing: config.missing });
    return NextResponse.json({ ok: false, error: "unconfigured" }, { status: 503 });
  }
  // Non-fatal: surface placeholder/temporary-sender misconfiguration in the logs.
  if (config.warnings.length) log.warn("config_warning", { warnings: config.warnings });
  const cfg = config.config;

  // 5 · Owner notification — the inquiry itself. Reply-To = visitor, so the
  //     photographer's "Reply" goes straight back to them. This is the success gate.
  const ownerSent = await sendEmail(cfg, {
    to: cfg.to,
    replyTo: data.email,
    ...buildOwnerNotification(data),
  });
  if (!ownerSent.ok) {
    log.error("delivery_failed", {
      reason: ownerSent.reason,
      status: ownerSent.status,
      detail: ownerSent.detail,
    });
    return NextResponse.json({ ok: false, error: "delivery" }, { status: 502 });
  }
  log.info("delivered", { occasion: data.occasion, id: ownerSent.id });

  // 6 · Visitor confirmation — best-effort, ONLY now that the inquiry is delivered.
  //     Reply-To = the owner inbox. A failure here must NOT fail the submission: the
  //     photographer already has the inquiry, so the visitor still sees success.
  //     Localised to the site the form was submitted from ("en" → English, else French).
  const confirmationLocale = body.locale === "en" ? "en" : "fr";
  const confirmation = await sendEmail(cfg, {
    to: data.email,
    replyTo: cfg.to,
    ...buildVisitorConfirmation(data, confirmationLocale),
  });
  if (confirmation.ok) {
    log.info("confirmation_sent", { id: confirmation.id });
  } else {
    log.warn("confirmation_failed", {
      reason: confirmation.reason,
      status: confirmation.status,
    });
  }

  return NextResponse.json({ ok: true });
}
