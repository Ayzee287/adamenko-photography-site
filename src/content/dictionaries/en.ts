// English dictionary — OWNER-PROVIDED translations (not shipped this sprint).
//
// Add only the keys you translate; everything else falls back to French automatically
// (see lib/dictionary.ts). To translate, mirror the French structure from `./fr`, e.g.:
//
//   export const en: DeepPartial<Dictionary> = {
//     copy: { contact: { title: "Contact", intro: "Tell me about your project…" } },
//   };
//
// When English is ready: fill this, add the `app/[lang]` route tree, then add "en" to
// `activeLocales` in lib/i18n.ts. See docs/localization-roadmap.md.

import type { DeepPartial } from "@/lib/dictionary";
import type { Dictionary } from "./fr";

export const en: DeepPartial<Dictionary> = {};
