import { describe, expect, it } from "vitest";
import { addMonths, isRegistrationOpen, normalizeLocalDateTime, nowLocal } from "../src/lib/dates";

describe("normalizeLocalDateTime", () => {
  it("adds seconds to a datetime-local value", () => {
    expect(normalizeLocalDateTime("2026-08-15T09:00")).toBe("2026-08-15T09:00:00");
  });

  it("keeps a full value unchanged", () => {
    expect(normalizeLocalDateTime("2026-08-15T09:30:15")).toBe("2026-08-15T09:30:15");
  });

  it("rejects impossible dates and other formats", () => {
    expect(normalizeLocalDateTime("2026-02-30T09:00")).toBeNull();
    expect(normalizeLocalDateTime("2026-08-15T24:00")).toBeNull();
    expect(normalizeLocalDateTime("2026-08-15T09:00:00Z")).toBeNull();
    expect(normalizeLocalDateTime("15/08/2026")).toBeNull();
  });
});

describe("addMonths", () => {
  it("moves back across a year boundary", () => {
    expect(addMonths("2026-03-15T10:00:00", -6)).toBe("2025-09-15T10:00:00");
  });

  it("clamps to the last day of a shorter month", () => {
    expect(addMonths("2026-08-31T08:00:00", -6)).toBe("2026-02-28T08:00:00");
  });
});

describe("nowLocal", () => {
  it("converts UTC to Montreal wall-clock time", () => {
    // 14:30 UTC in summer is 10:30 EDT.
    expect(nowLocal(new Date("2026-07-01T14:30:00Z"))).toBe("2026-07-01T10:30:00");
    // 14:30 UTC in winter is 09:30 EST.
    expect(nowLocal(new Date("2026-01-15T14:30:00Z"))).toBe("2026-01-15T09:30:00");
  });
});

describe("isRegistrationOpen", () => {
  const now = "2026-08-15T12:00:00";

  it("stays open while the event is running", () => {
    expect(isRegistrationOpen({ start: "2026-08-15T09:00:00", end: "2026-08-15T17:00:00" }, now)).toBe(true);
  });

  it("closes once the event has ended", () => {
    expect(isRegistrationOpen({ start: "2026-08-14T09:00:00", end: "2026-08-14T17:00:00" }, now)).toBe(false);
  });

  it("closes at the start when there is no end", () => {
    expect(isRegistrationOpen({ start: "2026-08-15T09:00:00", end: null }, now)).toBe(false);
    expect(isRegistrationOpen({ start: "2026-08-16T09:00:00", end: null }, now)).toBe(true);
  });
});
