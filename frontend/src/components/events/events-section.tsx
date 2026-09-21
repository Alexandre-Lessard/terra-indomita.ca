"use client";

import { useState } from "react";
import { motion } from "framer-motion";
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
    <section className="bg-white py-24" id="evenements">
      <div className="mx-auto max-w-[1100px] px-4">
        <motion.p
          className="mb-12 text-center text-xl font-semibold uppercase tracking-[0.2em] text-[#1c3120]"
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          Événements
        </motion.p>

        {loading && (
          <div className="rounded-[14px] border border-[rgba(20,32,18,0.18)] bg-[rgba(252,249,243,0.72)] p-8 shadow-[0_18px_36px_-20px_rgba(20,32,18,0.4)]">
            <div className="mx-auto mb-8 h-8 w-48 animate-pulse rounded-md bg-[rgba(20,32,18,0.08)]" />
            <div className="grid grid-cols-7 gap-[0.35rem]">
              {Array.from({ length: 35 }, (_, i) => (
                <div
                  key={i}
                  className="min-h-[clamp(90px,12vw,110px)] animate-pulse rounded-xl bg-[rgba(20,32,18,0.06)]"
                />
              ))}
            </div>
          </div>
        )}

        {error && (
          <p className="text-center text-sm text-[rgba(14,37,20,0.5)]" role="status">
            {error}
          </p>
        )}

        {!loading && !error && (
          <>
            {events.length === 0 ? (
              <p
                className="text-center text-sm text-[rgba(14,37,20,0.5)]"
                role="status"
              >
                Aucun événement n&apos;est planifié pour le moment. Revenez
                bientôt !
              </p>
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.1 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
              >
                <Calendar
                  monthCursor={monthCursor}
                  eventsByDay={eventsByDay}
                  showCurrentEvents={settings.showCurrentEvents}
                  onChangeMonth={changeMonth}
                  onSelectDate={handleSelectDate}
                />
              </motion.div>
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
