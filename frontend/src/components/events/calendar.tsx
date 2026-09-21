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
    <div className="rounded-[14px] border border-[rgba(20,32,18,0.18)] bg-[rgba(252,249,243,0.72)] p-8 shadow-[0_18px_36px_-20px_rgba(20,32,18,0.4)]">
      <div className="mb-8 flex items-center justify-between gap-4">
        <button
          onClick={() => onChangeMonth(-1)}
          aria-label="Mois précédent"
          className="flex h-10 w-10 items-center justify-center rounded-full bg-[rgba(20,32,18,0.12)] text-[1.4rem] text-[#0e2514] transition-all duration-200 hover:bg-brand-accent hover:text-white hover:shadow-[0_4px_12px_-2px_rgba(212,164,85,0.4)]"
        >
          ‹
        </button>
        <h2
          className="text-[clamp(1.3rem,2vw,1.6rem)] font-semibold capitalize"
          aria-live="polite"
        >
          {monthLabel}
        </h2>
        <button
          onClick={() => onChangeMonth(1)}
          aria-label="Mois suivant"
          className="flex h-10 w-10 items-center justify-center rounded-full bg-[rgba(20,32,18,0.12)] text-[1.4rem] text-[#0e2514] transition-all duration-200 hover:bg-brand-accent hover:text-white hover:shadow-[0_4px_12px_-2px_rgba(212,164,85,0.4)]"
        >
          ›
        </button>
      </div>

      <div className="mb-1 grid grid-cols-7 gap-[0.35rem] text-center text-[0.8rem] font-bold uppercase tracking-wider text-[rgba(14,37,20,0.7)]">
        {WEEKDAYS.map((d) => (
          <span key={d}>{d}</span>
        ))}
      </div>

      <div
        className="grid grid-cols-[repeat(7,minmax(0,1fr))] gap-[0.35rem]"
        role="grid"
        aria-label={monthLabel}
      >
        {Array.from({ length: startOffset }, (_, i) => (
          <div key={`filler-${i}`} className="invisible" role="gridcell" />
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
