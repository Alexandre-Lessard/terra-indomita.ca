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

const indicatorStyles: Record<EventStatus, string> = {
  upcoming:
    "bg-[rgba(212,164,85,0.3)] border-[rgba(212,164,85,0.45)]",
  current:
    "bg-[rgba(37,109,76,0.28)] border-[rgba(37,109,76,0.45)]",
  past: "bg-[rgba(20,32,18,0.18)] border-[rgba(20,32,18,0.3)]",
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

  const baseClasses = cn(
    "relative flex min-h-[clamp(90px,12vw,110px)] items-start justify-between rounded-xl border border-[rgba(20,32,18,0.16)] bg-[rgba(20,32,18,0.05)] p-3 text-[#0e2514] font-semibold transition-all duration-300",
    isToday &&
      "border-brand-accent shadow-[inset_0_0_0_2px_rgba(212,164,85,0.35)]",
  );

  if (hasEvents) {
    return (
      <button
        type="button"
        onClick={() => onSelect(dateKey)}
        aria-label={label}
        className={cn(
          baseClasses,
          "cursor-pointer outline-none hover:-translate-y-1 hover:border-brand-accent/30 hover:bg-[rgba(20,32,18,0.08)] hover:shadow-[0_12px_32px_-8px_rgba(212,164,85,0.2)] focus-visible:-translate-y-1 focus-visible:border-brand-accent/30 focus-visible:shadow-[0_12px_32px_-8px_rgba(212,164,85,0.2)]",
        )}
      >
        {status && (
          <span
            className={cn(
              "absolute inset-[0.4rem] rounded-[10px] border-2",
              indicatorStyles[status],
            )}
          />
        )}
        <span className="relative z-[1] text-[clamp(1rem,1.8vw,1.2rem)]">
          {day}
        </span>
      </button>
    );
  }

  return (
    <div aria-label={label} className={baseClasses} role="gridcell">
      <span className="relative z-[1] text-[clamp(1rem,1.8vw,1.2rem)]">
        {day}
      </span>
    </div>
  );
}
