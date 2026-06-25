// The single structured source of truth for the photographer's identity (sprint
// task 3). Nothing about the person is hardcoded inside components — pages and
// structured data read from here, so a future content update is one edit in one
// file. French is canonical (D008); a second locale wraps the string fields later
// without touching this shape.
//
import type { GalleryImage } from "@/types/gallery";

// 2026-06-24 — confirmed business facts supplied by the operator + recovered from
// the photographer's OWN previous website (github.com/antonmokryi/photographiAdamenko)
// were ingested here: real personal name, professional e-mail, legal address, and a
// biography grounded in her own words (durable facts only — no dating figures, which
// would now be stale). Items still marked `TODO(operator)` are genuine unknowns kept
// honest rather than invented (vault brand-voice: never fabricate biographical facts).

export type Photographer = {
  /** Personal name of the photographer (confirmed 2026-06-24). */
  name: string;
  /** Full legal name as registered (birth name in parentheses) — used on legal pages. */
  legalName: string;
  /** Business / brand name (already public). */
  brand: string;
  shortBrand: string;
  location: {
    city: string;
    region?: string;
    country: string;
    /** Display label, e.g. "Lyon, France". */
    label: string;
    /** Postal address — used for legal pages + LocalBusiness schema. */
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
  /** Portrait of the photographer (her own published image) — about page + Person schema. */
  portrait?: GalleryImage;
  contact: {
    /** Real inbox (confirmed) — also the fallback channel on the contact page. */
    email: string;
    instagram: string;
    /** Personal Instagram (study/secondary — not surfaced as a business channel). */
    personalInstagram?: string;
    facebook?: string;
    telegram?: string;
    /** TODO(operator): public business phone, if she wants one listed. */
    phone?: string;
  };
};

export const photographer: Photographer = {
  // Confirmed 2026-06-24. Public-facing personal name; the registered birth name
  // (Sereda) is carried in `legalName` for the mentions légales only.
  name: "Irina Adamenko",
  legalName: "Irina Adamenko (Sereda)",
  brand: "Adamenko Photography",
  shortBrand: "Adamenko",
  location: {
    city: "Lyon",
    region: "Auvergne-Rhône-Alpes",
    country: "France",
    label: "Lyon, France",
    // Confirmed 2026-06-24 (SIREN/INSEE). This is the registered establishment
    // address; it is the legally required éditeur address on the Mentions légales.
    streetAddress: "Bât. 1, 173 avenue Barthélemy Buyer",
    postalCode: "69005",
  },
  availability: {
    base: "Lyon, France",
    scope: "À Lyon et partout dans le monde.",
    note: "Disponible pour des séances à Lyon, en France et à l'international.",
  },
  specialties: ["Famille", "Grossesse", "Couple", "Portrait", "Mariage"],
  // DRAFT (2026-06-24) — rewritten from the photographer's OWN words on her previous
  // site, keeping only DURABLE facts (Ukrainian; based in Lyon; trained in law, then
  // photography; mother of three; documentary, minimal-posing approach). The original
  // dating figures ("il y a 8 ans", "depuis près de deux ans") were dropped because
  // they are now stale and would be fabrication if guessed. Confirm with her, then
  // optionally restore a current timeframe. Stays warm, plain, first person.
  biography: [
    "Je m'appelle Irina. Je suis photographe de famille à Lyon, et je travaille partout où l'on m'emmène, en France comme ailleurs en Europe.",
    "Je suis ukrainienne ; j'ai posé mes valises à Lyon avec ma famille. Avocate de formation, je suis venue à la photographie presque par hasard, puis je n'ai plus pu m'en passer.",
    "Je suis maman de trois enfants. Les journées avec des tout-petits, les fous rires et les imprévus, je connais : c'est souvent là que se cachent les plus belles images.",
    "J'aime photographier la vie telle qu'elle est. Avec moi, pas de regard figé vers l'objectif : je vous guide par quelques gestes simples, puis je m'efface. Ce qui m'intéresse, ce sont les vrais moments : un sourire, un câlin, un jeu, les petits rituels du quotidien.",
    "Mon travail, au fond, c'est de vous rendre ces instants tels que vous les avez vécus : des images douces et sincères, faites pour vivre avec vous et se transmettre.",
  ],
  // Her own published portrait (B&W, with a film camera) — recovered from her previous
  // site (operator-authorized). 4:5 frame on the about page; crops gently from 2:3.
  portrait: {
    src: "/about/portrait-irina.jpg",
    width: 853,
    height: 1198,
    ratio: "aspect-[4/5]",
    alt: "Irina Adamenko, photographe à Lyon, un appareil photo argentique entre les mains.",
  },
  contact: {
    // Confirmed 2026-06-24. Drives the contact-form fallback link + the API From/To.
    email: "adamenkoiu@gmail.com",
    instagram: "https://www.instagram.com/adamenko_photography/",
    personalInstagram: "https://www.instagram.com/sereduha/",
    facebook: "https://www.facebook.com/profile.php?id=100011367545612",
    // Recovered from the previous site's contact block — an active channel she used.
    telegram: "https://t.me/AdamenkoIr",
    phone: undefined,
  },
};
