"use client";

import { useState, useEffect, useCallback } from "react";
import type { Event, EventsByDay, GlobalSettings } from "@/lib/types";
import { fetchEvents, fetchGlobalSettings } from "@/lib/api";
import { hydrateEventsByDay } from "@/lib/date-utils";

interface UseEventsState {
  events: Event[];
  settings: GlobalSettings;
  eventsByDay: EventsByDay;
  monthCursor: Date;
  loading: boolean;
  error: string | null;
  changeMonth: (offset: number) => void;
}

export function useEvents(): UseEventsState {
  const [events, setEvents] = useState<Event[]>([]);
  const [settings, setSettings] = useState<GlobalSettings>({
    showCurrentEvents: true,
  });
  const [eventsByDay, setEventsByDay] = useState<EventsByDay>(new Map());
  const [monthCursor, setMonthCursor] = useState(
    () => new Date(new Date().getFullYear(), new Date().getMonth(), 1),
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const [evts, sett] = await Promise.all([
          fetchEvents(),
          fetchGlobalSettings(),
        ]);
        if (cancelled) return;
        setEvents(evts);
        setSettings(sett);
        setEventsByDay(hydrateEventsByDay(evts));
      } catch (err) {
        if (cancelled) return;
        console.error("Erreur lors du chargement des événements", err);
        setError(
          "Impossible de charger les événements pour le moment. Veuillez réessayer plus tard.",
        );
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const changeMonth = useCallback((offset: number) => {
    setMonthCursor(
      (prev) => new Date(prev.getFullYear(), prev.getMonth() + offset, 1),
    );
  }, []);

  return {
    events,
    settings,
    eventsByDay,
    monthCursor,
    loading,
    error,
    changeMonth,
  };
}
