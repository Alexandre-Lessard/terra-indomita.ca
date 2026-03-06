import type { Event, EventsByDay, EventStatus } from "./types";

export function formatDateKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function truncateToLocalDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

export function computeStatus(
  event: Event,
  showCurrentEvents: boolean,
): EventStatus {
  const now = new Date();
  const start = event.start ? new Date(event.start) : null;
  const end = event.end ? new Date(event.end) : null;

  if (!start) return "past";
  if (start > now) return "upcoming";

  const sameDay = start.toDateString() === now.toDateString();
  const stillRunning = end ? now <= end : sameDay;

  if (stillRunning && showCurrentEvents) {
    return "current";
  }

  return "past";
}

export function hydrateEventsByDay(events: Event[]): EventsByDay {
  const map: EventsByDay = new Map();

  for (const event of events) {
    const start = event.start ? new Date(event.start) : null;
    if (!start) continue;

    const end = event.end ? new Date(event.end) : null;
    const startDay = truncateToLocalDay(start);
    const endDay = truncateToLocalDay(end || start);

    for (
      const cursor = new Date(startDay);
      cursor <= endDay;
      cursor.setDate(cursor.getDate() + 1)
    ) {
      const key = formatDateKey(cursor);
      const existing = map.get(key) || [];
      existing.push(event);
      map.set(key, existing);
    }
  }

  return map;
}

export function getDayStatus(
  eventsForDay: Event[],
  showCurrentEvents: boolean,
): EventStatus {
  let hasUpcoming = false;
  let hasCurrent = false;

  for (const event of eventsForDay) {
    const status = computeStatus(event, showCurrentEvents);
    if (status === "upcoming") hasUpcoming = true;
    if (status === "current") hasCurrent = true;
  }

  if (hasUpcoming) return "upcoming";
  if (hasCurrent) return "current";
  return "past";
}
