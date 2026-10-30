export interface Event {
  id: string;
  title: string;
  start: string | null;
  end: string | null;
  location: string;
  description: string;
  imageUrl: string;
}

export interface GlobalSettings {
  showCurrentEvents: boolean;
}

/** Settings as the admin sees them; the QR code of the printed material points to `/qr`, which redirects to `qrTarget`. */
export interface AdminSettings extends GlobalSettings {
  qrTarget: string;
}

export type EventsByDay = Map<string, Event[]>;

export interface RegistrationPayload {
  event: string;
  name: string;
  email: string;
  phone?: string;
  consent: true;
  turnstileToken: string;
  website?: string;
}

export type EventStatus = "upcoming" | "current" | "past";
