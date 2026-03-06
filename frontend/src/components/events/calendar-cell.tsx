import type { Event, EventStatus } from "@/lib/types";
import { cn } from "@/lib/utils";

interface CalendarCellProps {
  day: number;
  dateKey: string;
  isToday: boolean;
  events: Event[];
  status: EventStatus | null;
  onSelect: (dateKey: string) => void;
}

const statusColors: Record<EventStatus, string> = {
  upcoming: "bg-brand-accent",
  current: "bg-green-500",
  past: "bg-gray-400",
};

export function CalendarCell({
  day,
  dateKey,
  isToday,
  events,
  status,
  onSelect,
}: CalendarCellProps) {
  const hasEvents = events.length > 0;

  const label = `${dateKey}${hasEvents ? `. ${events.length} événement(s)` : ""}`;

  if (hasEvents) {
    return (
      <button
        type="button"
        onClick={() => onSelect(dateKey)}
        aria-label={label}
        className={cn(
          "relative flex h-10 w-full items-center justify-center rounded-md text-sm font-medium transition-colors hover:bg-brand-accent/20",
          isToday && "ring-2 ring-brand-accent",
        )}
      >
        {status && (
          <span
            className={cn(
              "absolute top-1 right-1 h-2 w-2 rounded-full",
              statusColors[status],
            )}
          />
        )}
        {day}
      </button>
    );
  }

  return (
    <div
      aria-label={label}
      className={cn(
        "flex h-10 items-center justify-center rounded-md text-sm text-muted-foreground",
        isToday && "ring-2 ring-brand-accent",
      )}
    >
      {day}
    </div>
  );
}
