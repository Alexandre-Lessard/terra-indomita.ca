"use client";

import { useState } from "react";
import { useEvents } from "./use-events";
import { Calendar } from "./calendar";
import { EventModal } from "./event-modal";

export function EventsSection() {
  const {
    events,
    settings,
    eventsByDay,
    monthCursor,
    loading,
    error,
    changeMonth,
  } = useEvents();

  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  function handleSelectDate(dateKey: string) {
    setSelectedDate(dateKey);
    setModalOpen(true);
  }

  return (
    <section className="bg-white py-16" id="evenements">
      <div className="mx-auto max-w-[1100px] px-4">
        <p className="mb-8 text-center text-sm font-semibold uppercase tracking-widest text-brand-dark">
          Événements
        </p>

        {loading && (
          <div className="mx-auto max-w-md">
            <div className="grid grid-cols-7 gap-1 rounded-xl border bg-white/80 p-4">
              {Array.from({ length: 42 }, (_, i) => (
                <div
                  key={i}
                  className="h-10 animate-pulse rounded-md bg-gray-200"
                />
              ))}
            </div>
          </div>
        )}

        {error && (
          <p className="text-center text-sm text-muted-foreground" role="status">
            {error}
          </p>
        )}

        {!loading && !error && (
          <>
            {events.length === 0 ? (
              <p
                className="text-center text-sm text-muted-foreground"
                role="status"
              >
                Aucun événement n&apos;est planifié pour le moment. Revenez
                bientôt !
              </p>
            ) : (
              <Calendar
                monthCursor={monthCursor}
                eventsByDay={eventsByDay}
                showCurrentEvents={settings.showCurrentEvents}
                onChangeMonth={changeMonth}
                onSelectDate={handleSelectDate}
              />
            )}
          </>
        )}
      </div>

      <EventModal
        dateKey={selectedDate}
        events={selectedDate ? eventsByDay.get(selectedDate) || [] : []}
        showCurrentEvents={settings.showCurrentEvents}
        open={modalOpen}
        onOpenChange={setModalOpen}
      />
    </section>
  );
}
