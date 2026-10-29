"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { adminApi, formatEventDate, type AdminEvent, type AdminRegistration } from "@/lib/admin-api";

const receivedAt = new Intl.DateTimeFormat("fr-CA", { dateStyle: "medium", timeStyle: "short" });

export function RegistrationsList() {
  const eventId = useSearchParams().get("evenement");
  const [event, setEvent] = useState<AdminEvent | null>(null);
  const [rows, setRows] = useState<AdminRegistration[] | null>(null);
  const [pendingDelete, setPendingDelete] = useState<string | null>(null);
  const [error, setError] = useState(eventId ? "" : "Aucun événement choisi.");

  useEffect(() => {
    if (!eventId) return;
    let cancelled = false;

    async function load(id: string) {
      try {
        const [loadedEvent, registrations] = await Promise.all([
          adminApi.getEvent(id),
          adminApi.listRegistrations(id),
        ]);
        if (cancelled) return;
        setEvent(loadedEvent);
        setRows(registrations);
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : "Chargement impossible.");
      }
    }

    load(eventId);
    return () => {
      cancelled = true;
    };
  }, [eventId]);

  async function remove(id: string) {
    try {
      await adminApi.deleteRegistration(id);
      setRows((prev) => (prev ?? []).filter((r) => r.id !== id));
      setPendingDelete(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Suppression impossible.");
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Inscriptions</h1>
          {event && (
            <p className="text-sm text-[#6b6b6b]">
              {event.title} · {formatEventDate(event.start)}
            </p>
          )}
        </div>
        <a href="/admin/" className="text-sm underline">
          Retour à la liste
        </a>
      </div>

      {error && (
        <p className="rounded-md bg-red-50 p-3 text-sm text-red-800" role="alert">
          {error}
        </p>
      )}

      {eventId && rows && rows.length > 0 && (
        <Button asChild variant="outline">
          <a href={adminApi.registrationsCsvUrl(eventId)}>Télécharger en CSV (Excel)</a>
        </Button>
      )}

      {rows && rows.length === 0 && <p className="text-sm text-[#6b6b6b]">Aucune inscription pour le moment.</p>}

      {rows && rows.length > 0 && (
        <div className="overflow-x-auto rounded-xl border border-[#e5e0d8] bg-white">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-[#e5e0d8] bg-[#fcf9f3]">
              <tr>
                <th className="p-3 font-semibold">Nom</th>
                <th className="p-3 font-semibold">Courriel</th>
                <th className="p-3 font-semibold">Téléphone</th>
                <th className="p-3 font-semibold">Reçue le</th>
                <th className="p-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-[#e5e0d8]">
              {rows.map((r) => (
                <tr key={r.id}>
                  <td className="p-3">{r.name}</td>
                  <td className="p-3">
                    <a className="underline" href={`mailto:${r.email}`}>
                      {r.email}
                    </a>
                  </td>
                  <td className="p-3">{r.phone || "—"}</td>
                  <td className="p-3 whitespace-nowrap">{receivedAt.format(new Date(r.createdAt))}</td>
                  <td className="p-3 text-right whitespace-nowrap">
                    {pendingDelete === r.id ? (
                      <span className="inline-flex gap-2">
                        <button type="button" className="text-red-700 underline" onClick={() => remove(r.id)}>
                          Confirmer
                        </button>
                        <button type="button" className="underline" onClick={() => setPendingDelete(null)}>
                          Annuler
                        </button>
                      </span>
                    ) : (
                      <button type="button" className="underline" onClick={() => setPendingDelete(r.id)}>
                        Supprimer
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <p className="text-xs text-[#6b6b6b]">
        Les inscriptions sont effacées automatiquement douze mois après la fin de l&apos;événement. Une
        personne qui demande le retrait de ses renseignements peut être supprimée ici.
      </p>
    </div>
  );
}
