// Legal pages content (sprint task 2). In France a published site MUST carry des
// mentions légales (LCEN, art. 6-III) and, since this site collects personal data
// (contact form + audience analytics), une information RGPD. The RGPD notice is
// integrated into the Politique de confidentialité — the standard, non-redundant
// French practice — with its own clearly-labelled "Vos droits (RGPD)" section.
//
// Everything an operator must confirm is wrapped in `[À COMPLÉTER : …]` IN THE
// VISIBLE TEXT and flagged with a TODO(operator) comment, so a draft is obvious on
// screen and in code. The factual processor/host details (Vercel, Resend) are
// filled in because they are knowable today. Confirm all of it with the business
// owner — and, ideally, a French legal professional — before launch.

import { photographer } from "@/content/photographer";

// Confirmed business facts (2026-06-24, operator + INSEE/SIREN). The éditeur block
// below now renders real values; only the items a French legal professional should
// still verify (TVA regime, data-retention period) remain flagged.
const SIRET = "979 493 327 00014";
const APE = "74.20Z";
// EI photographers are almost always under the franchise en base de TVA; this is the
// legally required mention in that case. TODO(operator): confirm — if she is
// VAT-registered, replace with the intra-EU VAT number instead.
const TVA_MENTION = "TVA non applicable, art. 293 B du CGI";

export type LegalSection = {
  heading: string;
  paragraphs?: string[];
  bullets?: string[];
};

export type LegalDocument = {
  eyebrow: string;
  title: string;
  intro?: string;
  updated: string;
  sections: LegalSection[];
};

// TODO(operator): set to the date these pages are last reviewed/published.
const UPDATED = "Dernière mise à jour : juin 2026.";

const brand = photographer.brand;
const cityCountry = photographer.location.label;

export const mentionsLegales: LegalDocument = {
  eyebrow: "Informations légales",
  title: "Mentions légales",
  intro:
    "Conformément à la loi pour la confiance dans l'économie numérique (LCEN), voici les informations relatives à l'éditeur et à l'hébergeur de ce site.",
  updated: UPDATED,
  sections: [
    {
      heading: "Éditeur du site",
      paragraphs: [
        `${brand}, ${photographer.legalName}, entrepreneur individuel (EI).`,
        `Siège de l'activité : ${photographer.location.streetAddress}, ${photographer.location.postalCode} ${photographer.location.city}, ${photographer.location.country}.`,
        `Activité : activités photographiques (code APE ${APE}).`,
        `SIRET : ${SIRET}. ${TVA_MENTION}.`,
        photographer.contact.email
          ? `Contact : ${photographer.contact.email}.`
          : "Contact : [À COMPLÉTER : adresse e-mail professionnelle].",
      ],
    },
    {
      heading: "Directeur de la publication",
      paragraphs: [
        // TODO(operator): usually the photographer herself.
        photographer.name
          ? photographer.name
          : "[À COMPLÉTER : nom du directeur / de la directrice de la publication].",
      ],
    },
    {
      heading: "Hébergeur",
      paragraphs: [
        "Le site est hébergé par Vercel Inc.",
        "440 N Barranca Ave #4133, Covina, CA 91723, États-Unis.",
        "https://vercel.com",
      ],
    },
    {
      heading: "Propriété intellectuelle",
      paragraphs: [
        `L'ensemble des photographies présentées sur ce site est la propriété exclusive de ${brand} et est protégé par le droit d'auteur (Code de la propriété intellectuelle). Toute reproduction, représentation, modification ou diffusion, totale ou partielle, sans autorisation écrite préalable, est interdite.`,
        "Les textes, la mise en page et les éléments graphiques du site sont également protégés.",
      ],
    },
    {
      heading: "Droit à l'image",
      paragraphs: [
        "Les images des personnes photographiées ne sont publiées qu'avec leur consentement. Toute personne souhaitant le retrait d'une image la concernant peut en faire la demande via la page de contact.",
      ],
    },
    {
      heading: "Crédits",
      paragraphs: [
        `Photographies : © ${brand}. Conception et développement du site : [À COMPLÉTER si vous souhaitez créditer un prestataire].`,
      ],
    },
  ],
};

export const confidentialite: LegalDocument = {
  eyebrow: "Données personnelles",
  title: "Politique de confidentialité",
  intro:
    "Cette page explique quelles données personnelles sont collectées via ce site, pourquoi, et quels sont vos droits au titre du Règlement général sur la protection des données (RGPD).",
  updated: UPDATED,
  sections: [
    {
      heading: "Responsable du traitement",
      paragraphs: [
        photographer.name
          ? `${photographer.name}, ${brand}, ${cityCountry}.`
          : `${brand}, ${cityCountry}. [À COMPLÉTER : nom du responsable du traitement].`,
        photographer.contact.email
          ? `Pour toute question relative à vos données : ${photographer.contact.email}.`
          : "Pour toute question relative à vos données : [À COMPLÉTER : adresse e-mail].",
      ],
    },
    {
      heading: "Données collectées et finalités",
      paragraphs: [
        "Deux traitements seulement ont lieu sur ce site :",
      ],
      bullets: [
        "Formulaire de contact : votre nom, votre adresse e-mail, le type de séance et le message que vous envoyez. Finalité : répondre à votre demande et préparer une éventuelle prestation. Base légale : votre consentement et les mesures précontractuelles prises à votre demande.",
        "Mesure d'audience : des statistiques de fréquentation anonymisées via Vercel Web Analytics, sans cookie et sans identification personnelle. Finalité : comprendre l'usage du site. Base légale : l'intérêt légitime de l'éditeur.",
      ],
    },
    {
      heading: "Destinataires et sous-traitants",
      paragraphs: [
        `Vos données ne sont jamais vendues. Elles sont accessibles uniquement à ${brand} et aux prestataires techniques strictement nécessaires au fonctionnement du site :`,
      ],
      bullets: [
        "Vercel Inc. : hébergement du site et mesure d'audience.",
        "Resend (Plus Five Five, Inc.) : acheminement des e-mails envoyés via le formulaire de contact.",
      ],
    },
    {
      heading: "Transferts hors Union européenne",
      paragraphs: [
        "Les prestataires ci-dessus sont des sociétés établies aux États-Unis. À ce titre, certaines données peuvent être transférées hors de l'Union européenne. Ces transferts sont encadrés par les garanties appropriées prévues par le RGPD (clauses contractuelles types de la Commission européenne et/ou adhésion au cadre de protection des données UE–États-Unis).",
        "Ce point est particulièrement pertinent pour les demandes internationales : où que vous soyez, les mêmes garanties s'appliquent. [À COMPLÉTER/VÉRIFIER : confirmer les garanties contractuelles avec chaque prestataire.]",
      ],
    },
    {
      heading: "Durée de conservation",
      paragraphs: [
        "Les messages reçus via le formulaire de contact sont conservés le temps nécessaire au traitement de votre demande, puis archivés ou supprimés au plus tard [À COMPLÉTER : ex. 3 ans après le dernier contact, conformément aux recommandations de la CNIL pour la prospection]. Les statistiques d'audience sont conservées de façon agrégée et anonyme.",
      ],
    },
    {
      heading: "Vos droits (RGPD)",
      paragraphs: [
        "Vous disposez des droits suivants sur vos données : droit d'accès, de rectification, d'effacement, de limitation, d'opposition, et de portabilité. Vous pouvez également définir des directives relatives au sort de vos données après votre décès.",
        photographer.contact.email
          ? `Pour exercer ces droits, écrivez à ${photographer.contact.email}. Une réponse vous sera apportée dans un délai d'un mois.`
          : "Pour exercer ces droits, écrivez à [À COMPLÉTER : adresse e-mail]. Une réponse vous sera apportée dans un délai d'un mois.",
        "Si vous estimez, après nous avoir contactés, que vos droits ne sont pas respectés, vous pouvez introduire une réclamation auprès de la CNIL (www.cnil.fr).",
      ],
    },
    {
      heading: "Cookies",
      paragraphs: [
        "Ce site n'utilise pas de cookies publicitaires ni de traceurs nécessitant votre consentement. La mesure d'audience est réalisée sans cookie. [À COMPLÉTER/VÉRIFIER si des outils tiers avec cookies sont ajoutés ultérieurement.]",
      ],
    },
  ],
};
