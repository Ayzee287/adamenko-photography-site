import { getDictionary } from "@/lib/dictionary";
import { link } from "@/lib/routes";
import { siteUrl } from "@/lib/site";
import type { ValidContact } from "@/lib/contact";

// The two inquiry emails, both built from an already-validated submission:
//   • buildOwnerNotification — what the photographer receives (the inquiry).
//   • buildVisitorConfirmation — the courteous auto-reply the visitor receives.
// Both render through one shared shell (renderShell) so they carry the site's identity
// exactly.
//
// ── The art direction is CHAMBRE, the site's own ──────────────────────────────
// These messages used to be a cream card with a clay accent, mirroring V1's
// globals.css — a stylesheet tokens.css now marks inert ("V1's globals.css/motion.css
// are inert (superseded, unimported)"). The live site is the darkroom: obsidian page,
// bone type, ash secondary, one ember safelight, hairline rules, a mono cartel over a
// serif title, and prints that are never rounded. The palette below is those exact
// token values, read off chambre.css rather than reinterpreted.
//
// Translated for email, not copied into it:
//   • the ember is the site's accent AS TEXT here, because it can be: measured on the
//     obsidian card it is 5.23:1 (AA). On the old cream it was 3.64:1, which is why the
//     previous design needed a separate darkened variant for anything readable;
//   • CTAs become bordered, table-built targets ≥44px rather than a hover-drawn rule;
//   • the owner's inquiry facts stack (mono label over value) instead of sitting in a
//     two-column table — the same shape as the site's spec lists, and it cannot collapse;
//   • no photograph: these must read identically with images disabled, and the identity
//     is carried by palette, cartel, serif and rule — exactly as the site chrome does it.
//
// Client robustness: inline styles + presentation tables only (no <style>, no classes,
// no CSS variables — clients strip all three), `bgcolor` beside every background-color
// for Outlook's Word engine, an MSO ghost table so Outlook honours the 560px measure,
// `mso-line-height-rule:exactly` on every leaded block, and `color-scheme: dark` so a
// dark-mode client leaves a deliberately dark design alone instead of inverting it.
//
// Two layers of sanitization keep untrusted input safe:
//   • sanitizeHeader() strips control characters from values that land in mail
//     headers (the subject) — defence-in-depth against header injection.
//   • escapeHtml() escapes every value interpolated into the HTML body.

const BRAND = "Adamenko Photography";

/** CHAMBRE, read off `body:has([data-chambre])` + `:root` in src/styles/chambre.css. */
const COLOR = {
  /** --surface-base — obsidian, a warm near-black (never #000). */
  page: "#0a0908",
  /** --surface-deep — the mat the print is laid on. */
  card: "#0e0c0b",
  /** --content-primary — bone, warm film-paper white. 15.7:1 on the card. */
  bone: "#ede6da",
  /** --content-secondary — ash. 5.2:1 on the card. */
  ash: "#8b837a",
  /**
   * --ch-ember — the darkroom safelight. On the site it is LIGHT, never a fill, and it
   * stays that way here: rules, the § mark, the arrow, and small type. 5.2:1 on the card,
   * so unlike V1's clay it needs no darkened twin to be readable.
   */
  ember: "#c86b3c",
  /** --border-hairline, rgba(237,230,218,0.11) flattened over the card (email needs hex). */
  hairline: "#272422",
  /** The same hairline at 0.22 over the page — a control edge, not a divider. */
  edge: "#3c3a36",
} as const;

// Web-safe stacks that echo the site's three voices without web fonts (Gmail drops
// @font-face): Fraunces → Georgia, the warm serif present on every platform; Inter →
// the system UI sans; and the CHAMBRE mono cartel, which every platform can already set.
const SANS = "-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif";
const SERIF = "Georgia,'Times New Roman',Times,serif";
const MONO = "'SFMono-Regular',Consolas,'Liberation Mono',Menlo,Courier,monospace";

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

/** One line of preview text: collapsed, trimmed to a length an inbox actually shows. */
function excerpt(value: string, max = 110): string {
  const flat = sanitizeHeader(value);
  return flat.length <= max ? flat : `${flat.slice(0, max - 1).trimEnd()}…`;
}

/**
 * A name short enough to sit inside a button. The CTA is mono, uppercase and letterspaced
 * — the site's own CTA scale — so a full name blows it apart: "Jean-Éric
 * <script>alert(1)</script> \"Bob\" & fils" wrapped to three lines and stopped reading as a
 * control at all. The first word is what a person is called anyway, and the message above
 * still shows the name in full.
 */
function shortName(value: string, max = 18): string {
  const first = sanitizeHeader(value).split(" ")[0] ?? "";
  return first.length > max ? first.slice(0, max) : first;
}

/** Subject + plain-text + HTML for one message (the routing/headers live in the action). */
export type EmailContent = {
  subject: string;
  text: string;
  html: string;
};

/** Locales with a hand-written (never machine-translated) visitor confirmation. */
export type ConfirmationLocale = "fr" | "en";

/**
 * The site's own footer tagline, for the locale being written — so the line the emails
 * sign off with is the line the website signs off with, and neither can drift. Previously
 * hardcoded here in a third wording that existed nowhere on the site.
 */
function brandTagline(locale: ConfirmationLocale): string {
  return getDictionary(locale).copy.footer.tagline;
}

/**
 * Absolute URL for a site page, or "" when no real origin is configured. A transactional
 * email must never ship a `http://localhost:3000` link, so an unset NEXT_PUBLIC_SITE_URL
 * simply drops the link rather than sending a broken one.
 */
function siteLink(locale: ConfirmationLocale, page: "home" | "galeries"): string {
  if (siteUrl.hostname === "localhost" || siteUrl.hostname === "127.0.0.1") return "";
  return new URL(link(locale, { page }), siteUrl).toString();
}

// ── Shared pieces ─────────────────────────────────────────────────────────────

/** A hairline rule. A <td> and not an <hr>: Outlook styles <hr> with a mind of its own. */
function rule(color: string = COLOR.hairline): string {
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;"><tr><td height="1" bgcolor="${color}" style="height:1px;line-height:1px;font-size:1px;background-color:${color};">&nbsp;</td></tr></table>`;
}

/** The mono cartel — the site's kicker: an ember mark, then letterspaced uppercase ash. */
function cartel(text: string, mark = "&sect;"): string {
  return `<p style="margin:0;font-family:${MONO};font-size:11px;letter-spacing:0.2em;text-transform:uppercase;color:${COLOR.ash};line-height:1.5;mso-line-height-rule:exactly;"><span style="color:${COLOR.ember};">${mark}</span>&nbsp;&nbsp;${text}</p>`;
}

/** Body copy — the site's reading register, at an email's larger minimum size. */
function paragraph(html: string, color: string = COLOR.bone): string {
  return `<p style="margin:0 0 16px;font-family:${SANS};font-size:16px;line-height:1.7;color:${color};mso-line-height-rule:exactly;">${html}</p>`;
}

/**
 * The CTA — `.ch-go` translated: mono, uppercase, letterspaced, bone, ember arrow. On the
 * site a hairline wipes in under it on hover; email has no hover, so the border is drawn at
 * rest and the whole thing is a ≥44px table-built target that works with images off.
 */
function cta(href: string, label: string): string {
  return `<table role="presentation" cellpadding="0" cellspacing="0" style="border-collapse:separate;"><tr><td bgcolor="${COLOR.page}" style="background-color:${COLOR.page};border:1px solid ${COLOR.edge};padding:15px 24px;"><a href="${href}" style="display:inline-block;font-family:${MONO};font-size:11px;letter-spacing:0.16em;text-transform:uppercase;color:${COLOR.bone};text-decoration:none;line-height:1;mso-line-height-rule:exactly;">${label}&nbsp;&nbsp;<span style="color:${COLOR.ember};">&rarr;</span></a></td></tr></table>`;
}

/**
 * The shared email document — obsidian page, a hairline-framed mat, a mono cartel over a
 * serif title, a content slot of `<tr>` sections, and the brand footer. Callers pass
 * already-escaped HTML for `content`, `intro` and `footerNote`.
 */
function renderShell(opts: {
  preheader: string;
  heading: string;
  intro?: string;
  content: string;
  footerNote?: string;
  /** Document language for `<html lang>`. Defaults to French (owner notification). */
  lang?: ConfirmationLocale;
}): string {
  const lang = opts.lang ?? "fr";
  const tagline = brandTagline(lang);
  const home = siteLink(lang, "home");

  const intro = opts.intro
    ? `<p style="margin:14px 0 0;font-family:${SANS};font-size:15px;line-height:1.6;color:${COLOR.ash};mso-line-height-rule:exactly;">${opts.intro}</p>`
    : "";

  const footerNote = opts.footerNote
    ? `<p style="margin:12px 0 0;font-family:${SANS};font-size:13px;line-height:1.6;color:${COLOR.ash};mso-line-height-rule:exactly;">${opts.footerNote}</p>`
    : "";

  // The wordmark links home when there is a real origin to link to; otherwise it is plain
  // text, never a dead or localhost href.
  const wordmark = home
    ? `<a href="${home}" style="color:${COLOR.bone};text-decoration:none;">${BRAND}</a>`
    : BRAND;

  // Preview-text padding: without it clients pull the first body words into the inbox
  // preview after the preheader. Zero-width joiners are invisible and never render.
  const previewPad = "&#847;&zwnj;&nbsp;".repeat(30);

  return `<!DOCTYPE html>
<html lang="${lang}">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="color-scheme" content="dark">
    <meta name="supported-color-schemes" content="dark">
    <title>${opts.heading} · ${BRAND}</title>
  </head>
  <body style="margin:0;padding:0;background-color:${COLOR.page};color:${COLOR.bone};font-family:${SANS};-webkit-font-smoothing:antialiased;">
    <div style="display:none;max-height:0;overflow:hidden;opacity:0;mso-hide:all;">${opts.preheader}${previewPad}</div>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" bgcolor="${COLOR.page}" style="background-color:${COLOR.page};border-collapse:collapse;">
      <tr>
        <td align="center" style="padding:32px 16px 44px;">
          <!--[if mso]><table role="presentation" width="560" align="center" cellpadding="0" cellspacing="0"><tr><td><![endif]-->
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" bgcolor="${COLOR.card}" style="max-width:560px;background-color:${COLOR.card};border:1px solid ${COLOR.hairline};border-collapse:collapse;">
            <tr>
              <td style="padding:34px 32px 0;">
                ${cartel(BRAND)}
                <h1 style="margin:20px 0 0;font-family:${SERIF};font-size:26px;font-weight:400;line-height:1.25;letter-spacing:-0.01em;color:${COLOR.bone};mso-line-height-rule:exactly;">${opts.heading}</h1>
                ${intro}
              </td>
            </tr>
            ${opts.content}
            <tr>
              <td style="padding:34px 32px 34px;">
                ${rule()}
                <p style="margin:18px 0 0;font-family:${MONO};font-size:11px;letter-spacing:0.18em;text-transform:uppercase;color:${COLOR.bone};line-height:1.5;mso-line-height-rule:exactly;">${wordmark}</p>
                <p style="margin:8px 0 0;font-family:${SANS};font-size:13px;line-height:1.6;color:${COLOR.ash};mso-line-height-rule:exactly;">${tagline}</p>
                ${footerNote}
              </td>
            </tr>
          </table>
          <!--[if mso]></td></tr></table><![endif]-->
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

// ── Owner notification ────────────────────────────────────────────────────────

/** The inquiry the photographer receives. Reply-To (set by the action) is the visitor. */
export function buildOwnerNotification(
  data: ValidContact & { period?: string; place?: string; source?: string },
): EmailContent {
  const name = sanitizeHeader(data.name);
  const occasion = sanitizeHeader(data.occasion);
  const email = data.email.trim();
  const message = data.message.trim();
  const period = sanitizeHeader(data.period ?? "");
  const place = sanitizeHeader(data.place ?? "");
  const source = sanitizeHeader(data.source ?? "");

  const subject = `Nouvelle demande · ${occasion} · ${name}`;

  const text = [
    `Nouvelle demande depuis le site ${BRAND}`,
    "",
    `Nom : ${name}`,
    `E-mail : ${email}`,
    `Type de séance : ${occasion}`,
    ...(period ? [`Période envisagée : ${period}`] : []),
    ...(place ? [`Lieu : ${place}`] : []),
    ...(source ? [`Vous a trouvée via : ${source}`] : []),
    "",
    "Message :",
    message,
    "",
    "—",
    `${BRAND} · ${brandTagline("fr")}`,
    `Répondez directement à cet e-mail pour écrire à ${name}.`,
  ].join("\n");

  const eName = escapeHtml(name);
  const eShort = escapeHtml(shortName(name));
  const eEmail = escapeHtml(email);
  const eOccasion = escapeHtml(occasion);
  const eMessage = escapeHtml(message).replace(/\r?\n/g, "<br>");

  // Label ABOVE value, not beside it. The old two-column row declared a 130px label column
  // that a long email address won back on a phone (measured: 71px), wrapping "Vous a
  // trouvée via" onto two lines with the value floating between them. Stacked, there is no
  // width to negotiate — and it is the shape the site's own spec lists already use.
  const fact = (label: string, value: string) => `
                <p style="margin:0 0 5px;font-family:${MONO};font-size:10px;letter-spacing:0.18em;text-transform:uppercase;color:${COLOR.ash};line-height:1.5;mso-line-height-rule:exactly;">${label}</p>
                <p style="margin:0 0 20px;font-family:${SANS};font-size:16px;line-height:1.5;color:${COLOR.bone};mso-line-height-rule:exactly;word-wrap:break-word;overflow-wrap:anywhere;">${value}</p>`;
  const optFact = (label: string, value: string) =>
    value ? fact(label, escapeHtml(value)) : "";

  const content = `
            <tr>
              <td style="padding:30px 32px 0;">
                ${rule()}
              </td>
            </tr>
            <tr>
              <td style="padding:26px 32px 0;">
                ${fact("Nom", eName)}
                ${fact("E-mail", `<a href="mailto:${eEmail}" style="color:${COLOR.ember};text-decoration:none;">${eEmail}</a>`)}
                ${fact("Type de séance", eOccasion)}
                ${optFact("Période envisagée", period)}
                ${optFact("Lieu", place)}
                ${optFact("Vous a trouvée via", source)}
              </td>
            </tr>
            <tr>
              <td style="padding:24px 32px 0;">
                <p style="margin:0 0 12px;font-family:${MONO};font-size:10px;letter-spacing:0.18em;text-transform:uppercase;color:${COLOR.ash};line-height:1.5;mso-line-height-rule:exactly;">Message</p>
                <!-- The message is the one place untrusted free text lands, and a visitor
                     pasting a long unbroken token (a URL with no hyphens, a hashtag) has no
                     break opportunity: the cell grows and the card stops fitting a phone.
                     Measured with a 62-character word, the layout viewport widened from 360
                     to 607px. Both spellings are set on purpose: word-wrap is the legacy
                     property Outlook honours, overflow-wrap the modern one. -->
                <div style="border-left:2px solid ${COLOR.ember};padding:2px 0 2px 18px;font-family:${SANS};font-size:16px;line-height:1.7;color:${COLOR.bone};mso-line-height-rule:exactly;word-wrap:break-word;overflow-wrap:anywhere;">${eMessage}</div>
              </td>
            </tr>
            <tr>
              <td style="padding:30px 32px 0;">
                ${cta(`mailto:${eEmail}`, eShort ? `Répondre à ${eShort}` : "Répondre")}
              </td>
            </tr>`;

  const html = renderShell({
    // The subject already carries the name and the occasion; repeating them in the preview
    // wasted the one line an inbox gives you. The message's opening words are what actually
    // tells her whether this needs answering now.
    preheader: escapeHtml(excerpt(message)),
    heading: "Nouvelle demande de contact",
    intro: "Reçue via le formulaire du site.",
    content,
    footerNote: `Répondez directement à cet e-mail — il revient à ${eName}.`,
  });

  return { subject, text, html };
}

// ── Visitor confirmation ──────────────────────────────────────────────────────

// Native copy per locale. Layout, spacing, typography and branding are identical
// (shared `renderShell`); only the words and the `<html lang>` differ, and the footer
// tagline comes from that locale's own site dictionary. Each locale is authored by hand —
// no automatic translation. The owner notification is unaffected (always French).
//
// Every promise here is one the site already makes: a personal reply "dès que possible"
// (faq.ts), and replying to this email to add a detail. No turnaround, price or policy is
// stated that the site does not state.
const VISITOR_CONFIRMATION: Record<
  ConfirmationLocale,
  {
    subject: string;
    heading: string;
    /** Inbox preview — must ADD to the subject, never restate it. */
    preheader: string;
    /** Greeting line, given the visitor's (sanitised) name. */
    greeting: (name: string) => string;
    /** Static body paragraphs, in order. */
    body: readonly string[];
    signoff: string;
    signature: string;
    footerNote: string;
    /** Label for the quiet link back to the work. */
    ctaLabel: string;
  }
> = {
  fr: {
    subject: "Merci, votre message est bien arrivé",
    heading: "Votre message est bien arrivé",
    preheader: "Je vous réponds personnellement dès que possible.",
    greeting: (name) => `Bonjour ${name},`,
    body: [
      "Merci de m'avoir écrit — votre message m'est bien parvenu.",
      "Je le lis avec attention et je vous réponds personnellement dès que possible.",
      "Si vous souhaitez ajouter une précision sur votre projet — une date, un lieu, une idée — répondez simplement à cet e-mail.",
    ],
    signoff: "À très bientôt,",
    signature: "Irina",
    footerNote:
      "Vous recevez cet e-mail car vous avez utilisé le formulaire de contact du site.",
    ctaLabel: "Voir les galeries",
  },
  en: {
    subject: "Thank you for your message",
    heading: "Your message has arrived",
    preheader: "I'll reply to you personally as soon as I can.",
    greeting: (name) => `Hello ${name},`,
    body: [
      "Thank you for writing — your message has reached me.",
      "I read every one properly, and I'll reply to you personally as soon as I can.",
      "If you'd like to add anything about your plans — a date, a place, an idea — simply reply to this email.",
    ],
    signoff: "Speak soon,",
    signature: "Irina",
    footerNote:
      "You are receiving this email because you submitted the contact form on the website.",
    ctaLabel: "See the galleries",
  },
};

/**
 * The courteous auto-reply the visitor receives after the owner notification has
 * been delivered. Reply-To (set by the action) is the owner inbox, so a reply to this
 * message reaches the photographer. Copy is the native, hand-written text for the
 * locale the form was submitted from (never machine-translated); defaults to French.
 */
export function buildVisitorConfirmation(
  data: ValidContact,
  locale: ConfirmationLocale = "fr",
): EmailContent {
  const t = VISITOR_CONFIRMATION[locale] ?? VISITOR_CONFIRMATION.fr;
  const name = sanitizeHeader(data.name);
  const galleries = siteLink(locale, "galeries");

  const lines: string[] = [t.greeting(name), ""];
  for (const p of t.body) lines.push(p, "");
  lines.push(t.signoff, t.signature, "");
  // French puts a space before a colon; English does not. The plain-text part is read by
  // people, so it follows the typography of the language it is written in.
  if (galleries) lines.push(`${t.ctaLabel}${locale === "fr" ? " :" : ":"} ${galleries}`, "");
  lines.push(`${BRAND} · ${brandTagline(locale)}`, t.footerNote);
  const text = lines.join("\n");

  const eName = escapeHtml(name);

  // Static body copy carries no HTML-special characters; only the visitor name is escaped.
  const bodyHtml = t.body.map((p) => paragraph(p)).join("\n                ");

  // One quiet way back to the work while she writes. Not a marketing block: a single
  // link, in the site's own CTA language, and it disappears entirely when no real origin
  // is configured rather than shipping a dead URL.
  const ctaRow = galleries
    ? `
            <tr>
              <td style="padding:32px 32px 0;">
                ${cta(galleries, t.ctaLabel)}
              </td>
            </tr>`
    : "";

  const content = `
            <tr>
              <td style="padding:30px 32px 0;">
                ${rule()}
              </td>
            </tr>
            <tr>
              <td style="padding:26px 32px 0;">
                ${paragraph(t.greeting(eName))}
                ${bodyHtml}
                <p style="margin:26px 0 0;font-family:${SANS};font-size:16px;line-height:1.7;color:${COLOR.ash};mso-line-height-rule:exactly;">${t.signoff}</p>
                <p style="margin:6px 0 0;font-family:${SERIF};font-size:20px;line-height:1.3;color:${COLOR.bone};mso-line-height-rule:exactly;">${t.signature}</p>
              </td>
            </tr>${ctaRow}`;

  const html = renderShell({
    lang: locale,
    preheader: t.preheader,
    heading: t.heading,
    content,
    footerNote: t.footerNote,
  });

  return { subject: t.subject, text, html };
}
