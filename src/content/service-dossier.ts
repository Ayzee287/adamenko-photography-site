// Service dossier — the connective tissue of /prestations/<service>, and NOTHING ELSE.
//
// The audit found the four commercial pages at 159–170 words against a competitor median of
// 1 348, and proposed expanding them to 700–900. That target is a proxy for the real problem,
// and writing 700 words of new prose would have been the wrong way to hit it: it would mean
// inventing facts the studio has not stated, and burying the photographs under copy on a site
// whose entire argument is the photographs.
//
// What the ranking competitors actually do is ANSWER THE BOOKING DECISION on the page — what
// is included, how it runs, where, how much, when do I get the pictures, and what does the
// work look like. Every one of those answers ALREADY EXISTS in this repository: the
// inclusions in pricing.ts, the process in faq.ts, the coverage in locations.ts, and thirteen
// real shoots in stories.generated.ts. They were simply never on the page a visitor lands on.
//
// So this file holds ONLY the section headings and the process narration. Everything factual
// is DERIVED at render time from the module that owns it, which means:
//   • no fact is duplicated, so none can drift (a price edit reaches the dossier);
//   • no fact is invented, because there is nowhere here to put one;
//   • the depth is a consequence of answering the question, not a word quota.
//
// The one thing written from scratch is `steps` — and even that is a faithful restatement of
// answers already in faq.ts (reserver / preparation / delai-livraison / livraison), moved into
// the sequence a client experiences them. Those four FAQ entries are therefore deliberately
// NOT repeated in the dossier's own FAQ block below; it cites the questions the steps do not
// answer, so the page never says the same thing twice.

import type { GenreSlug } from "@/types/gallery";
import type { FaqId } from "@/content/faq";

export type DossierSection = {
  /** Mono eyebrow above the section title. */
  eyebrow: string;
  title: string;
  /** Optional single line under the title. */
  lead?: string;
};

export type DossierStep = {
  /** Mono ordinal — "01", "02"… rendered as the list marker. */
  n: string;
  title: string;
  body: string;
};

export const serviceDossier = {
  /** The work first: a photography site answers "show me" before "what's included". */
  work: {
    eyebrow: "Le travail",
    title: "Des séances récentes.",
    lead: "Chaque séance a sa propre page — les photographies, dans l'ordre où elles ont été faites.",
    /** Wedding overrides — a wedding is a reportage, not a séance. */
    weddingTitle: "Des mariages récents.",
    weddingLead:
      "Chaque mariage a sa propre page — la journée racontée dans l'ordre, des préparatifs à la fête.",
    /** Link to the full genre gallery under the teaser. */
    all: "Voir toute la galerie",
  },

  included: {
    eyebrow: "Ce qui est compris",
    title: "Ce que comprend la séance.",
    weddingTitle: "Les trois formules.",
    /** Wedding-only labels for the package micro-table (mirrors /tarifs). */
    weddingLead: "Trois formules claires, chacune racontée en reportage.",
    allPricing: "Voir tous les tarifs",
  },

  process: {
    eyebrow: "Le déroulé",
    title: "Comment ça se passe.",
  },

  coverage: {
    eyebrow: "Où",
    title: "Où je photographie.",
  },

  questions: {
    eyebrow: "Questions",
    title: "Ce qu'on me demande souvent.",
    all: "Toutes les questions",
  },

  /** The four steps, in the order a client lives them. Restated from faq.ts — see the header
   *  note. Step 3 is the only one that differs per service, and it differs on FACTS (duration
   *  for a séance, coverage range for a wedding) rather than on tone. */
  steps: {
    shared: [
      {
        n: "01",
        title: "On échange",
        body:
          "Vous m'écrivez avec la date, le lieu et ce que vous imaginez. On en parle, je vous envoie un devis adapté, et la date est bloquée à la réservation.",
      },
      {
        n: "02",
        title: "On prépare",
        body:
          "Je vous envoie quelques conseils simples avant le jour venu — les tenues, le lieu, le moment de la journée. Rien de compliqué : l'essentiel est d'être vous-mêmes.",
      },
    ] satisfies DossierStep[],
    /** Step 03's heading — a séance is an hour, a wedding is a day; the word follows. */
    daySession: "La séance",
    dayWedding: "Le jour J",
    /** Step 03's body — the only per-service step. Duration and coverage are the real
     *  pricing.ts figures (1 heure; 3–10 h across the three packages), stated in words. */
    onTheDay: {
      familles: "Une heure ensemble, chez vous ou en extérieur. Je reste en retrait et je vous laisse être une famille ; les enfants oublient l'appareil très vite.",
      grossesse: "Une heure, à votre rythme, chez vous ou en extérieur. On prend le temps ; rien n'est précipité, et on s'arrête quand vous le souhaitez.",
      couples: "Une heure en extérieur, souvent en fin de journée pour la lumière. On marche, on parle : les images justes arrivent dans le mouvement.",
      mariages: "De trois à dix heures selon la formule, des préparatifs à la fête. Je suis là, attentive, sans interrompre ce qui se passe.",
    } as Record<GenreSlug, string>,
    delivery: {
      n: "04",
      title: "Vous recevez vos photographies",
      body:
        "Un aperçu rapidement, puis la galerie privée complète en haute définition, sous quelques semaines selon la saison. Vous téléchargez vos images et les gardez pour toujours.",
    } satisfies DossierStep,
  },

  /** Which REAL add-ons each séance cites, by id. Cited rather than sliced: a blind
   *  `slice(0, 3)` put "Séance d'engagement — une séance à deux avant le mariage" on the
   *  MATERNITY page, which is a true option offered in the wrong conversation. The wedding
   *  dossier shows its three packages instead and cites none of these. */
  addons: {
    familles: ["heures", "lieux", "express"],
    grossesse: ["heures", "lieux", "express"],
    couples: ["heures", "lieux", "engagement"],
    mariages: [],
  } as Record<GenreSlug, string[]>,

  /** Which REAL questions each dossier cites. Never the four the steps already answer
   *  (reserver, preparation, delai-livraison, livraison) — that would repeat the page. */
  faq: {
    familles: ["confiance", "style", "poses", "delai-reservation"],
    grossesse: ["confiance", "style", "poses", "delai-reservation"],
    couples: ["confiance", "style", "poses", "delai-reservation"],
    mariages: ["confiance", "style", "poses", "deplacement"],
  } as Record<GenreSlug, FaqId[]>,
} as const;
