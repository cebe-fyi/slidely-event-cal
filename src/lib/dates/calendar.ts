export const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];
export const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

// Calendar dates are labels, not instants. UTC arithmetic avoids local DST shifts.
export function dateKey(year: number, month: number, day: number): string {
  return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

export function daysInMonth(year: number, month: number): number {
  return new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
}

export function monthCells(
  year: number,
  month: number,
): { key: string; day: number; inMonth: boolean }[] {
  const offset = (new Date(Date.UTC(year, month, 1)).getUTCDay() + 6) % 7;
  const count = Math.ceil((offset + daysInMonth(year, month)) / 7) * 7;
  return Array.from({ length: count }, (_, i) => {
    const date = new Date(Date.UTC(year, month, i - offset + 1));
    return {
      key: dateKey(
        date.getUTCFullYear(),
        date.getUTCMonth(),
        date.getUTCDate(),
      ),
      day: date.getUTCDate(),
      inMonth: date.getUTCMonth() === month,
    };
  });
}

export function periodBounds(year: number, month?: number): [string, string] {
  return month === undefined
    ? [dateKey(year, 0, 1), dateKey(year, 11, 31)]
    : [dateKey(year, month, 1), dateKey(year, month, daysInMonth(year, month))];
}

export function overlaps(
  start: string,
  end: string,
  rangeStart: string,
  rangeEnd: string,
): boolean {
  return start <= rangeEnd && end >= rangeStart;
}

export function prettyDate(value: string, includeYear = false): string {
  const [year, month, day] = value.split("-").map(Number);
  return `${day} ${MONTHS[month - 1].slice(0, 3)}${includeYear ? ` ${year}` : ""}`;
}

export function dateRange(start: string, end: string): string {
  return start === end
    ? prettyDate(start)
    : `${prettyDate(start)} – ${prettyDate(end)}`;
}

export function isValidDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const [year, month, day] = value.split("-").map(Number);
  return (
    year >= 1900 &&
    year <= 2200 &&
    month >= 1 &&
    month <= 12 &&
    day >= 1 &&
    day <= daysInMonth(year, month - 1)
  );
}
