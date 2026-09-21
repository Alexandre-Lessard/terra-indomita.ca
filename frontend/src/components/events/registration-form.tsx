"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Turnstile } from "@marsidev/react-turnstile";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RegistrationError, submitRegistration } from "@/lib/api";

// Cloudflare's always-pass test key keeps local development working offline.
const TURNSTILE_SITE_KEY =
  process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || "1x00000000000000000000AA";

const schema = z.object({
  name: z.string().trim().min(1, "Le nom est requis").max(100),
  email: z.string().trim().pipe(z.email("Courriel invalide")).pipe(z.string().max(254)),
  phone: z.string().max(30).optional().or(z.literal("")),
  consent: z.boolean().refine((v) => v, "Votre consentement est requis pour vous inscrire"),
  website: z.string().max(0).optional(),
});

type FormValues = z.infer<typeof schema>;

interface RegistrationFormProps {
  eventId: string;
}

export function RegistrationForm({ eventId }: RegistrationFormProps) {
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [turnstileToken, setTurnstileToken] = useState("");
  // Bumping the key remounts the widget, which fetches a fresh token.
  const [turnstileKey, setTurnstileKey] = useState(0);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { consent: false },
  });

  async function onSubmit(data: FormValues) {
    if (data.website) return;

    if (!turnstileToken) {
      setStatus("error");
      setErrorMessage("Veuillez patienter pendant la vérification anti-robot, puis réessayer.");
      return;
    }

    setStatus("submitting");
    try {
      await submitRegistration({
        event: eventId,
        name: data.name,
        email: data.email,
        phone: data.phone || undefined,
        consent: true,
        turnstileToken,
      });
      setStatus("success");
    } catch (err) {
      setStatus("error");
      setErrorMessage(
        err instanceof RegistrationError ? err.message : "Une erreur est survenue. Veuillez réessayer.",
      );
      // A Turnstile token is single-use; get a fresh one for the next attempt.
      setTurnstileToken("");
      setTurnstileKey((k) => k + 1);
    }
  }

  if (status === "success") {
    return (
      <p className="rounded-md bg-green-50 p-3 text-sm text-green-800" role="status">
        Inscription reçue, merci ! Terra Indomita vous contactera par courriel pour confirmer votre
        place.
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-3 border-t pt-4" noValidate>
      <p className="text-sm font-semibold">S&apos;inscrire à cet événement</p>

      <div className="hidden" aria-hidden="true">
        <Label htmlFor="website">Site web</Label>
        <Input id="website" tabIndex={-1} autoComplete="off" {...register("website")} />
      </div>

      <div className="space-y-1">
        <Label htmlFor={`reg-name-${eventId}`}>Nom *</Label>
        <Input
          id={`reg-name-${eventId}`}
          placeholder="Votre nom"
          autoComplete="name"
          {...register("name")}
        />
        {errors.name && <p className="text-xs text-red-600">{errors.name.message}</p>}
      </div>

      <div className="space-y-1">
        <Label htmlFor={`reg-email-${eventId}`}>Courriel *</Label>
        <Input
          id={`reg-email-${eventId}`}
          type="email"
          placeholder="votre@courriel.com"
          autoComplete="email"
          {...register("email")}
        />
        {errors.email && <p className="text-xs text-red-600">{errors.email.message}</p>}
      </div>

      <div className="space-y-1">
        <Label htmlFor={`reg-phone-${eventId}`}>Téléphone</Label>
        <Input
          id={`reg-phone-${eventId}`}
          type="tel"
          placeholder="(optionnel)"
          autoComplete="tel"
          {...register("phone")}
        />
      </div>

      <div className="space-y-1">
        <label className="flex items-start gap-2 text-xs leading-relaxed text-[rgba(14,37,20,0.8)]">
          <input type="checkbox" className="mt-0.5 h-4 w-4 shrink-0" {...register("consent")} />
          <span>
            J&apos;accepte que Terra Indomita utilise ces renseignements pour gérer mon inscription
            et me joindre à son sujet, comme le décrit la{" "}
            <a href="/confidentialite/" target="_blank" className="underline">
              politique de confidentialité
            </a>
            .
          </span>
        </label>
        {errors.consent && <p className="text-xs text-red-600">{errors.consent.message}</p>}
      </div>

      <Turnstile
        key={turnstileKey}
        siteKey={TURNSTILE_SITE_KEY}
        options={{ language: "fr", size: "flexible" }}
        onSuccess={setTurnstileToken}
        onExpire={() => setTurnstileToken("")}
        onError={() => setTurnstileToken("")}
      />

      {status === "error" && (
        <p className="text-xs text-red-600" role="alert">
          {errorMessage}
        </p>
      )}

      <Button type="submit" disabled={status === "submitting"} className="w-full">
        {status === "submitting" ? "Envoi en cours..." : "S'inscrire"}
      </Button>
    </form>
  );
}
