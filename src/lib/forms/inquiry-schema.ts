// The inquiry contract (Addendum C2) — ONE Zod schema shared client/server:
// blur validation and the server action parse the same shape. Field errors
// carry FIELD KEYS, not strings — the UI maps keys to dictionary messages
// (i18n stays in content, never in validation logic).

import { z } from "zod";
import { allServiceParams } from "@/lib/routes";

export const sessionTypes = allServiceParams;
export type SessionType = (typeof sessionTypes)[number];

export const inquirySchema = z.object({
  name: z.string().trim().min(1),
  email: z.string().trim().email(),
  sessionType: z.enum(sessionTypes),
  period: z.string().trim().optional(),
  place: z.string().trim().optional(),
  message: z.string().trim().min(1),
  source: z.string().trim().optional(),
  company: z.literal(""), // honeypot — anything else is a bot
});

export type InquiryValues = z.infer<typeof inquirySchema>;

/** Fields that can carry a visible error (honeypot excluded by design). */
export type InquiryField = "name" | "email" | "sessionType" | "message";

export const requiredFields: InquiryField[] = [
  "name",
  "email",
  "sessionType",
  "message",
];

/** Validate one field (blur validation) — same schema, single shape. */
export function validateField(
  field: InquiryField,
  value: string,
): boolean {
  return inquirySchema.shape[field].safeParse(value).success;
}

export interface InquiryState {
  status: "idle" | "error" | "success";
  values: Partial<Record<keyof InquiryValues, string>>;
  fieldErrors: InquiryField[];
  /** Delivery failed after valid input — the form-scope error (input kept). */
  formError: boolean;
}

export const initialInquiryState: InquiryState = {
  status: "idle",
  values: {},
  fieldErrors: [],
  formError: false,
};
