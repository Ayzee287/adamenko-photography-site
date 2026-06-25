// Russian translation DRAFT (2026-06-24) — PREPARED, NOT ACTIVATED (future locale).
// Same note as en.draft.ts: held here until the i18n seam is widened + opened. Core
// chrome + page intros are translated; finish the long-form home/services/FAQ copy at
// activation, after the French is final. Idiomatic, warm, first person — not literal.

export const ruDraft = {
  site: {
    tagline:
      "Семейный и портретный фотограф, съёмка беременности, пар и свадеб — в Лионе и не только.",
    nav: [
      { href: "/galeries", label: "Галереи" },
      { href: "/a-propos", label: "Обо мне" },
      { href: "/prestations", label: "Съёмки" },
      { href: "/contact", label: "Контакты" },
    ],
    legalNav: [
      { href: "/mentions-legales", label: "Правовая информация" },
      { href: "/confidentialite", label: "Конфиденциальность" },
    ],
  },
  copy: {
    home: {
      heroTitle: "Тёплые снимки, верные тем, кто на них.",
      heroSubtitle: "Семейная съёмка, беременность и пары — в Лионе.",
      heroCta: "Смотреть галереи",
      intro:
        "Я снимаю связь между людьми: семью, которая жмётся друг к другу, ожидание ребёнка, двоих влюблённых. Мягкие и искренние снимки, которые остаются с вами.",
      contactCta: "Давайте поработаем вместе",
    },
    contact: {
      eyebrow: "Связаться",
      title: "Контакты",
      intro:
        "Расскажите о вашей идее — дата, место, что вы представляете. Я отвечаю в течение нескольких дней.",
      form: {
        name: "Ваше имя",
        email: "Ваш e-mail",
        occasion: "Тип съёмки",
        message: "Сообщение",
        submit: "Отправить",
      },
    },
    footer: {
      tagline: "Фотограф в Лионе — семьи, пары, беременность, свадьбы.",
      rights: "Все права защищены.",
    },
  },
} as const;
