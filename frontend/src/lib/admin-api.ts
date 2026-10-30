import type { AdminSettings } from "./types";
// Client for the Worker's /api/admin routes. Cloudflare Access authenticates
// the browser session; the Worker re-checks the Access token on every call.

export interface AdminEvent {
  id: string;
  title: string;
  start: string;
  end: string | null;
  location: string;
  description: string;
  image: string | null;
  imageKey: string | null;
  registrationCount?: number;
}

export interface EventDraft {
  title: string;
  start: string;
  end: string | null;
  location: string;
  description: string;
  imageKey: string | null;
}

export interface AdminRegistration {
  id: string;
  eventId: string;
  name: string;
  email: string;
  phone: string;
  consentAt: string;
  createdAt: string;
}

export class AdminApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
  }
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  let res: Response;
  try {
    res = await fetch(`/api/admin${path}`, { credentials: "same-origin", ...init });
  } catch {
    throw new AdminApiError("Impossible de joindre le serveur.", 0);
  }
  if (res.status === 204) return undefined as T;
  const body = await res.json().catch(() => ({}));
  if (!res.ok) {
    const fallback = res.status === 403 ? "Accès refusé. Reconnectez-vous." : "Une erreur est survenue.";
    throw new AdminApiError(body.error || fallback, res.status);
  }
  return body.data as T;
}

function json(method: string, data: unknown): RequestInit {
  return { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) };
}

export const adminApi = {
  me: () => request<{ email: string }>("/me"),
  listEvents: () => request<AdminEvent[]>("/events"),
  getEvent: (id: string) => request<AdminEvent>(`/events/${encodeURIComponent(id)}`),
  createEvent: (draft: EventDraft) => request<AdminEvent>("/events", json("POST", draft)),
  updateEvent: (id: string, draft: EventDraft) =>
    request<AdminEvent>(`/events/${encodeURIComponent(id)}`, json("PUT", draft)),
  deleteEvent: (id: string) => request<void>(`/events/${encodeURIComponent(id)}`, { method: "DELETE" }),
  uploadImage: (file: File) => {
    const form = new FormData();
    form.append("file", file);
    return request<{ key: string; url: string }>("/images", { method: "POST", body: form });
  },
  getSettings: () => request<AdminSettings>("/settings"),
  updateSettings: (settings: Partial<AdminSettings>) => request<AdminSettings>("/settings", json("PUT", settings)),
  listRegistrations: (eventId: string) =>
    request<AdminRegistration[]>(`/events/${encodeURIComponent(eventId)}/registrations`),
  registrationsCsvUrl: (eventId: string) => `/api/admin/events/${encodeURIComponent(eventId)}/registrations.csv`,
  deleteRegistration: (id: string) =>
    request<void>(`/registrations/${encodeURIComponent(id)}`, { method: "DELETE" }),
};

/** "2026-08-15T09:00:00" → "15 août 2026, 09 h 00" (naive local time, no shift). */
export function formatEventDate(local: string): string {
  const [datePart, timePart = "00:00"] = local.split("T");
  const [y, m, d] = datePart.split("-").map(Number);
  const [h, mi] = timePart.split(":").map(Number);
  return new Intl.DateTimeFormat("fr-CA", { dateStyle: "long", timeStyle: "short" }).format(
    new Date(y, m - 1, d, h, mi),
  );
}
