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
    <article className="space-y-3 border-l-4 border-brand-accent pl-5">
      {event.imageUrl && (
        <div className="relative aspect-video overflow-hidden rounded-lg">
          <Image
            src={event.imageUrl}
            alt={event.title}
            fill
            className="object-contain"
          />
        </div>
      )}

      <h4 className="text-[1.15rem] font-semibold text-[#0e2514]">
        {event.title}
      </h4>
      <p className="text-[0.9rem] text-[rgba(14,37,20,0.6)]">
        {datetimeText}
      </p>

      {event.location && (
        <p className="text-[0.9rem] text-[rgba(14,37,20,0.6)]">
          {event.location}
        </p>
      )}

      {event.description && (
        <p className="text-[0.95rem] leading-relaxed whitespace-pre-line text-[#0e2514]">
          {event.description}
        </p>
      )}

      {showRegistration && <RegistrationForm eventId={event.id} />}
    </article>
  );
}
