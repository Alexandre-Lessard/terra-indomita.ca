"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { submitRegistration } from "@/lib/api";

const schema = z.object({
  name: z.string().min(1, "Le nom est requis").max(100),
  email: z.string().email("Courriel invalide").max(254),
  phone: z.string().max(20).optional().or(z.literal("")),
  website: z.string().max(0).optional(),
});

type FormValues = z.infer<typeof schema>;

interface RegistrationFormProps {
  eventId: string;
}

export function RegistrationForm({ eventId }: RegistrationFormProps) {
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
  });

  async function onSubmit(data: FormValues) {
    if (data.website) return;

    setStatus("submitting");
    try {
      await submitRegistration({
        event: eventId,
        name: data.name,
        email: data.email,
        phone: data.phone || undefined,
      });
      setStatus("success");
    } catch {
      setStatus("error");
    }
  }

  if (status === "success") {
    return (
      <p className="rounded-md bg-green-50 p-3 text-sm text-green-800">
        Inscription envoyée ! Vous recevrez une confirmation bientôt.
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-3 border-t pt-4">
      <p className="text-sm font-semibold">S&apos;inscrire à cet événement</p>

      <div className="hidden" aria-hidden="true">
        <Label htmlFor="website">Site web</Label>
        <Input
          id="website"
          tabIndex={-1}
          autoComplete="off"
          {...register("website")}
        />
      </div>

      <div className="space-y-1">
        <Label htmlFor="reg-name">Nom *</Label>
        <Input
          id="reg-name"
          placeholder="Votre nom"
          {...register("name")}
        />
        {errors.name && (
          <p className="text-xs text-red-600">{errors.name.message}</p>
        )}
      </div>

      <div className="space-y-1">
        <Label htmlFor="reg-email">Courriel *</Label>
        <Input
          id="reg-email"
          type="email"
          placeholder="votre@courriel.com"
          {...register("email")}
        />
        {errors.email && (
          <p className="text-xs text-red-600">{errors.email.message}</p>
        )}
      </div>

      <div className="space-y-1">
        <Label htmlFor="reg-phone">Téléphone</Label>
        <Input
          id="reg-phone"
          type="tel"
          placeholder="(optionnel)"
          {...register("phone")}
        />
      </div>

      {status === "error" && (
        <p className="text-xs text-red-600">
          Une erreur est survenue. Veuillez réessayer.
        </p>
      )}

      <Button type="submit" disabled={status === "submitting"} className="w-full">
        {status === "submitting" ? "Envoi en cours..." : "S'inscrire"}
      </Button>
    </form>
  );
}
