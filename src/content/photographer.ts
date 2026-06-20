// The single structured source of truth for the photographer's identity (sprint
// task 3). Nothing about the person is hardcoded inside components — pages and
// structured data read from here, so a future content update is one edit in one
// file. French is canonical (D008); a second locale wraps the string fields later
// without touching this shape.
//
// FILL BEFORE LAUNCH: every value marked `TODO(operator)` is a placeholder kept
// honest rather than invented (vault brand-voice: never fabricate biographical
// facts). The site renders correctly with the placeholders; it just reads as a
// draft until the real values land.

export type Photographer = {
  /** Personal name of the photographer. Empty until confirmed — never invented. */
  name: string;
  /** Business / brand name (already public). */
  brand: string;
  shortBrand: string;
  location: {
    city: string;
    region?: string;
    country: string;
    /** Display label, e.g. "Lyon, France". */
    label: string;
    /** TODO(operator): postal address — used for legal pages + LocalBusiness schema. */
    streetAddress?: string;
    postalCode?: string;
  };
  availability: {
    /** Where she is based. */
    base: string;
    /** Coverage area — already used in the homepage final CTA. */
    scope: string;
    /** One-line public availability note. */
    note: string;
  };
  /** The five genres she shoots (matches the gallery genres + contact occasions). */
  specialties: string[];
  /** First-person biography paragraphs. DRAFT — confirm wording with the photographer. */
  biography: string[];
  contact: {
    /** TODO(operator): real inbox — also the fallback channel on the contact page. */
    email: string;
    instagram: string;
    /** TODO(operator): public business phone, if she wants one listed. */
    phone?: string;
  };
};

export const photographer: Photographer = {
  // TODO(operator): insert the photographer's real personal name (e.g. "Olena Adamenko").
  // Left empty until confirmed; the UI hides the name gracefully while empty.
  name: "",
  brand: "Adamenko Photography",
  shortBrand: "Adamenko",
  location: {
    city: "Lyon",
    region: "Auvergne-Rhône-Alpes",
    country: "France",
    label: "Lyon, France",
    // TODO(operator): legally required on the Mentions légales page for a registered
    // business; may be a domiciliation address rather than a home address.
    streetAddress: undefined,
    postalCode: undefined,
  },
  availability: {
    base: "Lyon, France",
    scope: "À Lyon et partout dans le monde.",
    note: "Disponible pour des séances à Lyon, en France et à l'international.",
  },
  specialties: ["Famille", "Grossesse", "Couple", "Portrait", "Mariage"],
  // DRAFT placeholders in the brand voice (warm, plain, first person). Confirm every
  // line; replace with her real story before launch.
  biography: [
    "Je suis photographe à Lyon, et je travaille partout où l'on m'emmène.",
    "Je photographie les liens : une famille qui se serre, l'attente d'un enfant, deux personnes qui s'aiment. Des images douces et sincères, faites pour durer.",
    "Mon approche est simple : vous mettre à l'aise, puis disparaître — pour que les vraies images arrivent d'elles-mêmes.",
  ],
  contact: {
    // TODO(operator): real inbox. Until set, the contact page shows Instagram as the
    // fallback channel and the API route refuses to send (see app/api/contact).
    email: "",
    instagram: "https://www.instagram.com/adamenko_photography/",
    phone: undefined,
  },
};
