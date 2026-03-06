import { Button } from "@/components/ui/button";
import { CalendarCell } from "./calendar-cell";
import type { EventsByDay } from "@/lib/types";
import { formatDateKey, getDayStatus } from "@/lib/date-utils";

interface CalendarProps {
  monthCursor: Date;
  eventsByDay: EventsByDay;
  showCurrentEvents: boolean;
  onChangeMonth: (offset: number) => void;
  onSelectDate: (dateKey: string) => void;
}

const WEEKDAYS = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];

export function Calendar({
  monthCursor,
  eventsByDay,
  showCurrentEvents,
  onChangeMonth,
  onSelectDate,
}: CalendarProps) {
  const year = monthCursor.getFullYear();
  const month = monthCursor.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const startOffset = (new Date(year, month, 1).getDay() + 6) % 7;
  const todayKey = formatDateKey(new Date());

  const monthLabel = new Intl.DateTimeFormat("fr-CA", {
    month: "long",
    year: "numeric",
  }).format(monthCursor);

  return (
    <div className="mx-auto max-w-md rounded-xl border bg-white/80 p-4 shadow-sm backdrop-blur-sm">
      <div className="mb-4 flex items-center justify-between">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onChangeMonth(-1)}
          aria-label="Mois précédent"
        >
          ‹
        </Button>
        <h2 className="text-lg font-semibold capitalize" aria-live="polite">
          {monthLabel}
        </h2>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onChangeMonth(1)}
          aria-label="Mois suivant"
        >
          ›
        </Button>
      </div>

      <div className="mb-2 grid grid-cols-7 text-center text-xs font-medium text-muted-foreground">
        {WEEKDAYS.map((d) => (
          <span key={d}>{d}</span>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1" role="grid" aria-label={monthLabel}>
        {Array.from({ length: startOffset }, (_, i) => (
          <div key={`filler-${i}`} role="gridcell" />
        ))}

        {Array.from({ length: daysInMonth }, (_, i) => {
          const day = i + 1;
          const dateKey = formatDateKey(new Date(year, month, day));
          const eventsForDay = eventsByDay.get(dateKey) || [];
          const status =
            eventsForDay.length > 0
              ? getDayStatus(eventsForDay, showCurrentEvents)
              : null;

          return (
            <CalendarCell
              key={dateKey}
              day={day}
              dateKey={dateKey}
              isToday={dateKey === todayKey}
              events={eventsForDay}
              status={status}
              onSelect={onSelectDate}
            />
          );
        })}
      </div>
    </div>
  );
}
