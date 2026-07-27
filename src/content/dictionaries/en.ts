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
import type { ContactOccasion } from "@/lib/contact";
import { galleries as frGalleries, featured as frFeatured } from "@/content/galleries";
import { galleryText, featuredAlts } from "@/content/galleries.en";

// Contact-select labels, keyed by the CANONICAL submitted value (like galleryText
// below, annotated with the full Record so a new occasion added to lib/contact
// without an English label fails typecheck instead of silently showing French — B2).
const occasionLabels: Record<ContactOccasion, string> = {
  Famille: "Family",
  Grossesse: "Maternity",
  Couple: "Couple",
  Mariage: "Wedding",
};
// Gallery text overlay — AUTO-GENERATED from curation/collections.txt by
// `npm run photos:build`, the same source that generates the French gallery model. Keeping
// both locales on one source removes the hand-maintained parallel arrays that drifted twice.


const enGalleries = frGalleries.map((g) => ({
  ...g,
  title: galleryText[g.slug].title,
  intro: galleryText[g.slug].intro,
  cover: { ...g.cover, alt: galleryText[g.slug].coverAlt },
  images: g.images.map((img, i) => ({ ...img, alt: galleryText[g.slug].alts[i] })),
}));

const enFeaturedAlts = featuredAlts;

const enFeatured = frFeatured.map((img, i) => ({ ...img, alt: enFeaturedAlts[i] }));

export const en: DeepPartial<Dictionary> = {
  site: {
    tagline:
      "Family, maternity, couple and wedding photographer, in Lyon and beyond.",
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
        "Irina Adamenko, family and maternity photographer in Lyon, weddings throughout France. A documentary approach, gentle and honest.",
      crosslinks: {
        label: "More",
        work: "View the work",
        pricing: "Pricing",
        contact: "Contact me",
      },
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
        "Tell me about your project: the date, the place, what you have in mind.",
      reassurance: {
        title: "What happens next",
        steps: [
          "A reply within a few days.",
          "A conversation about your project: the date, the place, what you picture.",
          "A proposal shaped around your session, with no obligation.",
        ],
      },
      form: {
        name: "Your name",
        email: "Your email",
        occasion: "Type of session",
        occasionPlaceholder: "Choose…",
        occasionLabels,
        message: "Your message",
        period: "Preferred date",
        place: "Location",
        optionalSuffix: "(optional)",
        submit: "Send",
        sending: "Sending…",
        success:
          "Thank you, your message has arrived. I'll be in touch very soon.",
        successHeading: "Thank you, your message is on its way.",
        successBody: "I'll reply within a few days.",
        error:
          "Sorry, your message didn't go through. Try again in a moment, or email me directly.",
        mailtoLabel: "Email me directly",
        statusSent: "Message sent.",
        statusError: "Sending failed. Your message has been kept.",
        errors: {
          name: "Please enter your name.",
          email: "Please enter a valid email address.",
          occasion: "Choose a type of session.",
          message: "Write a few words (at least 10 characters).",
        },
      },
    },
    footer: {
      tagline: "Families, maternity & couples · weddings throughout France · based in Lyon.",
      instagram: "Instagram",
      rights: "All rights reserved.",
    },
  },

  ui: {
    skipToContent: "Skip to content",
    actions: {
      viewGallery: "View the gallery",
      pricing: "Pricing",
      contactMe: "Contact me",
      more: "More",
      howItWorks: "How it works",
      requestDate: "Request a date",
      requestQuote: "Request a quote",
      manifesto: "Manifesto",
    },
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
      email: "Send an email",
      backToTop: "Back to top",
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
        alt: "A bride in a lavender field, arms crossed, in the golden light of evening.",
      },
      imageHint:
        "Golden light, a moment suspended. The very first thing you feel.",
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
        "I'm Irina, a family photographer in Lyon. Ukrainian, and a mother of three.",
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
          caption: "Everyday life and the bonds within it, at home or out in the open.",
          src: "/galleries/familles/familles-a01.jpg",
          alt: "A family gathered in a field, in the warm light of autumn.",
        },
        {
          slug: "grossesse",
          title: "Maternity",
          cta: "View the gallery",
          caption: "The gentle weeks before the baby arrives.",
          src: "/galleries/grossesse/grossesse-a00.jpg",
          alt: "A mother-to-be before the columns of a Lyon palace.",
        },
        {
          slug: "couples",
          title: "Couples",
          cta: "View the gallery",
          caption: "Two people, no stiff poses.",
          src: "/galleries/couples/couples-a07.jpg",
          alt: "A couple on a terrace overlooking the valley, at dusk.",
        },
        {
          slug: "mariages",
          title: "Weddings",
          cta: "View the gallery",
          caption: "Your day, from the preparations to the celebration.",
          src: "/stories/mariages/mariages-3/mariages-3-46.jpg",
          alt: "The groom lifts his wife, her arms open, against an evening sky.",
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
          image: { src: "/galleries/familles/familles-a04.jpg", alt: "" },
          hint: "A tender detail from a session: hands, a glance off-frame.",
        },
        {
          label: "Practical info",
          title: "Frequently asked questions",
          href: "/prestations#faq",
          image: { src: "/galleries/couples/couples-a03.jpg", alt: "" },
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
      title: "Trust, above all.",
      empty: "My clients' words will appear here. Real ones, never invented.",
      carouselLabel: "Google client reviews",
      readMore: "Read more",
      readLess: "Show less",
      summary: "Google rating {rating} / 5 · based on {count} reviews",
      attribution: "Google Reviews",
      viewOriginal: "View original",
      viewTranslation: "View translation",
      viewAllOnGoogle: "View all reviews on Google",
    },
    finalCta: {
      eyebrow: "Contact",
      title: "Let's work together.",
      body: "Tell me about your project: the date, the place, what you have in mind. I reply within a few days.",
      locationLabel: "Based in",
      location: "Lyon, France",
      availabilityLabel: "Availability",
      availability: "Family and maternity in Lyon · weddings throughout France.",
      cta: { label: "Get in touch", href: "/contact" },
      instagramLabel: "Follow on Instagram",
    },
  },

  pricing: {
    eyebrow: "Investment",
    title: "Transparent, and shaped around you.",
    intro:
      "Clear rates, so you know what to expect from the start. The rest we decide together: the place, the pace, what you'll keep.",
    fromLabel: "from",
    onRequest: "Rate on request",
    coverageLabel: "Coverage",
    deliveryLabel: "Delivery",
    overviewCta: { label: "See the pricing", href: "/tarifs" },
    sessions: {
      eyebrow: "Sessions",
      title: "Family, maternity & couple.",
      intro:
        "Three separate sessions, all at the same rate. We settle the place and the pace together: at home, outdoors, wherever you feel most at ease.",
      durationLabel: "Duration",
      items: [
        {
          slug: "familles",
          name: "Family",
          summary:
            "With your people, at home or outdoors: the games, the cuddles, the tender mess of everyday life.",
          price: 220,
          exactPrice: true,
          duration: "1 hour",
          includes: [
            "One location, at home or outdoors",
            "Planning and location scouting together",
            "Private online gallery",
            "High-resolution edited photographs",
            "Private-use rights",
          ],
        },
        {
          slug: "grossesse",
          name: "Maternity",
          summary:
            "To keep a trace of the waiting: alone, together, or with the older ones, at your pace.",
          price: 220,
          exactPrice: true,
          duration: "1 hour",
          includes: [
            "One location, at home or outdoors",
            "A calm pace, shaped around your comfort",
            "Private online gallery",
            "High-resolution edited photographs",
            "Private-use rights",
          ],
        },
        {
          slug: "couples",
          name: "Couple & portrait",
          summary: "Two people, or a candid portrait, no stiff poses.",
          price: 220,
          exactPrice: true,
          duration: "1 hour",
          includes: [
            "Outdoors or at home",
            "Light direction, never a choreography",
            "Private online gallery",
            "High-resolution edited photographs",
            "Private-use rights",
          ],
        },
      ],
    },
    wedding: {
      eyebrow: "Weddings",
      title: "Three packages, across France.",
      intro:
        "From an intimate ceremony to a full day: three clear packages, each told as reportage, in natural light.",
      recommendedLabel: "Recommended",
      photosLabel: "Photographs",
      packages: [
        {
          name: "Essential / Mini",
          price: 650,
          description:
            "Made for civil weddings, small ceremonies and weekday celebrations.",
          coverage: "Up to 3 hours",
          photos: "Around 300 edited photographs",
          includes: ["Private online gallery"],
          delivery: "3 to 4 weeks",
        },
        {
          name: "Classic",
          price: 1100,
          description:
            "Enough coverage for the moments that matter, without complicating the day.",
          coverage: "Up to 8 hours",
          photos: "Around 450 edited photographs",
          includes: ["Private online gallery"],
          delivery: "6 to 8 weeks",
        },
        {
          name: "The whole day",
          price: 1600,
          description:
            "The coverage to live your wedding unhurried, from the morning through to the start of the evening (11 pm).",
          coverage: "Up to 10 hours",
          photos: "Around 600 edited photographs",
          includes: ["Private online gallery"],
          delivery: "6 to 8 weeks",
          recommended: true,
        },
      ],
    },
    addons: {
      eyebrow: "Options",
      title: "To go further.",
      items: [
        { title: "Extra hours", body: "More time together, so nothing feels rushed." },
        { title: "Additional locations", body: "A second setting that means something to you." },
        { title: "Engagement session", body: "A shoot for two before the wedding, so you're at ease on the day." },
        { title: "Express delivery", body: "Your images first, within a few days." },
        { title: "Bespoke", body: "Something particular in mind? Let's talk, I'll adapt." },
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
          "No stiff poses or forced looks at the lens. We walk, we talk, I let you find each other again. That's where the right images arrive, in the movement.",
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
    ],
  },

  locations: {
    summary:
      "Based in Lyon. Family and maternity in Lyon; weddings throughout France.",
    areas: [
      {
        id: "lyon",
        label: "Lyon and the surrounding area",
        tier: "primary",
        schemaType: "City",
        note: "Family and maternity in Lyon, at your home or outdoors, with no travel fee within the metropolitan area.",
      },
      {
        id: "france",
        label: "France",
        tier: "regional",
        schemaType: "Country",
        note: "Weddings throughout France; travel is agreed together, transparently.",
      },
    ],
  },

  faq: {
    title: "Frequently asked questions",
    intro:
      "A few answers to help you plan. Another question? Write to me, I'm always happy to reply.",
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
        a: "At your home or outdoors, most often in and around Lyon, but elsewhere too depending on your project. For weddings, I travel throughout France.",
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
        a: "In a private online gallery, in high resolution. You download your photos and keep them for good.",
      },
      {
        category: "deplacement",
        q: "Do you travel for weddings?",
        a: "Yes, throughout France. I'm based in Lyon; for weddings, travel costs are agreed together, transparently.",
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
    ],
  },

  photographer: {
    // Name / legal name / brand / location label are proper nouns — kept as French.
    specialties: ["Family", "Maternity", "Couple", "Wedding"],
    biography: [
      "I'm Irina, a family and maternity photographer in Lyon. I also photograph weddings, throughout France.",
      "I'm Ukrainian; I settled in Lyon with my family. A lawyer by training, I came to photography almost by chance, and then I couldn't do without it.",
      "I'm a mother of three. The days with little ones, the bursts of laughter and the surprises: I know them well, and that's often where the most beautiful images are hiding.",
      "I love to photograph life as it is. With me, no fixed stare at the lens: I guide you with a few simple gestures, then I step back. What interests me is the real moments: a smile, a hug, a game, the small rituals of everyday life.",
      "At heart, my work is to give you these moments back the way you lived them: gentle, honest images, made to live with you and to be passed on.",
    ],
    availability: {
      base: "Lyon, France",
      scope: "Families, maternity and couples in and around Lyon and beyond · weddings throughout France.",
      note: "Based in Lyon; travelling across the region and, for weddings, throughout France.",
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
            "Photographic activity based in Lyon, France.",
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
            "Audience and performance measurement: anonymised traffic statistics and technical performance metrics via Vercel Web Analytics and Vercel Speed Insights, with no cookie and no personal identification. Purpose: to understand how the site is used and keep it fast. Legal basis: the publisher's legitimate interest.",
          ],
        },
        {
          heading: "Recipients and processors",
          paragraphs: [
            "Your data is never sold. It is accessible only to Adamenko Photography and to the technical providers strictly necessary for the site to work:",
          ],
          bullets: [
            "Vercel Inc.: site hosting, audience and performance measurement.",
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
