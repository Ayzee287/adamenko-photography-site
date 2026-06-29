import type { ValidContact } from "@/lib/contact";

// The two inquiry emails, both built from an already-validated submission:
//   • buildOwnerNotification — what the photographer receives (the inquiry).
//   • buildVisitorConfirmation — the courteous auto-reply the visitor receives.
// Both render through one shared shell (renderShell) so they share the site's
// editorial register exactly: warm cream card, single clay accent, serif heading,
// hairline rules — a quiet notification, never a marketing layout.
//
// Two layers of sanitization keep untrusted input safe:
//   • sanitizeHeader() strips control characters from values that land in mail
//     headers (the subject) — defence-in-depth against header injection.
//   • escapeHtml() escapes every value interpolated into the HTML body.
// Inline styles + presentation tables only (email clients strip <style>/external CSS
// and ignore CSS variables); `color-scheme: light` keeps the warm light palette from
// being auto-inverted by dark-mode clients. Copy is French.

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

/** Subject + plain-text + HTML for one message (the routing/headers live in the route). */
export type EmailContent = {
  subject: string;
  text: string;
  html: string;
};

/**
 * The shared email document — masthead (brand eyebrow + serif heading + optional
 * intro), a content slot of `<tr>` sections, and the brand footer. Callers pass
 * already-escaped HTML for `content`, `intro`, and `footerNote`.
 */
function renderShell(opts: {
  preheader: string;
  heading: string;
  intro?: string;
  content: string;
  footerNote?: string;
}): string {
  const intro = opts.intro
    ? `<p style="margin:8px 0 0;font-size:13px;color:${COLOR.muted};">${opts.intro}</p>`
    : "";
  const footerNote = opts.footerNote ? `<br>${opts.footerNote}` : "";

  return `<!DOCTYPE html>
<html lang="fr">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="color-scheme" content="light">
    <meta name="supported-color-schemes" content="light">
    <title>${opts.heading} · ${BRAND}</title>
  </head>
  <body style="margin:0;padding:0;background:${COLOR.sand};font-family:${SANS};-webkit-font-smoothing:antialiased;">
    <div style="display:none;max-height:0;overflow:hidden;opacity:0;mso-hide:all;">${opts.preheader}</div>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${COLOR.sand};">
      <tr>
        <td align="center" style="padding:40px 16px;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:${COLOR.paper};border:1px solid ${COLOR.line};border-radius:10px;">
            <tr>
              <td style="padding:32px 36px 0;">
                <p style="margin:0;font-size:11px;letter-spacing:0.16em;text-transform:uppercase;color:${COLOR.clay};">${BRAND}</p>
                <h1 style="margin:14px 0 0;font-family:${SERIF};font-size:23px;font-weight:400;line-height:1.3;color:${COLOR.ink};">${opts.heading}</h1>
                ${intro}
              </td>
            </tr>
            ${opts.content}
            <tr>
              <td style="padding:30px 36px 34px;">
                <hr style="border:none;border-top:1px solid ${COLOR.line};margin:0 0 14px;">
                <p style="margin:0;font-size:12px;line-height:1.6;color:${COLOR.muted};">
                  ${BRAND} · ${BRAND_TAGLINE}${footerNote}
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

// ── Owner notification ────────────────────────────────────────────────────────

/** The inquiry the photographer receives. Reply-To (set by the route) is the visitor. */
export function buildOwnerNotification(data: ValidContact): EmailContent {
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

  const eName = escapeHtml(name);
  const eEmail = escapeHtml(email);
  const eOccasion = escapeHtml(occasion);
  const eMessage = escapeHtml(message).replace(/\r?\n/g, "<br>");

  const row = (label: string, value: string) => `
                  <tr>
                    <td style="padding:7px 0;font-size:12px;letter-spacing:0.04em;color:${COLOR.muted};width:130px;vertical-align:top;">${label}</td>
                    <td style="padding:7px 0;font-size:15px;line-height:1.5;color:${COLOR.ink};">${value}</td>
                  </tr>`;

  const content = `
            <tr>
              <td style="padding:22px 36px 0;">
                <hr style="border:none;border-top:1px solid ${COLOR.line};margin:0 0 4px;">
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                  ${row("Nom", eName)}
                  ${row("E-mail", `<a href="mailto:${eEmail}" style="color:${COLOR.clay};text-decoration:none;">${eEmail}</a>`)}
                  ${row("Type de séance", eOccasion)}
                </table>
              </td>
            </tr>
            <tr>
              <td style="padding:22px 36px 0;">
                <p style="margin:0 0 10px;font-size:12px;letter-spacing:0.04em;text-transform:uppercase;color:${COLOR.muted};">Message</p>
                <div style="border-left:2px solid ${COLOR.clay};padding:2px 0 2px 18px;font-size:15px;line-height:1.65;color:${COLOR.ink};">${eMessage}</div>
              </td>
            </tr>
            <tr>
              <td style="padding:26px 36px 0;">
                <a href="mailto:${eEmail}" style="font-size:15px;color:${COLOR.ink};text-decoration:none;">
                  <span style="text-decoration:underline;text-decoration-color:${COLOR.clay};text-underline-offset:3px;">Répondre à ${eName}</span>
                  <span style="color:${COLOR.clay};">&nbsp;&rarr;</span>
                </a>
              </td>
            </tr>`;

  const html = renderShell({
    preheader: `${eName} · ${eOccasion}`,
    heading: "Nouvelle demande de contact",
    intro: "Reçue via le formulaire du site.",
    content,
    footerNote: `Vous pouvez aussi répondre directement à cet e-mail — il revient à ${eName}.`,
  });

  return { subject, text, html };
}

// ── Visitor confirmation ──────────────────────────────────────────────────────

/**
 * The courteous auto-reply the visitor receives after the owner notification has
 * been delivered. Reply-To (set by the route) is the owner inbox, so a reply to this
 * message reaches the photographer. First-person, in the site's warm voice.
 */
export function buildVisitorConfirmation(data: ValidContact): EmailContent {
  const name = sanitizeHeader(data.name);

  const subject = "Merci, votre message est bien arrivé";

  const text = [
    `Bonjour ${name},`,
    "",
    "Merci pour votre message. Je l'ai bien reçu.",
    "",
    "Je prendrai le temps de le lire et je vous répondrai dès que possible.",
    "",
    "Si vous souhaitez ajouter une précision concernant votre séance, vous pouvez simplement répondre à cet e-mail.",
    "",
    "À bientôt,",
    "Irina",
    "",
    `${BRAND} · ${BRAND_TAGLINE}`,
    "Vous recevez cet e-mail car vous avez utilisé le formulaire de contact du site.",
  ].join("\n");

  const eName = escapeHtml(name);
  const paragraph = (html: string) =>
    `<p style="margin:0 0 16px;font-size:15px;line-height:1.7;color:${COLOR.ink};">${html}</p>`;

  const content = `
            <tr>
              <td style="padding:24px 36px 0;">
                <hr style="border:none;border-top:1px solid ${COLOR.line};margin:0 0 22px;">
                ${paragraph(`Bonjour ${eName},`)}
                ${paragraph("Merci pour votre message. Je l'ai bien reçu.")}
                ${paragraph("Je prendrai le temps de le lire et je vous répondrai dès que possible.")}
                ${paragraph("Si vous souhaitez ajouter une précision concernant votre séance, vous pouvez simplement répondre à cet e-mail.")}
                <p style="margin:6px 0 0;font-size:15px;line-height:1.7;color:${COLOR.ink};">À bientôt,<br><span style="font-family:${SERIF};font-size:17px;">Irina</span></p>
              </td>
            </tr>`;

  const html = renderShell({
    preheader: "Merci pour votre message. Je l'ai bien reçu.",
    heading: "Merci pour votre message",
    content,
    footerNote: "Vous recevez cet e-mail car vous avez utilisé le formulaire de contact du site.",
  });

  return { subject, text, html };
}
