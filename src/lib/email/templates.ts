import type { ValidContact } from "@/lib/contact";

// The inquiry email — both a plain-text part AND an HTML part, built from an
// already-validated submission. Two layers of sanitization make untrusted input
// safe to render:
//   • sanitizeHeader() strips control characters from values that land in mail
//     headers (the subject) — defence-in-depth against header injection.
//   • escapeHtml() escapes every value interpolated into the HTML body, so no
//     submitted text can break the markup or inject elements.
// Copy is French: the sole recipient is the photographer.
//
// The HTML is a quiet, editorial notification — same palette/typographic register
// as the site (warm cream, single clay accent, serif heading, hairline rules), not
// a marketing layout. Inline styles + presentation tables only (email clients strip
// <style>/external CSS and ignore CSS variables); `color-scheme: light` keeps the
// warm light palette from being auto-inverted by dark-mode clients.

const BRAND = "Adamenko Photography";
const BRAND_TAGLINE = "Photographe de famille à Lyon";

// Brand palette (mirrors src/styles/globals.css @theme — inlined for email clients).
const COLOR = {
  ink: "#2a2420",
  paper: "#faf6f0",
  muted: "#6f655c",
  line: "#e7ddd0",
  clay: "#b07159",
  sand: "#f3ece1",
} as const;

// Web-safe stacks that echo the site's pairing (serif display, humanist sans body)
// without web fonts — Georgia is the warm serif present on every platform.
const SANS = "-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif";
const SERIF = "Georgia,'Times New Roman',Times,serif";

// ASCII control characters (0x00–0x1F and 0x7F). Built from char codes so the
// source stays printable and ESLint's no-control-regex never trips.
const CONTROL_CHARS = new RegExp(`[\\u0000-\\u001F\\u007F]+`, "g");

/** Strip CR/LF + other control chars and collapse whitespace — for header-bound values. */
function sanitizeHeader(value: string): string {
  return value.replace(CONTROL_CHARS, " ").replace(/\s+/g, " ").trim();
}

/** Escape the five HTML-significant characters for safe interpolation into markup. */
function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export type ContactEmail = {
  subject: string;
  text: string;
  html: string;
  /** The visitor's address — set as Reply-To so a reply goes straight back to them. */
  replyTo: string;
};

/** Build the subject / text / html / reply-to for one validated inquiry. */
export function buildContactEmail(data: ValidContact): ContactEmail {
  // Header-safe, single-line versions for the subject.
  const name = sanitizeHeader(data.name);
  const occasion = sanitizeHeader(data.occasion);
  const email = data.email.trim();
  const message = data.message.trim();

  const subject = `Nouvelle demande · ${occasion} · ${name}`;

  const text = [
    `Nouvelle demande depuis le site ${BRAND}`,
    "",
    `Nom : ${name}`,
    `E-mail : ${email}`,
    `Type de séance : ${occasion}`,
    "",
    "Message :",
    message,
    "",
    "—",
    `${BRAND} · ${BRAND_TAGLINE}`,
    `Astuce : répondez directement à cet e-mail pour écrire à ${name}.`,
  ].join("\n");

  const html = renderHtml({ name, email, occasion, message });

  return { subject, text, html, replyTo: email };
}

/** A single, table-based HTML email — inline styles only, for client compatibility. */
function renderHtml(d: {
  name: string;
  email: string;
  occasion: string;
  message: string;
}): string {
  const name = escapeHtml(d.name);
  const email = escapeHtml(d.email);
  const occasion = escapeHtml(d.occasion);
  // Preserve the visitor's line breaks; escape first so the <br> we add is the only markup.
  const message = escapeHtml(d.message).replace(/\r?\n/g, "<br>");

  // Inbox preview line (hidden in the body) — controls what shows next to the subject.
  const preheader = `${name} · ${occasion}`;

  const row = (label: string, value: string) => `
                <tr>
                  <td style="padding:7px 0;font-size:12px;letter-spacing:0.04em;color:${COLOR.muted};width:130px;vertical-align:top;">${label}</td>
                  <td style="padding:7px 0;font-size:15px;line-height:1.5;color:${COLOR.ink};">${value}</td>
                </tr>`;

  return `<!DOCTYPE html>
<html lang="fr">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="color-scheme" content="light">
    <meta name="supported-color-schemes" content="light">
    <title>Nouvelle demande · ${BRAND}</title>
  </head>
  <body style="margin:0;padding:0;background:${COLOR.sand};font-family:${SANS};-webkit-font-smoothing:antialiased;">
    <div style="display:none;max-height:0;overflow:hidden;opacity:0;mso-hide:all;">${preheader}</div>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${COLOR.sand};">
      <tr>
        <td align="center" style="padding:40px 16px;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:${COLOR.paper};border:1px solid ${COLOR.line};border-radius:10px;">
            <!-- Masthead -->
            <tr>
              <td style="padding:32px 36px 0;">
                <p style="margin:0;font-size:11px;letter-spacing:0.16em;text-transform:uppercase;color:${COLOR.clay};">${BRAND}</p>
                <h1 style="margin:14px 0 0;font-family:${SERIF};font-size:23px;font-weight:400;line-height:1.25;color:${COLOR.ink};">Nouvelle demande de contact</h1>
                <p style="margin:8px 0 0;font-size:13px;color:${COLOR.muted};">Reçue via le formulaire du site.</p>
              </td>
            </tr>
            <!-- Details -->
            <tr>
              <td style="padding:22px 36px 0;">
                <hr style="border:none;border-top:1px solid ${COLOR.line};margin:0 0 4px;">
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                  ${row("Nom", name)}
                  ${row("E-mail", `<a href="mailto:${email}" style="color:${COLOR.clay};text-decoration:none;">${email}</a>`)}
                  ${row("Type de séance", occasion)}
                </table>
              </td>
            </tr>
            <!-- Message -->
            <tr>
              <td style="padding:22px 36px 0;">
                <p style="margin:0 0 10px;font-size:12px;letter-spacing:0.04em;text-transform:uppercase;color:${COLOR.muted};">Message</p>
                <div style="border-left:2px solid ${COLOR.clay};padding:2px 0 2px 18px;font-size:15px;line-height:1.65;color:${COLOR.ink};">${message}</div>
              </td>
            </tr>
            <!-- Reply affordance -->
            <tr>
              <td style="padding:26px 36px 0;">
                <a href="mailto:${email}" style="font-size:15px;color:${COLOR.ink};text-decoration:none;">
                  <span style="text-decoration:underline;text-decoration-color:${COLOR.clay};text-underline-offset:3px;">Répondre à ${name}</span>
                  <span style="color:${COLOR.clay};">&nbsp;&rarr;</span>
                </a>
              </td>
            </tr>
            <!-- Footer -->
            <tr>
              <td style="padding:30px 36px 34px;">
                <hr style="border:none;border-top:1px solid ${COLOR.line};margin:0 0 14px;">
                <p style="margin:0;font-size:12px;line-height:1.6;color:${COLOR.muted};">
                  ${BRAND} · ${BRAND_TAGLINE}<br>
                  Vous pouvez aussi répondre directement à cet e-mail — il revient à ${name}.
                </p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}
