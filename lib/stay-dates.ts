/** Stay dates are calendar dates, represented by UTC midnight, never instants in a guest's timezone. */
export const PROPERTY_TIME_ZONE = "America/Chicago";
const DAY_MS = 86_400_000;

export function parseStayDate(value: string): Date {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value))
    throw new Error("Use a valid date (YYYY-MM-DD).");
  const date = new Date(`${value}T00:00:00.000Z`);
  if (
    !Number.isFinite(date.getTime()) ||
    date.toISOString().slice(0, 10) !== value ||
    value < "2000-01-01" ||
    value > "2100-12-31"
  ) {
    throw new Error("Use a real calendar date between 2000 and 2100.");
  }
  return date;
}

export function dateKey(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export function addDays(key: string, days: number): string {
  return dateKey(new Date(parseStayDate(key).getTime() + days * DAY_MS));
}

export function stayNights(checkIn: string, checkOut: string): number {
  return (
    (parseStayDate(checkOut).getTime() - parseStayDate(checkIn).getTime()) /
    DAY_MS
  );
}

export function todayAtProperty(now = new Date()): string {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: PROPERTY_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(now);
  const part = (type: string) => parts.find((p) => p.type === type)!.value;
  return `${part("year")}-${part("month")}-${part("day")}`;
}

export function formatStayDate(value: string | Date): string {
  return (
    typeof value === "string" ? parseStayDate(value) : value
  ).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });
}
