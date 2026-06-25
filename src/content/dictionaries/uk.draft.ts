// Ukrainian translation DRAFT (2026-06-24) — PREPARED, NOT ACTIVATED (future locale).
// Same note as en.draft.ts. The photographer is Ukrainian, so this locale is a natural
// fit for her own community + Ukrainian clients in France. Core chrome + page intros
// translated; finish long-form copy at activation. Idiomatic, warm, first person.

export const ukDraft = {
  site: {
    tagline:
      "Сімейний і портретний фотограф, зйомка вагітності, пар і весіль — у Ліоні та поза ним.",
    nav: [
      { href: "/galeries", label: "Галереї" },
      { href: "/a-propos", label: "Про мене" },
      { href: "/prestations", label: "Зйомки" },
      { href: "/contact", label: "Контакти" },
    ],
    legalNav: [
      { href: "/mentions-legales", label: "Правова інформація" },
      { href: "/confidentialite", label: "Конфіденційність" },
    ],
  },
  copy: {
    home: {
      heroTitle: "Теплі знімки, вірні тим, хто на них.",
      heroSubtitle: "Сімейна зйомка, вагітність і пари — у Ліоні.",
      heroCta: "Переглянути галереї",
      intro:
        "Я знімаю зв'язок між людьми: родину, що тулиться одне до одного, очікування дитини, двох закоханих. М'які та щирі знімки, які залишаються з вами.",
      contactCta: "Попрацюймо разом",
    },
    contact: {
      eyebrow: "Зв'язатися",
      title: "Контакти",
      intro:
        "Розкажіть про вашу ідею — дата, місце, що ви уявляєте. Я відповідаю протягом кількох днів.",
      form: {
        name: "Ваше ім'я",
        email: "Ваш e-mail",
        occasion: "Тип зйомки",
        message: "Повідомлення",
        submit: "Надіслати",
      },
    },
    footer: {
      tagline: "Фотограф у Ліоні — родини, пари, вагітність, весілля.",
      rights: "Усі права захищені.",
    },
  },
} as const;
