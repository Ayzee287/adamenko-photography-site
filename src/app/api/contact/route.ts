import { NextResponse } from "next/server";
import { isBot, validateContact, type ContactInput } from "@/lib/contact";

// Contact delivery endpoint (sprint task 1). Production-ready, dependency-free:
// it posts to the Resend REST API with `fetch`, so there is no SDK to install and
// nothing runs at build time. Pipeline:
//
//   1. parse JSON                      → 400 on malformed body
//   2. honeypot                        → pretend success, send nothing (don't tip bots)
//   3. server-side validation          → 422 + the offending field names
//   4. config check (env present)      → 503 if the inbox isn't wired yet
//   5. send via Resend                 → 502 if the provider rejects
//   6. ok                              → 200 { ok: true }
//
// Required env (see .env.example): RESEND_API_KEY, CONTACT_TO_EMAIL,
// CONTACT_FROM_EMAIL (the FROM must be on a Resend-verified domain).

export const runtime = "nodejs";

const RESEND_ENDPOINT = "https://api.resend.com/emails";

export async function POST(req: Request) {
  let body: ContactInput;
  try {
    body = (await req.json()) as ContactInput;
  } catch {
    return NextResponse.json(
      { ok: false, error: "invalid_request" },
      { status: 400 },
    );
  }

  // Honeypot: a bot filled a field no human can see. Respond 200 so the bot learns
  // nothing, but send no mail.
  if (isBot(body)) {
    return NextResponse.json({ ok: true });
  }

  const result = validateContact(body);
  if (!result.ok) {
    return NextResponse.json(
      { ok: false, error: "validation", fields: result.fields },
      { status: 422 },
    );
  }
  const { name, email, occasion, message } = result.data;

  const apiKey = process.env.RESEND_API_KEY;
  const to = process.env.CONTACT_TO_EMAIL;
  const from = process.env.CONTACT_FROM_EMAIL;
  if (!apiKey || !to || !from) {
    // Not a user error — the deployment isn't finished. Logged for the operator; the
    // form shows a graceful error and offers the Instagram fallback.
    console.error(
      "[contact] Missing config: set RESEND_API_KEY, CONTACT_TO_EMAIL, CONTACT_FROM_EMAIL.",
    );
    return NextResponse.json(
      { ok: false, error: "unconfigured" },
      { status: 503 },
    );
  }

  const text = [
    `Nouvelle demande depuis le site Adamenko Photography`,
    ``,
    `Nom : ${name}`,
    `E-mail : ${email}`,
    `Type de séance : ${occasion}`,
    ``,
    `Message :`,
    message,
  ].join("\n");

  try {
    const res = await fetch(RESEND_ENDPOINT, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to: [to],
        reply_to: email,
        subject: `Nouvelle demande · ${occasion} · ${name}`,
        text,
      }),
    });

    if (!res.ok) {
      console.error("[contact] Resend error", res.status, await res.text());
      return NextResponse.json(
        { ok: false, error: "delivery" },
        { status: 502 },
      );
    }
  } catch (err) {
    console.error("[contact] Network error reaching Resend", err);
    return NextResponse.json({ ok: false, error: "delivery" }, { status: 502 });
  }

  return NextResponse.json({ ok: true });
}
