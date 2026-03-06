"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { EventDetail } from "./event-detail";
import type { Event } from "@/lib/types";

interface EventModalProps {
  dateKey: string | null;
  events: Event[];
  showCurrentEvents: boolean;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EventModal({
  dateKey,
  events,
  showCurrentEvents,
  open,
  onOpenChange,
}: EventModalProps) {
  const displayDate = dateKey
    ? (() => {
        const [y, m, d] = dateKey.split("-").map(Number);
        return new Intl.DateTimeFormat("fr-CA", { dateStyle: "full" }).format(
          new Date(y, m - 1, d),
        );
      })()
    : "";

  const sorted = [...events].sort((a, b) => {
    const aStart = a.start ? new Date(a.start).getTime() : 0;
    const bStart = b.start ? new Date(b.start).getTime() : 0;
    return aStart - bStart;
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="capitalize">{displayDate}</DialogTitle>
        </DialogHeader>

        {sorted.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Aucun événement n&apos;est prévu pour cette date.
          </p>
        ) : (
          <div className="space-y-6">
            {sorted.map((event, i) => (
              <EventDetail key={`${event.title}-${i}`} event={event} showCurrentEvents={showCurrentEvents} />
            ))}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
