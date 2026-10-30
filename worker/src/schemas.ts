import { z } from "zod";
import { normalizeLocalDateTime } from "./lib/dates";

// Rejects control characters so user input can never inject email headers.
const singleLine = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .refine((v) => !/[\u0000-\u001f\u007f]/.test(v), "Caractères non permis");

const localDateTime = z
  .string()
  .transform((value, ctx) => {
    const normalized = normalizeLocalDateTime(value);
    if (!normalized) {
      ctx.addIssue({ code: "custom", message: "Date et heure invalides" });
      return z.NEVER;
    }
    return normalized;
  });

export const registrationSchema = z.object({
  event: z.string().min(1).max(64),
  name: singleLine(100).pipe(z.string().min(1, "Le nom est requis")),
  email: z.string().trim().max(254).pipe(z.email("Courriel invalide")),
  phone: singleLine(30).optional().default(""),
  consent: z.literal(true, { error: "Le consentement est requis" }),
  turnstileToken: z.string().min(1).max(4096),
  website: z.string().max(200).optional().default(""),
});

export const eventSchema = z
  .object({
    title: singleLine(200).pipe(z.string().min(1, "Le titre est requis")),
    start: localDateTime,
    end: localDateTime.nullable().optional().default(null),
    location: singleLine(200).optional().default(""),
    description: z.string().trim().max(10_000).optional().default(""),
    imageKey: z
      .string()
      .regex(/^[0-9a-f-]{36}\.(jpg|png|webp)$/)
      .nullable()
      .optional()
      .default(null),
  })
  .refine((e) => e.end === null || e.end >= e.start, {
    message: "La fin doit suivre le début",
    path: ["end"],
  });

// Where `/qr` sends visitors: a path on this site, or an absolute https URL.
export const qrTargetSchema = singleLine(500).refine(
  (v) => /^\/[^\s]*$/.test(v) || /^https:\/\/[^\s]+$/.test(v),
  "La cible doit commencer par / ou par https://",
);

export const settingsSchema = z
  .object({
    showCurrentEvents: z.boolean().optional(),
    qrTarget: qrTargetSchema.optional(),
  })
  .refine((s) => s.showCurrentEvents !== undefined || s.qrTarget !== undefined, "Aucun réglage fourni");
