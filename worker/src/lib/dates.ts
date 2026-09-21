// Event dates are stored and served as naive local times in the school's
// timezone ("2026-08-15T09:00:00"), the format the frontend already parses.

export const SITE_TIMEZONE = "America/Toronto";

const LOCAL_DATETIME = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})(?::(\d{2}))?$/;

/** Accepts "YYYY-MM-DDTHH:mm" or "YYYY-MM-DDTHH:mm:ss"; returns seconds form or null. */
export function normalizeLocalDateTime(value: string): string | null {
  const match = LOCAL_DATETIME.exec(value.trim());
  if (!match) return null;
  const [, y, mo, d, h, mi, s = "00"] = match;
  const date = new Date(Date.UTC(+y, +mo - 1, +d, +h, +mi, +s));
  if (
    date.getUTCFullYear() !== +y ||
    date.getUTCMonth() !== +mo - 1 ||
    date.getUTCDate() !== +d ||
    +h > 23 ||
    +mi > 59 ||
    +s > 59
  ) {
    return null;
  }
  return `${y}-${mo}-${d}T${h}:${mi}:${s}`;
}

/** Current wall-clock time in the site timezone, as a naive local string. */
export function nowLocal(now: Date = new Date()): string {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: SITE_TIMEZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23",
  }).formatToParts(now);
  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? "00";
  return `${get("year")}-${get("month")}-${get("day")}T${get("hour")}:${get("minute")}:${get("second")}`;
}

/** Shifts a naive local string by whole months, clamping to the month's last day. */
export function addMonths(local: string, months: number): string {
  const normalized = normalizeLocalDateTime(local);
  if (!normalized) throw new Error(`Invalid local datetime: ${local}`);
  const [datePart, timePart] = normalized.split("T");
  const [y, m, d] = datePart.split("-").map(Number);
  const target = new Date(Date.UTC(y, m - 1 + months, 1));
  const lastDay = new Date(Date.UTC(target.getUTCFullYear(), target.getUTCMonth() + 1, 0)).getUTCDate();
  const day = Math.min(d, lastDay);
  const mm = String(target.getUTCMonth() + 1).padStart(2, "0");
  const dd = String(day).padStart(2, "0");
  return `${target.getUTCFullYear()}-${mm}-${dd}T${timePart}`;
}

/** Registration stays open until the event ends (or starts, when it has no end). */
export function isRegistrationOpen(event: { start: string; end: string | null }, now: string): boolean {
  return (event.end ?? event.start) > now;
}
