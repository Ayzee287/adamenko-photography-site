// Shared contact-form contract (sprint task 1). The session types and validation
// live here so the client form and the server route can never disagree — the select
// options and the server-side enum are the SAME source.

export const CONTACT_OCCASIONS = [
  "Famille",
  "Grossesse",
  "Couple",
  "Portrait",
  "Mariage",
] as const;
export type ContactOccasion = (typeof CONTACT_OCCASIONS)[number];

export type ContactErrorField = "name" | "email" | "occasion" | "message";

export type ContactInput = {
  name?: string;
  email?: string;
  occasion?: string;
  message?: string;
  /** Honeypot — must be empty for a human submission. */
  company?: string;
  /** Locale the form was submitted from ("fr" | "en"); selects the confirmation language. */
  locale?: string;
};

export type ValidContact = {
  name: string;
  email: string;
  occasion: ContactOccasion;
  message: string;
};

// Deliberately strict but permissive enough for real names/messages. The server is
// the source of truth; the browser's `required`/`type=email` is only a first pass.
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const LIMITS = { name: [2, 100], email: [5, 200], message: [10, 5000] } as const;

export function validateContact(
  input: ContactInput,
):
  | { ok: true; data: ValidContact }
  | { ok: false; fields: ContactErrorField[] } {
  const name = (input.name ?? "").trim();
  const email = (input.email ?? "").trim();
  const occasion = (input.occasion ?? "").trim();
  const message = (input.message ?? "").trim();

  const fields: ContactErrorField[] = [];
  if (name.length < LIMITS.name[0] || name.length > LIMITS.name[1])
    fields.push("name");
  if (
    !EMAIL_RE.test(email) ||
    email.length < LIMITS.email[0] ||
    email.length > LIMITS.email[1]
  )
    fields.push("email");
  if (!CONTACT_OCCASIONS.includes(occasion as ContactOccasion))
    fields.push("occasion");
  if (
    message.length < LIMITS.message[0] ||
    message.length > LIMITS.message[1]
  )
    fields.push("message");

  if (fields.length) return { ok: false, fields };
  return {
    ok: true,
    data: { name, email, occasion: occasion as ContactOccasion, message },
  };
}

/** True when the honeypot field was filled — treat as a bot, drop silently. */
export function isBot(input: ContactInput): boolean {
  return Boolean(input.company && input.company.trim() !== "");
}
