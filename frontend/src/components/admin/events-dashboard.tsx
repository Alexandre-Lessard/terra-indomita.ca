"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { adminApi, formatEventDate, type AdminEvent } from "@/lib/admin-api";

function isPast(event: AdminEvent, now: string) {
  return (event.end ?? event.start) < now;
}

function nowLocal() {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}:00`;
}

export function EventsDashboard() {
  const [events, setEvents] = useState<AdminEvent[] | null>(null);
  const [showCurrent, setShowCurrent] = useState<boolean | null>(null);
  const [qrTarget, setQrTarget] = useState("");
  const [qrSaved, setQrSaved] = useState("");
  const [qrStatus, setQrStatus] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const [list, settings] = await Promise.all([adminApi.listEvents(), adminApi.getSettings()]);
        if (cancelled) return;
        setEvents(list);
        setShowCurrent(settings.showCurrentEvents);
        setQrTarget(settings.qrTarget);
        setQrSaved(settings.qrTarget);
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : "Une erreur est survenue.");
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  async function toggleCurrent(value: boolean) {
    setShowCurrent(value);
    try {
      await adminApi.updateSettings({ showCurrentEvents: value });
    } catch (err) {
      setShowCurrent(!value);
      setError(err instanceof Error ? err.message : "Réglage non enregistré.");
    }
  }

  async function saveQrTarget() {
    setQrStatus("");
    try {
      const saved = await adminApi.updateSettings({ qrTarget: qrTarget.trim() });
      setQrTarget(saved.qrTarget);
      setQrSaved(saved.qrTarget);
      setQrStatus("Cible enregistrée.");
    } catch (err) {
      setQrStatus(err instanceof Error ? err.message : "Cible non enregistrée.");
    }
  }

  const now = nowLocal();
  const upcoming = (events ?? []).filter((e) => !isPast(e, now)).reverse();
  const past = (events ?? []).filter((e) => isPast(e, now));

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold">Événements</h1>
        <Button asChild>
          <a href="/admin/evenement/">Nouvel événement</a>
        </Button>
      </div>

      {error && (
        <p className="rounded-md bg-red-50 p-3 text-sm text-red-800" role="alert">
          {error}
        </p>
      )}

      {showCurrent !== null && (
        <label className="flex items-start gap-3 rounded-xl border border-[#e5e0d8] bg-white p-4 text-sm">
          <input
            type="checkbox"
            className="mt-0.5 h-4 w-4"
            checked={showCurrent}
            onChange={(e) => toggleCurrent(e.target.checked)}
          />
          <span>
            <strong>Afficher les événements en cours</strong>
            <br />
            Coché : un événement commencé mais pas terminé apparaît « en cours » dans le calendrier.
            Décoché : il passe directement de « à venir » à « passé ».
          </span>
        </label>
      )}

      {showCurrent !== null && (
        <div className="space-y-2 rounded-xl border border-[#e5e0d8] bg-white p-4 text-sm">
          <label className="block" htmlFor="qr-target">
            <strong>Cible du code QR</strong>
            <br />
            Le code QR imprimé sur le dépliant mène à terra-indomita.ca/qr, qui renvoie ici. Une page du
            site (« /decouvrir/ », « /#evenements ») ou une adresse complète (https://…).
          </label>
          <div className="flex flex-wrap gap-2">
            <input
              id="qr-target"
              type="text"
              className="min-w-[16rem] flex-1 rounded-md border border-[#e5e0d8] px-3 py-2"
              value={qrTarget}
              onChange={(e) => setQrTarget(e.target.value)}
            />
            <Button type="button" onClick={saveQrTarget} disabled={qrTarget.trim() === qrSaved}>
              Enregistrer
            </Button>
          </div>
          {qrStatus && <p className="text-[#6b6b6b]">{qrStatus}</p>}
        </div>
      )}

      {events === null && !error && <p className="text-sm text-[#6b6b6b]">Chargement…</p>}

      {events !== null && (
        <>
          <EventTable title="À venir" events={upcoming} empty="Aucun événement à venir." />
          <EventTable title="Passés" events={past} empty="Aucun événement passé." />
        </>
      )}
    </div>
  );
}

function EventTable({ title, events, empty }: { title: string; events: AdminEvent[]; empty: string }) {
  return (
    <section className="space-y-3">
      <h2 className="text-lg font-semibold">{title}</h2>
      {events.length === 0 ? (
        <p className="text-sm text-[#6b6b6b]">{empty}</p>
      ) : (
        <ul className="divide-y divide-[#e5e0d8] overflow-hidden rounded-xl border border-[#e5e0d8] bg-white">
          {events.map((event) => (
            <li key={event.id} className="flex flex-wrap items-center justify-between gap-3 p-4">
              <div>
                <p className="font-semibold">{event.title}</p>
                <p className="text-sm text-[#6b6b6b]">
                  {formatEventDate(event.start)}
                  {event.location ? ` · ${event.location}` : ""}
                </p>
              </div>
              <div className="flex flex-wrap gap-2 text-sm">
                <a
                  className="rounded-md border border-[#e5e0d8] px-3 py-1.5 hover:bg-[#f5f0e8]"
                  href={`/admin/inscriptions/?evenement=${encodeURIComponent(event.id)}`}
                >
                  Inscriptions ({event.registrationCount ?? 0})
                </a>
                <a
                  className="rounded-md border border-[#e5e0d8] px-3 py-1.5 hover:bg-[#f5f0e8]"
                  href={`/admin/evenement/?id=${encodeURIComponent(event.id)}`}
                >
                  Modifier
                </a>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
