import type { Event, GlobalSettings, RegistrationPayload } from "./types";

const API_URL = process.env.NEXT_PUBLIC_API_URL!;
const ASSET_URL = process.env.NEXT_PUBLIC_ASSET_URL!;

interface DirectusResponse<T> {
  data: T;
}

interface RawEvent {
  id?: string;
  title?: string;
  start?: string;
  end?: string;
  location?: string;
  description?: string;
  featured_image?: string;
}

function normaliseEvent(raw: RawEvent): Event {
  return {
    id: raw.id || "",
    title: raw.title?.trim() || "Événement Terra Indomita",
    start: raw.start ?? null,
    end: raw.end ?? null,
    location: raw.location?.trim() || "",
    description: raw.description?.trim() || "",
    imageUrl: raw.featured_image ? `${ASSET_URL}/${raw.featured_image}` : "",
  };
}

export async function fetchEvents(): Promise<Event[]> {
  const res = await fetch(
    `${API_URL}/items/events?sort=start&fields=id,title,start,end,location,description,featured_image`,
    { headers: { Accept: "application/json" } },
  );

  if (!res.ok) throw new Error(`Events fetch failed: ${res.status}`);

  const payload: DirectusResponse<RawEvent[]> = await res.json();
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
  const res = await fetch(`${API_URL}/items/global_settings`, {
    headers: { Accept: "application/json" },
  });

  if (!res.ok) throw new Error(`Settings fetch failed: ${res.status}`);

  const payload: DirectusResponse<
    GlobalSettings | GlobalSettings[]
  > = await res.json();
  const data = Array.isArray(payload.data)
    ? payload.data[0]
    : payload.data;

  return { showCurrentEvents: data?.showCurrentEvents ?? true };
}

export async function submitRegistration(
  data: RegistrationPayload,
): Promise<void> {
  const res = await fetch(`${API_URL}/items/event_registrations`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!res.ok) throw new Error(`Registration failed: ${res.status}`);
}
