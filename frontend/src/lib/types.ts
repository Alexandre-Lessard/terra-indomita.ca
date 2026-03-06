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

export type EventsByDay = Map<string, Event[]>;

export interface RegistrationPayload {
  event: string;
  name: string;
  email: string;
  phone?: string;
}

export type EventStatus = "upcoming" | "current" | "past";
