/**
 * Use a single region (`en-US`) so SSR (Node) and the browser emit identical strings.
 * Locale `"en"` alone resolves differently (e.g. comma vs "at" before time).
 */
const LOCALE = "en-US";

const MONTHS_SHORT = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
] as const;

/**
 * No `Intl` — identical in Node and browsers (avoids ICU differences between engines).
 * Uses **UTC**; append " UTC" in the string so the zone is explicit.
 */
export function formatDateTimeMediumUtc(iso: string): string {
  try {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return iso;
    const mon = MONTHS_SHORT[d.getUTCMonth()];
    const day = d.getUTCDate();
    const y = d.getUTCFullYear();
    let h = d.getUTCHours();
    const min = d.getUTCMinutes();
    const ampm = h >= 12 ? "PM" : "AM";
    h = h % 12;
    if (h === 0) h = 12;
    const mm = String(min).padStart(2, "0");
    return `${mon} ${day}, ${y}, ${h}:${mm} ${ampm} UTC`;
  } catch {
    return iso;
  }
}

/** Compact UTC tooltip-style label (still deterministic, no Intl). */
export function formatDateTimeShortUtc(iso: string): string {
  try {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return iso;
    const mon = MONTHS_SHORT[d.getUTCMonth()];
    const day = d.getUTCDate();
    let h = d.getUTCHours();
    const min = d.getUTCMinutes();
    const ampm = h >= 12 ? "PM" : "AM";
    h = h % 12;
    if (h === 0) h = 12;
    const mm = String(min).padStart(2, "0");
    return `${mon} ${day}, ${h}:${mm} ${ampm} UTC`;
  } catch {
    return iso;
  }
}

function formatUtcDatePart(d: Date): string {
  const mon = MONTHS_SHORT[d.getUTCMonth()];
  const day = d.getUTCDate();
  const y = d.getUTCFullYear();
  return `${mon} ${day}, ${y}`;
}

function formatUtcClock(d: Date): string {
  let h = d.getUTCHours();
  const min = d.getUTCMinutes();
  const ampm = h >= 12 ? "PM" : "AM";
  h = h % 12;
  if (h === 0) h = 12;
  const mm = String(min).padStart(2, "0");
  return `${h}:${mm} ${ampm}`;
}

/**
 * Single instant, same calendar day (UTC), or cross-day window — deterministic, matches
 * {@link formatDateTimeMediumUtc} style. Used for grouped incident log rows.
 */
export function formatUtcIncidentWindow(isoStart: string, isoEnd: string): string {
  try {
    const t0 = new Date(isoStart).getTime();
    const t1 = new Date(isoEnd).getTime();
    if (Number.isNaN(t0) || Number.isNaN(t1)) return isoStart;
    if (t0 === t1) return formatDateTimeMediumUtc(isoStart);
    const a = new Date(isoStart);
    const b = new Date(isoEnd);
    const sameUtcDay =
      a.getUTCFullYear() === b.getUTCFullYear() &&
      a.getUTCMonth() === b.getUTCMonth() &&
      a.getUTCDate() === b.getUTCDate();
    if (sameUtcDay) {
      const datePart = formatUtcDatePart(a);
      return `${datePart}, ${formatUtcClock(a)} – ${formatUtcClock(b)} UTC`;
    }
    const sameUtcMonth =
      a.getUTCFullYear() === b.getUTCFullYear() &&
      a.getUTCMonth() === b.getUTCMonth();
    if (sameUtcMonth) {
      const mon = MONTHS_SHORT[a.getUTCMonth()];
      const y = a.getUTCFullYear();
      const d0 = a.getUTCDate();
      const d1 = b.getUTCDate();
      return `${mon} ${d0}–${d1}, ${y}, ${formatUtcClock(a)} – ${formatUtcClock(b)} UTC`;
    }
    return `${formatUtcDatePart(a)}, ${formatUtcClock(a)} – ${formatUtcDatePart(b)}, ${formatUtcClock(b)} UTC`;
  } catch {
    return isoStart;
  }
}

export function formatDateMedium(iso: string): string {
  try {
    return new Intl.DateTimeFormat(LOCALE, { dateStyle: "medium" }).format(
      new Date(iso),
    );
  } catch {
    return iso;
  }
}

export function formatDateTimeMediumShort(iso: string): string {
  try {
    return new Intl.DateTimeFormat(LOCALE, {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}

export function formatDateTimeShortShort(iso: string): string {
  try {
    return new Intl.DateTimeFormat(LOCALE, {
      dateStyle: "short",
      timeStyle: "short",
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}
