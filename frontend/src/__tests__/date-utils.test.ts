import { describe, it, expect, vi, afterEach } from "vitest";
import {
  formatDateKey,
  truncateToLocalDay,
  computeStatus,
  hydrateEventsByDay,
  getDayStatus,
} from "@/lib/date-utils";
import type { Event } from "@/lib/types";

function makeEvent(overrides: Partial<Event> = {}): Event {
  return {
    id: "1",
    title: "Test",
    start: null,
    end: null,
    location: "",
    description: "",
    imageUrl: "",
    ...overrides,
  };
}

describe("formatDateKey", () => {
  it("formats a date as YYYY-MM-DD", () => {
    expect(formatDateKey(new Date(2026, 2, 5))).toBe("2026-03-05");
  });

  it("zero-pads single-digit months and days", () => {
    expect(formatDateKey(new Date(2026, 0, 3))).toBe("2026-01-03");
  });
});

describe("truncateToLocalDay", () => {
  it("removes the time portion", () => {
    const result = truncateToLocalDay(new Date(2026, 5, 15, 14, 30));
    expect(result.getHours()).toBe(0);
    expect(result.getMinutes()).toBe(0);
    expect(result.getDate()).toBe(15);
  });
});

describe("computeStatus", () => {
  afterEach(() => vi.useRealTimers());

  it("returns 'past' when no start date", () => {
    const event = makeEvent();
    expect(computeStatus(event, true)).toBe("past");
  });

  it("returns 'upcoming' when start is in the future", () => {
    vi.useFakeTimers({ now: new Date(2026, 2, 5, 10, 0) });
    const event = makeEvent({ start: "2026-04-01T10:00:00" });
    expect(computeStatus(event, true)).toBe("upcoming");
  });

  it("returns 'current' for a same-day event with showCurrentEvents", () => {
    vi.useFakeTimers({ now: new Date(2026, 2, 5, 14, 0) });
    const event = makeEvent({ start: "2026-03-05T10:00:00" });
    expect(computeStatus(event, true)).toBe("current");
  });

  it("returns 'past' for a same-day event without showCurrentEvents", () => {
    vi.useFakeTimers({ now: new Date(2026, 2, 5, 14, 0) });
    const event = makeEvent({ start: "2026-03-05T10:00:00" });
    expect(computeStatus(event, false)).toBe("past");
  });

  it("returns 'current' for a multi-day event still running", () => {
    vi.useFakeTimers({ now: new Date(2026, 2, 6, 10, 0) });
    const event = makeEvent({
      start: "2026-03-05T10:00:00",
      end: "2026-03-07T18:00:00",
    });
    expect(computeStatus(event, true)).toBe("current");
  });

  it("returns 'past' for a multi-day event that has ended", () => {
    vi.useFakeTimers({ now: new Date(2026, 2, 10, 10, 0) });
    const event = makeEvent({
      start: "2026-03-05T10:00:00",
      end: "2026-03-07T18:00:00",
    });
    expect(computeStatus(event, true)).toBe("past");
  });
});

describe("hydrateEventsByDay", () => {
  it("maps a single-day event to its date key", () => {
    const event = makeEvent({ start: "2026-03-05T10:00:00" });
    const map = hydrateEventsByDay([event]);
    expect(map.get("2026-03-05")).toEqual([event]);
    expect(map.size).toBe(1);
  });

  it("spreads a multi-day event across all days", () => {
    const event = makeEvent({
      start: "2026-03-05T10:00:00",
      end: "2026-03-07T18:00:00",
    });
    const map = hydrateEventsByDay([event]);
    expect(map.size).toBe(3);
    expect(map.get("2026-03-05")).toEqual([event]);
    expect(map.get("2026-03-06")).toEqual([event]);
    expect(map.get("2026-03-07")).toEqual([event]);
  });

  it("skips events without a start date", () => {
    const event = makeEvent();
    const map = hydrateEventsByDay([event]);
    expect(map.size).toBe(0);
  });
});

describe("getDayStatus", () => {
  afterEach(() => vi.useRealTimers());

  it("returns 'upcoming' if any event is upcoming", () => {
    vi.useFakeTimers({ now: new Date(2026, 2, 5, 10, 0) });
    const events = [
      makeEvent({ start: "2026-02-01T10:00:00" }),
      makeEvent({ start: "2026-04-01T10:00:00" }),
    ];
    expect(getDayStatus(events, true)).toBe("upcoming");
  });

  it("returns 'past' if all events are past", () => {
    vi.useFakeTimers({ now: new Date(2026, 2, 5, 10, 0) });
    const events = [makeEvent({ start: "2026-01-01T10:00:00" })];
    expect(getDayStatus(events, true)).toBe("past");
  });
});
