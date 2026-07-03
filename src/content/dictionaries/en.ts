// English dictionary (production locale, activated 2026-06-28). A complete, idiomatic
// human translation of the French canonical — same warm, plain, first-person, calm
// voice; no marketing clichés ("capture memories", "timeless", "freeze moments"). Any
// key omitted here falls back to French via getDictionary (lib/dictionary), so this
// file aims to cover every user-facing string. Proper nouns (Lyon, Irina Adamenko,
// Adamenko Photography), routes and statutory references are intentionally kept.
//
// Galleries + the homepage reel are built by mapping the French data so image src,
// dimensions and ratios stay correct — only the alt text / titles / intros translate.

import type { DeepPartial } from "@/lib/dictionary";
import type { Dictionary } from "./fr";
import type { GenreSlug } from "@/types/gallery";
import type { ContactOccasion } from "@/lib/contact";
import { galleries as frGalleries, featured as frFeatured } from "@/content/galleries";

// Contact-select labels, keyed by the CANONICAL submitted value (like galleryText
// below, annotated with the full Record so a new occasion added to lib/contact
// without an English label fails typecheck instead of silently showing French — B2).
const occasionLabels: Record<ContactOccasion, string> = {
  Famille: "Family",
  Grossesse: "Maternity",
  Couple: "Couple",
  Portrait: "Portrait",
  Mariage: "Wedding",
};

// ── Gallery text overlay (alts in the same order as content/galleries.ts) ──────────
// Keyed by GenreSlug (not string) so a genre added to the French galleries without an
// English overlay fails typecheck instead of silently shipping a French alt (I6).
const galleryText: Record<
  GenreSlug,
  { title: string; intro: string; coverAlt: string; alts: string[] }
> = {
  familles: {
    title: "Families",
    intro: "Everyday life and the bonds within it — at home, outdoors, together.",
    coverAlt: "A family at home, a parent lifting their child into the window light.",
    alts: [
      "A mother and her child, forehead to forehead, in the tall grass at sunset.",
      "A moment of family closeness, in natural light.",
      "Shared laughter outdoors, as the session unfolds.",
      "A tender moment between parents and child.",
      "The gentleness of everyday life, as a family.",
      "A walk together, unposed.",
      "Family portrait, soft light.",
      "Parent and child, caught in the moment.",
      "A burst of family laughter.",
    ],
  },
  grossesse: {
    title: "Maternity",
    intro: "The gentle weeks before the baby arrives.",
    coverAlt: "A mother-to-be in a white dress in a golden field, at sunset.",
    alts: [
      "A couple sitting on the floor by the window, awaiting their child, in black and white.",
      "A mother-to-be, soft indoor light.",
      "A couple's tenderness before the baby arrives.",
      "The wait, at home.",
      "Maternity portrait in natural light.",
      "The gentleness of a maternity session.",
      "A mother-to-be in soft light, before the birth.",
      "A couple embraces in a field at sunset, an ultrasound scan in hand.",
    ],
  },
  couples: {
    title: "Couples",
    intro: "Two people, one bond. No stiff poses.",
    coverAlt: "A couple kissing, sitting on the edge of a Parisian kerb.",
    alts: [
      "A couple at ease under the market halls, warm light.",
      "A walk for two through the city.",
      "Two lovers, a shared glance.",
      "A couple's tenderness, unposed.",
      "A moment of intimacy for two.",
      "A couple's closeness, in natural light.",
      "Two people in love, unposed.",
    ],
  },
  portraits: {
    title: "Portraits",
    intro: "A simple portrait, in daylight.",
    coverAlt: "Portrait of a mother-to-be in a golden field, at sunset.",
    alts: [
      "Portrait of a woman in a white dress, golden evening light.",
      "A mother-to-be looking at her ultrasound scan, in black and white.",
      "Portrait of a mother-to-be in the tall grass, in black and white.",
      "A mother and her baby, a tender moment in black and white.",
    ],
  },
  mariages: {
    title: "Weddings",
    intro: "The story of a day: emotion over staging.",
    coverAlt: "The newlyweds in front of a burgundy 2CV, at the entrance of a château.",
    alts: [
      "The newlyweds forehead to forehead, laughing, in an ornate hall.",
      "The newlyweds in a botanical garden, among the agaves.",
      "A moment of the big day, caught in passing.",
      "Portrait of the newlyweds.",
      "The ceremony, told with discretion.",
      "A detail from the wedding day.",
      "The emotion of a wedding, in natural light.",
      "A powerful moment, caught discreetly.",
      "The newlyweds carried by their guests, a burst of joy, in black and white.",
    ],
  },
};

const enGalleries = frGalleries.map((g) => ({
  ...g,
  title: galleryText[g.slug].title,
  intro: galleryText[g.slug].intro,
  cover: { ...g.cover, alt: galleryText[g.slug].coverAlt },
  images: g.images.map((img, i) => ({ ...img, alt: galleryText[g.slug].alts[i] })),
}));

const enFeaturedAlts = [
  "A mother and her child, forehead to forehead, at sunset.",
  "A couple at ease under the market halls, warm light.",
  "A mother-to-be in a golden field, at sunset.",
  "The newlyweds carried by their guests, in black and white.",
  "A family at home, in the window light.",
  "A couple in a field at sunset, an ultrasound scan in hand.",
  "The newlyweds forehead to forehead, laughing.",
  "A couple kissing on the edge of a Parisian kerb.",
  "A couple by the window, waiting, in black and white.",
  "The newlyweds in a botanical garden.",
];

const enFeatured = frFeatured.map((img, i) => ({ ...img, alt: enFeaturedAlts[i] }));

export const en: DeepPartial<Dictionary> = {
  site: {
    tagline:
      "Family, portrait, maternity, couple and wedding photographer — in Lyon and beyond.",
    // Hrefs stay canonical (French paths); the chrome prefixes them per locale.
    nav: [
      { href: "/galeries", label: "Galleries" },
      { href: "/a-propos", label: "About" },
      { href: "/prestations", label: "Sessions" },
      { href: "/contact", label: "Contact" },
    ],
    legalNav: [
      { href: "/mentions-legales", label: "Legal notice" },
      { href: "/confidentialite", label: "Privacy" },
    ],
  },

  copy: {
    siteDescriptor: "Photographer in Lyon",
    home: { contactCta: "Let's work together" },
    galleries: {
      eyebrow: "The work, by theme",
      title: "Galleries",
      intro:
        "A tight selection, by theme. Each series is conceived as a single, coherent whole.",
      view: "View the series",
    },
    about: {
      title: "About",
      portraitAlt: "Portrait of the photographer",
      cta: "Let's work together",
      metaDescription:
        "Irina Adamenko, family photographer in Lyon. A documentary approach — gentle, honest images, in France and across Europe.",
    },
    services: {
      eyebrow: "Working together",
      title: "Sessions",
      intro:
        "Every session is shaped around you: the place, the pace, what matters to your family.",
      cta: "Request the rates",
    },
    contact: {
      eyebrow: "Get in touch",
      title: "Contact",
      intro:
        "Tell me about your project — the date, the place, what you have in mind. I reply within a few days.",
      reassurance: {
        title: "What happens next",
        steps: [
          "A reply within a few days.",
          "A conversation about your project — the date, the place, what you picture.",
          "A proposal shaped around your session, with no obligation.",
        ],
      },
      form: {
        name: "Your name",
        email: "Your email",
        occasion: "Type of session",
        occasionLabels,
        message: "Your message",
        submit: "Send",
        sending: "Sending…",
        success:
          "Thank you — your message has arrived. I'll be in touch very soon.",
        error:
          "Sorry, your message didn't go through. Try again in a moment, or email me directly.",
        errors: {
          name: "Please enter your name.",
          email: "Please enter a valid email address.",
          occasion: "Choose a type of session.",
          message: "Write a few words (at least 10 characters).",
        },
      },
    },
    footer: {
      tagline: "Photographer in Lyon — families, couples, maternity, weddings.",
      instagram: "Instagram",
      rights: "All rights reserved.",
    },
  },

  ui: {
    skipToContent: "Skip to content",
    nav: {
      primary: "Main navigation",
      footer: "Footer",
      legal: "Legal links",
      openMenu: "Open menu",
      closeMenu: "Close menu",
      menu: "Menu",
      language: "Language",
      instagram: "Instagram",
      facebook: "Facebook",
    },
    gallery: {
      enlarge: "Enlarge",
      reel: "Gallery preview: drag, scroll or use the arrow keys to explore",
      prevImage: "Previous image",
      nextImage: "Next image",
      lightbox: "Photograph viewer",
      close: "Close",
      closeLabel: "Close ✕",
      prevPhoto: "Previous photograph",
      nextPhoto: "Next photograph",
      photograph: "Photograph",
      of: "of",
      viewGallery: "View the gallery",
    },
    testimonials: {
      prev: "Previous testimonial",
      next: "Next testimonial",
    },
    contact: {
      orEmailDirect: "Or email me directly at",
      andFindMeOn: "or find me on",
      orFindMeOn: "Or find me on",
    },
    notFound: {
      eyebrow: "Error 404",
      title: "This page doesn't exist.",
      intro: "The page you're looking for may have moved, or no longer exists.",
      back: "Back to home",
    },
  },

  home: {
    hero: {
      kicker: "Photographer · Lyon",
      title: "Photographs that look like you.",
      scrollCue: "Scroll",
      image: {
        alt: "Newlyweds, arms raised to the hills, on a terrace at dusk.",
      },
      imageHint:
        "An embrace in the warm light at the end of the day. The very first thing you feel.",
    },
    signature: [
      "I photograph the bonds between us.",
      "A family drawing close, the wait for a child,",
      "two people in love.",
    ],
    about: {
      eyebrow: "The photographer",
      title: "Behind the lens.",
      body: [
        "I'm Irina, a family photographer in Lyon — Ukrainian, and a mother of three.",
        "A lawyer who became a photographer, I put you at ease and then step back: it's the real moments that interest me, never stiff poses.",
      ],
      values: ["Warmth", "Honesty", "Presence", "Patience"],
      cta: { label: "Read more", href: "/a-propos" },
      portraitAlt: "Portrait of the photographer",
      portraitLabel: "The photographer",
      portraitHint:
        "A candid portrait. Direct gaze, shoulders at three-quarters. Soft window light.",
    },
    experience: {
      eyebrow: "The experience",
      title: "Simple, from first message to images.",
      intro:
        "From a quiet family session at home to a whole wedding, I want every step to be simple and to feel like you.",
      steps: [
        {
          n: "01",
          title: "We meet",
          body: "We talk through your project, your wishes, what truly matters to you.",
        },
        {
          n: "02",
          title: "We plan together",
          body: "The place, the time, the pace: we settle everything so the day itself is easy.",
        },
        {
          n: "03",
          title: "The session",
          body: "I let you live it and photograph what really happens. No stiff poses.",
        },
        {
          n: "04",
          title: "Delivery",
          body: "A private gallery of edited images, ready to print and to pass on.",
        },
      ],
    },
    gallery: {
      eyebrow: "The work",
      title: "A glimpse, to scroll through.",
      intro:
        "A few images, chosen from recent sessions. The full selection is in the galleries.",
      cta: { label: "Browse the galleries", href: "/galeries" },
    },
    seances: {
      eyebrow: "By theme",
      title: "My sessions.",
      scenes: [
        {
          slug: "familles",
          title: "Families",
          cta: "View the gallery",
          caption: "Everyday life and the bonds within it, at home or outdoors.",
          src: "/galleries/familles/familles-01.jpg",
          alt: "A mother and her child, forehead to forehead, in the tall grass at sunset.",
        },
        {
          slug: "grossesse",
          title: "Maternity",
          cta: "View the gallery",
          caption: "The gentle weeks before the baby arrives.",
          src: "/galleries/grossesse/grossesse-05.jpg",
          alt: "A mother-to-be in natural light, the wait before the birth.",
        },
        {
          slug: "couples",
          title: "Couples",
          cta: "View the gallery",
          caption: "Two people, no stiff poses.",
          src: "/galleries/couples/couples-01.jpg",
          alt: "A couple at ease under the market halls, warm light.",
        },
        {
          slug: "mariages",
          title: "Weddings",
          cta: "View the gallery",
          caption: "Your day, from the preparations to the celebration.",
          src: "/galleries/mariages/mariages-09.jpg",
          alt: "The newlyweds carried by their guests, a burst of joy, in black and white.",
        },
      ],
      cta: { label: "View all galleries", href: "/galeries" },
    },
    discover: {
      eyebrow: "To explore",
      title: "Before you get in touch.",
      cards: [
        {
          label: "The experience",
          title: "What to expect",
          href: "/prestations",
          image: { src: "/galleries/familles/familles-04.jpg", alt: "" },
          hint: "A tender detail from a session: hands, a glance off-frame.",
        },
        {
          label: "Practical info",
          title: "Frequently asked questions",
          href: "/prestations#faq",
          image: { src: "/galleries/couples/couples-06.jpg", alt: "" },
          hint: "A quiet moment, waiting, in late-afternoon light.",
        },
        {
          label: "About",
          title: "Meet the photographer",
          href: "/a-propos",
          image: { src: "/about/portrait-irina.jpg", alt: "" },
          hint: "The photographer in her element, a gesture between two frames.",
        },
      ],
    },
    testimonials: {
      eyebrow: "In their words",
      title: "Trust, above all.",
      empty: "My clients' words will appear here. Real ones, never invented.",
      carouselLabel: "Google client reviews",
      readMore: "Read more",
      readLess: "Show less",
      summary: "Google rating {rating} / 5 · based on {count} reviews",
    },
    finalCta: {
      eyebrow: "Contact",
      title: "Let's work together.",
      body: "Tell me about your project — the date, the place, what you have in mind. I reply within a few days.",
      locationLabel: "Based in",
      location: "Lyon, France",
      availabilityLabel: "Availability",
      availability: "In Lyon and anywhere in the world.",
      cta: { label: "Get in touch", href: "/contact" },
      instagramLabel: "Follow on Instagram",
    },
  },

  pricing: {
    eyebrow: "Investment",
    title: "Transparent, and shaped around you.",
    intro:
      "Every project is different; the packages below set the frame. The exact rate depends on the length, the place and what you'd like to keep.",
    fromLabel: "from",
    onRequest: "Rate on request",
    overviewCta: { label: "See the sessions", href: "/prestations" },
    packages: [
      {
        name: "Session",
        summary: "Family, maternity, couple or portrait, at home or outdoors.",
        includes: [
          "1 to 2 hours, one location",
          "Planning and location scouting together",
          "Private online gallery",
          "High-resolution edited photographs",
          "Private-use rights",
        ],
      },
      {
        name: "Wedding",
        summary: "The story of a day, from the preparations to the celebration.",
        includes: [
          "Half-day or full day",
          "Pre-wedding planning meeting",
          "Private online gallery",
          "High-resolution edited photographs",
          "Album and print options",
        ],
      },
    ],
    addons: {
      eyebrow: "Options",
      title: "To go further.",
      items: [
        { title: "Extra hours", body: "More time together, so nothing feels rushed." },
        { title: "Additional locations", body: "A second setting that means something to you." },
        { title: "Premium album", body: "A printed book, made to last and to pass on." },
        { title: "Express delivery", body: "Your images first, within a few days." },
        { title: "Fine-art prints", body: "Carefully made prints, ready to hang." },
        { title: "Bespoke", body: "Something particular in mind? Let's talk — I'll adapt." },
      ],
    },
  },

  services: {
    eyebrow: "The sessions",
    title: "What I photograph.",
    intro:
      "A documentary approach, in natural light: I let you live the scene and photograph what really happens. Few poses, real interactions, in colour as in black and white.",
    items: [
      {
        slug: "familles",
        title: "Family",
        tagline: "Your everyday life, just as it is.",
        description: [
          "A family session isn't a session of poses. We meet at your home or outdoors, and I let you simply be together: the games, the cuddles, the tender mess of everyday life.",
          "I work quietly, in daylight, so the children forget the camera and the real interactions return on their own.",
        ],
        approach: [
          "At home or outdoors, whichever feels like you",
          "Few instructions, plenty of freedom to move",
          "Natural light, colour and black and white",
        ],
        idealFor:
          "Families with children, new arrivals, reunions, several generations together.",
      },
      {
        slug: "couples",
        title: "Couple",
        tagline: "The two of you, at ease.",
        description: [
          "No stiff poses or forced looks at the lens. We walk, we talk, I let you find each other again. That's where the right images arrive — in the movement.",
          "A couple session is also a good way to feel at ease before a wedding, if that's what lies ahead.",
        ],
        approach: [
          "Outdoors, often late in the day for the light",
          "Gentle cues, never a choreography",
          "Movement and closeness rather than the pose",
        ],
        idealFor: "Couples, engagements, anniversaries, a pre-wedding session.",
      },
      {
        slug: "grossesse",
        title: "Maternity",
        tagline: "The weeks before the birth.",
        description: [
          "A gentle, modest maternity session, by a window's light or outdoors. We take our time; nothing is rushed.",
          "The idea isn't to stage anything, but to keep an honest trace of this time: on your own, as a couple, or with the older ones.",
        ],
        approach: [
          "At home or outdoors, in a calm setting",
          "An unhurried pace, suited to your comfort",
          "Natural light, soft tones, black and white if you like",
        ],
        idealFor: "Parents-to-be, usually from the seventh month.",
      },
      {
        slug: "mariages",
        title: "Wedding",
        tagline: "Your day, told the way you lived it.",
        description: [
          "I approach a wedding like a reportage: I'm there, attentive, telling the thread of the day from the preparations to the celebration, without interrupting what unfolds.",
          "A few posed portraits of the two of you if you'd like, but the heart of it is in the real moments, in natural light as much as possible.",
        ],
        approach: [
          "Half-day or full day",
          "A planning meeting to settle everything together",
          "Discreet reportage; couple portraits optional",
        ],
        idealFor:
          "Civil weddings, secular ceremonies, elopements and intimate celebrations.",
      },
      {
        slug: "portraits",
        title: "Portrait",
        tagline: "A simple portrait, in daylight.",
        description: [
          "A candid portrait, without artifice: a conversation more than a pose. We look for your most natural expression, in daylight.",
          "For personal or professional use, in colour or black and white.",
        ],
        approach: [
          "In an improvised studio, at home or outdoors",
          "Putting you at ease, above all",
          "Black and white or colour, depending on the intention",
        ],
        idealFor: "Personal, artistic or professional portraits.",
      },
    ],
  },

  locations: {
    summary:
      "Based in Lyon, available across Europe; international projects are considered case by case.",
    areas: [
      {
        id: "lyon",
        label: "Lyon and the surrounding area",
        tier: "primary",
        schemaType: "City",
        note: "Sessions at your home or outdoors, with no travel fee within the metropolitan area.",
      },
      {
        id: "france",
        label: "France",
        tier: "regional",
        schemaType: "Country",
        note: "Travelling throughout France for sessions and weddings.",
      },
      {
        id: "europe",
        label: "Europe",
        tier: "regional",
        schemaType: "Continent",
        note: "Available for projects anywhere in Europe; travel is agreed together.",
      },
      {
        id: "international",
        label: "International",
        tier: "international",
        schemaType: "Continent",
        note: "Projects beyond Europe are considered individually. Let's talk.",
      },
    ],
  },

  faq: {
    title: "Frequently asked questions",
    intro:
      "A few answers to help you plan. Another question? Write to me — I'm always happy to reply.",
    items: [
      {
        category: "reservation",
        q: "How do I book a session?",
        a: "Write to me through the contact form with the date, the place and what you have in mind. We talk it through, then I send you a tailored quote; the date is held once you book.",
      },
      {
        category: "reservation",
        q: "How far in advance should I book?",
        a: "For a session, a few weeks is usually enough. For a wedding, it's best to plan several months ahead, especially in high season.",
      },
      {
        category: "approche",
        q: "What if we're not comfortable in front of the camera?",
        a: "That's true of almost everyone, and putting you at ease is my job. We move gently, without stiff poses; the real images arrive once you forget the camera.",
      },
      {
        category: "approche",
        q: "What is your photography style?",
        a: "A documentary approach, in natural light: I favour real moments and honest interactions over perfect poses. I work in colour as readily as in black and white.",
      },
      {
        category: "approche",
        q: "Do you take posed photos?",
        a: "Very few, and always gently. A few posed portraits are possible (the two of you at a wedding, for instance), but the heart of it stays the moments as they happen.",
      },
      {
        category: "seance",
        q: "Where do the sessions take place?",
        a: "In and around Lyon, at your home or outdoors. I also travel across France, Europe and abroad for projects that call for it.",
      },
      {
        category: "seance",
        q: "What should we prepare for the session?",
        a: "Mostly, just be yourselves. I send you a few simple tips beforehand (what to wear, the place, the time of day); nothing complicated.",
      },
      {
        category: "livraison",
        q: "When do we receive the photos?",
        a: "You get a quick preview, then the full gallery within a few weeks, depending on the season. Express delivery is available as an option.",
      },
      {
        category: "livraison",
        q: "How are the photos delivered?",
        a: "In a private online gallery, in high resolution and ready to print. Albums and fine-art prints are available as options.",
      },
      {
        category: "deplacement",
        q: "Do you work outside France?",
        a: "Yes. I'm based in Lyon and available across Europe; international projects are considered case by case. Travel costs are agreed together, transparently.",
      },
    ],
  },

  contactChannels: {
    responseTime: "I reply within a few days.",
    channels: [
      { id: "form", label: "Contact form", value: "Send a message", href: "/contact", external: false },
      { id: "email", label: "Email", value: "adamenkoiu@gmail.com", href: "mailto:adamenkoiu@gmail.com", external: false },
      { id: "phone", label: "Phone", value: "", href: "", external: false },
      { id: "instagram", label: "Instagram", value: "@adamenko_photography", href: "https://www.instagram.com/adamenko_photography/", external: true },
      { id: "facebook", label: "Facebook", value: "Adamenko Photography", href: "https://www.facebook.com/profile.php?id=100011367545612", external: true },
      { id: "telegram", label: "Telegram", value: "@AdamenkoIr", href: "https://t.me/AdamenkoIr", external: true },
    ],
  },

  photographer: {
    // Name / legal name / brand / location label are proper nouns — kept as French.
    specialties: ["Family", "Maternity", "Couple", "Portrait", "Wedding"],
    biography: [
      "I'm Irina. I'm a family photographer in Lyon, and I work wherever I'm taken — in France and elsewhere in Europe.",
      "I'm Ukrainian; I settled in Lyon with my family. A lawyer by training, I came to photography almost by chance, and then I couldn't do without it.",
      "I'm a mother of three. The days with little ones, the bursts of laughter and the surprises — I know them well: that's often where the most beautiful images are hiding.",
      "I love to photograph life as it is. With me, no fixed stare at the lens: I guide you with a few simple gestures, then I step back. What interests me is the real moments — a smile, a hug, a game, the small rituals of everyday life.",
      "At heart, my work is to give you these moments back the way you lived them: gentle, honest images, made to live with you and to be passed on.",
    ],
    availability: {
      base: "Lyon, France",
      scope: "In Lyon and anywhere in the world.",
      note: "Available for sessions in Lyon, across France and internationally.",
    },
    portrait: {
      alt: "Irina Adamenko, photographer in Lyon, a film camera in her hands.",
    },
  },

  galleries: enGalleries,
  featured: enFeatured,

  legal: {
    mentionsLegales: {
      eyebrow: "Legal information",
      title: "Legal notice",
      intro:
        "In accordance with the French law for confidence in the digital economy (LCEN), here is the information about the publisher and the host of this site.",
      updated: "Last updated: June 2026.",
      sections: [
        {
          heading: "Site publisher",
          paragraphs: [
            "Adamenko Photography, Irina Adamenko (Sereda), sole trader (entrepreneur individuel, EI).",
            "Place of business: Bât. 1, 173 av. Barthélemy Buyer, 69005 Lyon, France.",
            "Activity: photographic activities (APE code 74.20Z).",
            "SIRET: 979 493 327 00014. VAT not applicable, art. 293 B of the French General Tax Code (CGI).",
            "Contact: adamenkoiu@gmail.com.",
          ],
        },
        {
          heading: "Publication director",
          paragraphs: ["Irina Adamenko"],
        },
        {
          heading: "Host",
          paragraphs: [
            "The site is hosted by Vercel Inc.",
            "440 N Barranca Ave #4133, Covina, CA 91723, United States.",
            "https://vercel.com",
          ],
        },
        {
          heading: "Intellectual property",
          paragraphs: [
            "All photographs shown on this site are the exclusive property of Adamenko Photography and are protected by copyright (French Intellectual Property Code). Any reproduction, representation, modification or distribution, in whole or in part, without prior written permission, is prohibited.",
            "The texts, layout and graphic elements of the site are likewise protected.",
          ],
        },
        {
          heading: "Image rights",
          paragraphs: [
            "Images of the people photographed are published only with their consent. Anyone wishing to have an image of themselves removed may request it via the contact page; such requests are honoured as soon as possible.",
          ],
        },
        {
          heading: "Credits",
          paragraphs: ["Photographs: © Adamenko Photography. All rights reserved."],
        },
      ],
    },
    confidentialite: {
      eyebrow: "Personal data",
      title: "Privacy policy",
      intro:
        "This page explains what personal data is collected through this site, why, and what your rights are under the General Data Protection Regulation (GDPR).",
      updated: "Last updated: June 2026.",
      sections: [
        {
          heading: "Data controller",
          paragraphs: [
            "Irina Adamenko, Adamenko Photography, Lyon, France.",
            "For any question about your data: adamenkoiu@gmail.com.",
          ],
        },
        {
          heading: "Data collected and purposes",
          paragraphs: ["Only two kinds of processing take place on this site:"],
          bullets: [
            "Contact form: your name, your email address, the type of session and the message you send. Purpose: to answer your enquiry and prepare a possible booking. Legal basis: your consent and the pre-contractual steps taken at your request.",
            "Audience measurement: anonymised traffic statistics via Vercel Web Analytics, with no cookie and no personal identification. Purpose: to understand how the site is used. Legal basis: the publisher's legitimate interest.",
          ],
        },
        {
          heading: "Recipients and processors",
          paragraphs: [
            "Your data is never sold. It is accessible only to Adamenko Photography and to the technical providers strictly necessary for the site to work:",
          ],
          bullets: [
            "Vercel Inc.: site hosting and audience measurement.",
            "Resend (Plus Five Five, Inc.): delivery of the emails sent through the contact form.",
          ],
        },
        {
          heading: "Transfers outside the European Union",
          paragraphs: [
            "The providers above are companies established in the United States. As such, some data may be transferred outside the European Union. These transfers are governed by the appropriate safeguards provided for by the GDPR (the European Commission's standard contractual clauses and adherence to the EU–US Data Privacy Framework).",
            "This also concerns international enquiries: wherever you are, the same safeguards apply.",
          ],
        },
        {
          heading: "Retention period",
          paragraphs: [
            "Messages received through the contact form are kept for as long as needed to handle your enquiry, then for a maximum of three years from our last contact, in line with the CNIL's guidance on prospecting; after that they are deleted. Audience statistics are kept in aggregated, anonymous form.",
          ],
        },
        {
          heading: "Your rights (GDPR)",
          paragraphs: [
            "You have the following rights over your data: the rights of access, rectification, erasure, restriction, objection, and portability. You may also set directives regarding what happens to your data after your death.",
            "To exercise these rights, write to adamenkoiu@gmail.com. You will receive a reply within one month.",
            "If, after contacting us, you believe your rights are not being respected, you may lodge a complaint with the CNIL, the French data-protection authority (www.cnil.fr).",
          ],
        },
        {
          heading: "Cookies",
          paragraphs: [
            "This site uses no advertising cookies and no trackers subject to your consent. Audience measurement is carried out without cookies and without profiling, so no consent banner is needed.",
          ],
        },
      ],
    },
  },
};
