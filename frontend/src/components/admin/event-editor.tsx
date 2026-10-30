"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { adminApi, AdminApiError, type AdminEvent, type EventDraft } from "@/lib/admin-api";

interface FormState {
  title: string;
  start: string;
  end: string;
  location: string;
  description: string;
  imageKey: string | null;
  imageUrl: string | null;
}

const EMPTY: FormState = {
  title: "",
  start: "",
  end: "",
  location: "",
  description: "",
  imageKey: null,
  imageUrl: null,
};

// <input type="datetime-local"> works in minutes; the API stores seconds.
const toInput = (value: string | null) => (value ? value.slice(0, 16) : "");

function fromEvent(event: AdminEvent): FormState {
  return {
    title: event.title,
    start: toInput(event.start),
    end: toInput(event.end),
    location: event.location,
    description: event.description,
    imageKey: event.imageKey,
    imageUrl: event.image,
  };
}

export function EventEditor() {
  const router = useRouter();
  const id = useSearchParams().get("id");
  const [form, setForm] = useState<FormState>(EMPTY);
  const [registrationCount, setRegistrationCount] = useState(0);
  const [loading, setLoading] = useState(Boolean(id));
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!id) return;
    let cancelled = false;

    async function load(eventId: string) {
      try {
        const [event, registrations] = await Promise.all([
          adminApi.getEvent(eventId),
          adminApi.listRegistrations(eventId),
        ]);
        if (cancelled) return;
        setForm(fromEvent(event));
        setRegistrationCount(registrations.length);
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : "Événement introuvable.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load(id);
    return () => {
      cancelled = true;
    };
  }, [id]);

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function onImageChange(file: File | undefined) {
    if (!file) return;
    setUploading(true);
    setError("");
    try {
      const uploaded = await adminApi.uploadImage(file);
      setForm((prev) => ({ ...prev, imageKey: uploaded.key, imageUrl: uploaded.url }));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Téléversement impossible.");
    } finally {
      setUploading(false);
    }
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!form.title.trim() || !form.start) {
      setError("Le titre et la date de début sont requis.");
      return;
    }
    if (form.end && form.end < form.start) {
      setError("La fin doit suivre le début.");
      return;
    }

    const draft: EventDraft = {
      title: form.title.trim(),
      start: form.start,
      end: form.end || null,
      location: form.location.trim(),
      description: form.description,
      imageKey: form.imageKey,
    };

    setSaving(true);
    try {
      if (id) await adminApi.updateEvent(id, draft);
      else await adminApi.createEvent(draft);
      router.push("/admin/");
    } catch (err) {
      setError(err instanceof AdminApiError ? err.message : "Enregistrement impossible.");
      setSaving(false);
    }
  }

  async function onDelete() {
    if (!id) return;
    setSaving(true);
    try {
      await adminApi.deleteEvent(id);
      router.push("/admin/");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Suppression impossible.");
      setSaving(false);
    }
  }

  if (loading) return <p className="text-sm text-[#6b6b6b]">Chargement…</p>;

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold">{id ? "Modifier l'événement" : "Nouvel événement"}</h1>
        <a href="/admin/" className="text-sm underline">
          Retour à la liste
        </a>
      </div>

      {error && (
        <p className="rounded-md bg-red-50 p-3 text-sm text-red-800" role="alert">
          {error}
        </p>
      )}

      <div className="space-y-5 rounded-xl border border-[#e5e0d8] bg-white p-6">
        <div className="space-y-1">
          <Label htmlFor="title">Titre *</Label>
          <Input id="title" value={form.title} onChange={(e) => update("title", e.target.value)} maxLength={200} />
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <div className="space-y-1">
            <Label htmlFor="start">Début *</Label>
            <Input
              id="start"
              type="datetime-local"
              value={form.start}
              onChange={(e) => update("start", e.target.value)}
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="end">Fin</Label>
            <Input id="end" type="datetime-local" value={form.end} onChange={(e) => update("end", e.target.value)} />
            <p className="text-xs text-[#6b6b6b]">
              Facultative. Sans fin, les inscriptions ferment à l&apos;heure de début.
            </p>
          </div>
        </div>

        <div className="space-y-1">
          <Label htmlFor="location">Lieu</Label>
          <Input
            id="location"
            value={form.location}
            onChange={(e) => update("location", e.target.value)}
            maxLength={200}
          />
        </div>

        <div className="space-y-1">
          <Label htmlFor="description">Description</Label>
          <textarea
            id="description"
            rows={8}
            value={form.description}
            onChange={(e) => update("description", e.target.value)}
            maxLength={10000}
            className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-base shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 md:text-sm"
          />
          <p className="text-xs text-[#6b6b6b]">Les retours à la ligne sont conservés sur le site.</p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="image">Image</Label>
          {form.imageUrl && (
            // eslint-disable-next-line @next/next/no-img-element -- R2 image, served as-is.
            <img src={form.imageUrl} alt="" className="max-h-64 rounded-lg border border-[#e5e0d8] object-contain" />
          )}
          <div className="flex flex-wrap items-center gap-3">
            <input
              id="image"
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={(e) => onImageChange(e.target.files?.[0])}
              className="text-sm"
            />
            {form.imageKey && (
              <button
                type="button"
                className="text-sm underline"
                onClick={() => setForm((prev) => ({ ...prev, imageKey: null, imageUrl: null }))}
              >
                Retirer l&apos;image
              </button>
            )}
          </div>
          <p className="text-xs text-[#6b6b6b]">JPEG, PNG ou WebP, 8 Mo au maximum.</p>
          {uploading && <p className="text-sm text-[#6b6b6b]">Téléversement…</p>}
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4">
        <Button type="submit" disabled={saving || uploading}>
          {saving ? "Enregistrement…" : "Enregistrer"}
        </Button>

        {id &&
          (confirmDelete ? (
            <div className="flex flex-wrap items-center gap-3 text-sm">
              <span>
                Supprimer définitivement
                {registrationCount > 0 ? ` cet événement et ses ${registrationCount} inscription(s)` : " cet événement"} ?
              </span>
              <Button type="button" variant="destructive" onClick={onDelete} disabled={saving}>
                Oui, supprimer
              </Button>
              <Button type="button" variant="outline" onClick={() => setConfirmDelete(false)}>
                Annuler
              </Button>
            </div>
          ) : (
            <Button type="button" variant="outline" onClick={() => setConfirmDelete(true)}>
              Supprimer l&apos;événement
            </Button>
          ))}
      </div>
    </form>
  );
}
