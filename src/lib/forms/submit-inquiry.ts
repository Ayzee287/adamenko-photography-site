"use server";

// The inquiry server action — Phase 10 shape, MOCK DELIVERY. Validation is
// REAL (the shared schema), the honeypot is screened (bots get a silent
// "success" — V1's convention), and P19 swaps ONLY the delivery block for
// Resend + rate limiting. Input is never lost: every error path echoes the
// submitted values back (the React 19 form reset re-fills from state.values).

import {
  initialInquiryState,
  inquirySchema,
  requiredFields,
  type InquiryField,
  type InquiryState,
} from "./inquiry-schema";

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
    // Provenance (the measurement law): which page sold this inquiry.
    origin: String(formData.get("origin") ?? ""),
    locale: String(formData.get("locale") ?? "fr"),
  };

  // Honeypot: pretend success, deliver nothing.
  if (raw.company !== "") {
    return { ...initialInquiryState, status: "success" };
  }

  const parsed = inquirySchema.safeParse(raw);
  if (!parsed.success) {
    const bad = new Set(
      parsed.error.issues.map((i) => String(i.path[0])),
    );
    return {
      status: "error",
      values: raw,
      fieldErrors: requiredFields.filter((f): f is InquiryField => bad.has(f)),
      formError: false,
    };
  }

  // ── MOCK DELIVERY (P19 replaces this block with Resend + rate limit) ──
  // Dev affordance: a message of "[declencher-erreur]" exercises the
  // form-scope failure path end-to-end without a real outage.
  if (parsed.data.message.includes("[declencher-erreur]")) {
    return { status: "error", values: raw, fieldErrors: [], formError: true };
  }
  console.log(
    `[inquiry:mock] ${parsed.data.sessionType} — ${parsed.data.name} <${parsed.data.email}> (origin: ${raw.origin || "?"}, locale: ${raw.locale})`,
  );

  return { ...initialInquiryState, status: "success" };
}
