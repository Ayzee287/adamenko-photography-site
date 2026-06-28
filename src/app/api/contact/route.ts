import { NextResponse } from "next/server";
import { isBot, validateContact, type ContactInput } from "@/lib/contact";
import { getEmailConfig } from "@/lib/email/config";
import { buildContactEmail } from "@/lib/email/templates";
import { sendContactEmail } from "@/lib/email/send";
import { createLogger } from "@/lib/log";

// Contact delivery endpoint. Production-ready and dependency-free: it posts to the
// Resend REST API with `fetch`, so there is no SDK to install and nothing runs at
// build time. The pieces are split into testable modules:
//   • lib/contact      — shared validation + honeypot (client & server agree)
//   • lib/email/config — request-time env validation (safe when unconfigured)
//   • lib/email/templates — HTML + plain-text body, with sanitization
//   • lib/email/send   — the single Resend call (returns a result, never throws)
//   • lib/log          — structured JSON logging (no PII)
//
// Pipeline:
//   1. parse JSON                 → 400 on a malformed body
//   2. honeypot                   → pretend success, send nothing (don't tip bots)
//   3. server-side validation     → 422 + the offending field names
//   4. config check (env present) → 503 if the inbox isn't wired yet
//   5. send via Resend            → 502 if the provider rejects / is unreachable
//   6. ok                         → 200 { ok: true }
//
// Required env (see .env.example): RESEND_API_KEY, CONTACT_TO_EMAIL,
// CONTACT_FROM_EMAIL (the FROM must be on a Resend-verified domain).

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

  const config = getEmailConfig();
  if (!config.ok) {
    // Not a user error — the deployment isn't finished. Logged for the operator; the
    // form shows a graceful error and offers the email/Instagram fallback.
    log.error("unconfigured", { missing: config.missing });
    return NextResponse.json({ ok: false, error: "unconfigured" }, { status: 503 });
  }
  // Non-fatal: surface placeholder/temporary-sender misconfiguration in the logs.
  if (config.warnings.length) log.warn("config_warning", { warnings: config.warnings });

  const email = buildContactEmail(result.data);
  const sent = await sendContactEmail(config.config, email);

  if (!sent.ok) {
    log.error("delivery_failed", {
      reason: sent.reason,
      status: sent.status,
      detail: sent.detail,
    });
    return NextResponse.json({ ok: false, error: "delivery" }, { status: 502 });
  }

  // Metadata only — never the visitor's name, e-mail, or message body.
  log.info("delivered", { occasion: result.data.occasion, id: sent.id });
  return NextResponse.json({ ok: true });
}
