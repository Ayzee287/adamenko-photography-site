// Contact channels model (real-content launch pass). A structured list derived from
// the single identity model, so the contact page, footer, and structured data can
// all render the same channels without hardcoding. A channel with an empty value is
// considered not-yet-available and is filtered out by consumers (e.g. the email is
// hidden until the operator sets it).

import { photographer } from "@/content/photographer";

export type ContactChannel = {
  id: "email" | "instagram" | "phone" | "form";
  label: string;
  /** Display value (may be empty until provided). */
  value: string;
  /** Link target (mailto:/tel:/https:/route). Empty when the channel isn't ready. */
  href: string;
  external: boolean;
};

const { contact } = photographer;

export const contactChannels = {
  /** Public promise reused near the form. */
  responseTime: "Je réponds sous quelques jours.",
  channels: [
    {
      id: "form",
      label: "Formulaire de contact",
      value: "Envoyer une demande",
      href: "/contact",
      external: false,
    },
    {
      id: "email",
      label: "E-mail",
      value: contact.email,
      href: contact.email ? `mailto:${contact.email}` : "",
      external: false,
    },
    {
      id: "phone",
      label: "Téléphone",
      value: contact.phone ?? "",
      href: contact.phone ? `tel:${contact.phone.replace(/\s+/g, "")}` : "",
      external: false,
    },
    {
      id: "instagram",
      label: "Instagram",
      value: "@adamenko_photography",
      href: contact.instagram,
      external: true,
    },
  ] satisfies ContactChannel[],
} as const;

/** Only the channels that are actually available right now (non-empty href). */
export function availableChannels(): ContactChannel[] {
  return contactChannels.channels.filter((c) => c.href !== "");
}
