import type { Event, GlobalSettings, RegistrationPayload } from "./types";

// The site and its API share one origin (the Worker), so every call is relative.

interface ApiEvent {
  id: string;
  title: string;
  start: string | null;
  end: string | null;
  location: string;
  description: string;
  image: string | null;
}

function normaliseEvent(raw: ApiEvent): Event {
  return {
    id: raw.id,
    title: raw.title?.trim() || "Événement Terra Indomita",
    start: raw.start ?? null,
    end: raw.end ?? null,
    location: raw.location?.trim() || "",
    description: raw.description?.trim() || "",
    imageUrl: raw.image || "",
  };
}

export async function fetchEvents(): Promise<Event[]> {
  const res = await fetch("/api/events", { headers: { Accept: "application/json" } });
  if (!res.ok) throw new Error(`Events fetch failed: ${res.status}`);

  const payload: { data: ApiEvent[] } = await res.json();
  return payload.data
    .map(normaliseEvent)
    .filter((e) => Boolean(e.start))
    .sort((a, b) => {
      const aStart = a.start ? new Date(a.start).getTime() : 0;
      const bStart = b.start ? new Date(b.start).getTime() : 0;
      return aStart - bStart;
    });
}

export async function fetchGlobalSettings(): Promise<GlobalSettings> {
  const res = await fetch("/api/settings", { headers: { Accept: "application/json" } });
  if (!res.ok) throw new Error(`Settings fetch failed: ${res.status}`);

  const payload: { data?: Partial<GlobalSettings> } = await res.json();
  return { showCurrentEvents: payload.data?.showCurrentEvents ?? true };
}

/** Thrown when the server refuses a registration; `message` is shown to the visitor. */
export class RegistrationError extends Error {}

export async function submitRegistration(data: RegistrationPayload): Promise<void> {
  let res: Response;
  try {
    res = await fetch("/api/registrations", {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify(data),
    });
  } catch {
    throw new RegistrationError(
      "Impossible de joindre le serveur. Vérifiez votre connexion, puis réessayez.",
    );
  }

  if (res.ok) return;

  const body: { error?: string } = await res.json().catch(() => ({}));
  throw new RegistrationError(body.error || "Une erreur est survenue. Veuillez réessayer.");
}
