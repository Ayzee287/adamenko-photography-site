"use server";

// The inquiry server action — REAL delivery (P19). Validation is real (the shared
// schema), the honeypot is screened (bots get a silent "success"), submissions are
// per-IP rate-limited, and delivery goes out through Resend via the shared email
// transport. It NEVER fakes success: if mail is not configured or the provider
// rejects the send, the action returns the form-scope error (input kept) and the
// visitor sees the email/Instagram fallback — honest, not silent.
//
// Two sends per inquiry: the owner notification (the success gate; Reply-To = the
// visitor) and a best-effort locale-aware visitor confirmation (Reply-To = owner).
// A confirmation failure is logged but never fails the submission for the visitor.

import { headers } from "next/headers";
import {
  initialInquiryState,
  inquirySchema,
  requiredFields,
  type InquiryField,
  type InquiryState,
} from "./inquiry-schema";
import { getEmailConfig } from "@/lib/email/config";
import { sendEmail } from "@/lib/email/send";
import { buildOwnerNotification, buildVisitorConfirmation } from "@/lib/email/templates";
import { createFixedWindowLimiter } from "@/lib/rate-limit";
import { createLogger } from "@/lib/log";
import type { ValidContact } from "@/lib/contact";

const log = createLogger("inquiry");

// Per-IP: 5 inquiries / 10 minutes. Module-level so it survives across requests on a
// warm server instance (a cold start resets it — acceptable for best-effort abuse control).
const limiter = createFixedWindowLimiter({ limit: 5, windowMs: 10 * 60 * 1000 });

async function clientKey(): Promise<string> {
  const h = await headers();
  const fwd = h.get("x-forwarded-for");
  if (fwd) {
    const first = fwd.split(",")[0]?.trim();
    if (first) return first;
  }
  return h.get("x-real-ip")?.trim() || "unknown";
}

/** sessionType is a service slug ("famille"); the human occasion label is its capitalisation. */
function occasionLabel(slug: string): string {
  return slug ? slug.charAt(0).toUpperCase() + slug.slice(1) : slug;
}

export async function submitInquiry(
  _prev: InquiryState,
  formData: FormData,
): Promise<InquiryState> {
  const raw = {
    name: String(formData.get("name") ?? ""),
    email: String(formData.get("email") ?? ""),
    sessionType: String(formData.get("sessionType") ?? ""),
    period: String(formData.get("period") ?? ""),
    place: String(formData.get("place") ?? ""),
    message: String(formData.get("message") ?? ""),
    source: String(formData.get("source") ?? ""),
    company: String(formData.get("company") ?? ""),
    origin: String(formData.get("origin") ?? ""),
    locale: String(formData.get("locale") ?? "fr"),
  };

  // Honeypot: pretend success, deliver nothing.
  if (raw.company !== "") {
    return { ...initialInquiryState, status: "success" };
  }

  const parsed = inquirySchema.safeParse(raw);
  if (!parsed.success) {
    const bad = new Set(parsed.error.issues.map((i) => String(i.path[0])));
    return {
      status: "error",
      values: raw,
      fieldErrors: requiredFields.filter((f): f is InquiryField => bad.has(f)),
      formError: false,
    };
  }

  // Dev-only affordance: a message containing "[declencher-erreur]" exercises the
  // form-scope failure path end-to-end without a real outage.
  if (
    process.env.NODE_ENV !== "production" &&
    parsed.data.message.includes("[declencher-erreur]")
  ) {
    return { status: "error", values: raw, fieldErrors: [], formError: true };
  }

  // Rate limit (per IP). Over the limit → form-scope error (input kept, fallback shown).
  const verdict = limiter.check(await clientKey());
  if (!verdict.ok) {
    log.warn("rate_limited", { retryAfterSeconds: verdict.retryAfterSeconds });
    return { status: "error", values: raw, fieldErrors: [], formError: true };
  }

  // Mail must be configured. Unconfigured → honest form-scope error, NEVER a fake success.
  const cfg = getEmailConfig();
  if (!cfg.ok) {
    log.error("email_unconfigured", { missing: cfg.missing });
    return { status: "error", values: raw, fieldErrors: [], formError: true };
  }
  for (const w of cfg.warnings) log.warn("email_config_warning", { warning: w });

  const locale = raw.locale === "en" ? "en" : "fr";
  const contact: ValidContact & { period?: string; place?: string; source?: string } = {
    name: parsed.data.name,
    email: parsed.data.email,
    // occasion is typed to ContactOccasion; the service slugs map 1:1 to those labels.
    occasion: occasionLabel(parsed.data.sessionType) as ValidContact["occasion"],
    message: parsed.data.message,
    period: parsed.data.period,
    place: parsed.data.place,
    source: parsed.data.source,
  };

  // Owner notification is the SUCCESS GATE. Reply-To = the visitor so a reply reaches them.
  const owner = buildOwnerNotification(contact);
  const ownerResult = await sendEmail(cfg.config, {
    to: cfg.config.to,
    replyTo: parsed.data.email,
    subject: owner.subject,
    text: owner.text,
    html: owner.html,
  });
  if (!ownerResult.ok) {
    log.error("owner_send_failed", {
      reason: ownerResult.reason,
      status: ownerResult.status,
      detail: ownerResult.detail?.slice(0, 200),
    });
    return { status: "error", values: raw, fieldErrors: [], formError: true };
  }

  // Visitor confirmation is BEST-EFFORT: a failure here never fails the submission.
  try {
    const conf = buildVisitorConfirmation(contact, locale);
    const confResult = await sendEmail(cfg.config, {
      to: parsed.data.email,
      replyTo: cfg.config.to,
      subject: conf.subject,
      text: conf.text,
      html: conf.html,
    });
    if (!confResult.ok) {
      log.warn("confirmation_send_failed", {
        reason: confResult.reason,
        status: confResult.status,
      });
    }
  } catch (err) {
    log.warn("confirmation_threw", {
      detail: err instanceof Error ? err.message : "unknown",
    });
  }

  log.info("delivered", {
    occasion: contact.occasion,
    origin: raw.origin || "?",
    locale,
    id: ownerResult.id,
  });
  return { ...initialInquiryState, status: "success" };
}
