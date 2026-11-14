"use client";

import type { CSSProperties } from "react";
import { WEEKDAYS, overlaps, prettyDate } from "@/lib/dates/calendar";
import {
  categoryFor,
  type Category,
  type Tag,
  type TeamEvent,
} from "../events/types";
import { EventButton } from "../events/event-button";
import { monthWeeks } from "./month-layout";

export function MonthCalendar({
  year,
  month,
  today,
  selectedDay,
  events,
  categories,
  tags,
  onDaySelect,
  onOpen,
}: {
  year: number;
  month: number;
  today: string;
  selectedDay: string | null;
  events: TeamEvent[];
  categories: Category[];
  tags: Tag[];
  onDaySelect: (date: string) => void;
  onOpen: (event: TeamEvent) => void;
}) {
  return (
    <div className="month-calendar">
      <div className="weekdays">
        {WEEKDAYS.map((day) => (
          <span key={day}>{day}</span>
        ))}
      </div>
      <div className="month-weeks">
        {monthWeeks(year, month, events).map((week) => (
          <div
            key={week.days[0].key}
            className="calendar-week"
            style={
              { "--event-lanes": Math.max(2, week.lanes) } as CSSProperties
            }
          >
            {week.days.map((cell) => (
              <div
                key={cell.key}
                className={`day-cell ${!cell.inMonth ? "outside-month" : ""} ${cell.key === selectedDay ? "selected-day" : ""}`}
              >
                <button
                  className={`day-number ${cell.key === today ? "is-today" : ""}`}
                  aria-label={`${prettyDate(cell.key, true)}, ${events.filter((event) => overlaps(event.startDate, event.endDate, cell.key, cell.key)).length} events`}
                  onClick={() => onDaySelect(cell.key)}
                >
                  {cell.day}
                </button>
              </div>
            ))}
            <div className="week-event-strips">
              {week.segments.map((segment) => {
                const category = categoryFor(
                  segment.event.categoryId,
                  categories,
                );
                return (
                  <EventButton
                    key={segment.event.id}
                    event={segment.event}
                    categories={categories}
                    tags={tags}
                    onOpen={onOpen}
                    className={`calendar-event event-strip ${segment.continuesBefore ? "continues-before" : ""} ${segment.continuesAfter ? "continues-after" : ""}`}
                    style={
                      {
                        gridColumn: `${segment.start + 1} / ${segment.end + 2}`,
                        gridRow: segment.lane + 1,
                        "--event-color": category.color,
                        "--event-bg": category.background,
                      } as CSSProperties
                    }
                  >
                    <span>
                      {segment.continuesBefore ? "↳ " : ""}
                      {segment.event.title}
                      {segment.continuesAfter ? " ↪" : ""}
                    </span>
                  </EventButton>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
