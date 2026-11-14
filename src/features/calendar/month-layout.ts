import { monthCells, overlaps } from "@/lib/dates/calendar";
import type { TeamEvent } from "../events/types";

/** Split only at week boundaries; reserve lanes so overlapping strips never collide. */
export function monthWeeks(year: number, month: number, events: TeamEvent[]) {
  const cells = monthCells(year, month);
  return Array.from({ length: cells.length / 7 }, (_, index) => {
    const days = cells.slice(index * 7, index * 7 + 7);
    const laneEnds: number[] = [];
    const segments = events
      .filter((event) =>
        overlaps(event.startDate, event.endDate, days[0].key, days[6].key),
      )
      .toSorted(
        (a, b) =>
          a.startDate.localeCompare(b.startDate) ||
          b.endDate.localeCompare(a.endDate) ||
          a.title.localeCompare(b.title) ||
          a.id.localeCompare(b.id),
      )
      .map((event) => {
        const start = Math.max(
          0,
          days.findIndex((day) => day.key >= event.startDate),
        );
        const end = days.findLastIndex((day) => day.key <= event.endDate);
        let lane = laneEnds.findIndex((last) => last < start);
        if (lane === -1) lane = laneEnds.length;
        laneEnds[lane] = end;
        return {
          event,
          start,
          end,
          lane,
          continuesBefore: event.startDate < days[0].key,
          continuesAfter: event.endDate > days[6].key,
        };
      });
    return { days, segments, lanes: laneEnds.length };
  });
}
