import Image from "next/image";
import type { Event } from "@/lib/types";
import { computeStatus } from "@/lib/date-utils";
import { RegistrationForm } from "./registration-form";

interface EventDetailProps {
  event: Event;
  showCurrentEvents: boolean;
}

export function EventDetail({ event, showCurrentEvents }: EventDetailProps) {
  const status = computeStatus(event, showCurrentEvents);
  const showRegistration = status === "upcoming" || status === "current";
  const start = event.start ? new Date(event.start) : null;
  const end = event.end ? new Date(event.end) : null;

  const dateFormatter = new Intl.DateTimeFormat("fr-CA", { dateStyle: "long" });
  const timeFormatter = new Intl.DateTimeFormat("fr-CA", {
    timeStyle: "short",
  });

  let datetimeText = "Date à confirmer";
  if (start && !end) {
    datetimeText = `${dateFormatter.format(start)} · ${timeFormatter.format(start)}`;
  } else if (start && end && start.toDateString() === end.toDateString()) {
    datetimeText = `${dateFormatter.format(start)} · ${timeFormatter.format(start)} – ${timeFormatter.format(end)}`;
  } else if (start && end) {
    datetimeText = `${dateFormatter.format(start)} → ${dateFormatter.format(end)}`;
  }

  return (
    <article className="space-y-3">
      {event.imageUrl && (
        <div className="relative aspect-video overflow-hidden rounded-md">
          <Image
            src={event.imageUrl}
            alt={event.title}
            fill
            className="object-contain"
          />
        </div>
      )}

      <h4 className="text-lg font-semibold">{event.title}</h4>
      <p className="text-sm text-muted-foreground">{datetimeText}</p>

      {event.location && (
        <p className="text-sm text-muted-foreground">{event.location}</p>
      )}

      {event.description && (
        <p className="text-sm whitespace-pre-line">{event.description}</p>
      )}

      {showRegistration && <RegistrationForm eventId={event.id} />}
    </article>
  );
}
