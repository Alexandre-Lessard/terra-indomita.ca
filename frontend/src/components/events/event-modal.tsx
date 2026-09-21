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
      <DialogContent className="max-h-[90vh] max-w-[680px] overflow-y-auto rounded-[18px] border border-[rgba(20,32,18,0.14)] bg-[#fcf9f3] p-[2.4rem] shadow-[0_24px_56px_-20px_rgba(20,32,18,0.45)]">
        <DialogHeader>
          <DialogTitle className="text-[1.35rem] font-semibold capitalize text-[#0e2514]">
            {displayDate}
          </DialogTitle>
        </DialogHeader>

        {sorted.length === 0 ? (
          <p className="text-[0.95rem] text-[rgba(14,37,20,0.6)]">
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
