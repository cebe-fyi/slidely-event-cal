"use client";

import { useEffect, useRef, type CSSProperties } from "react";
import { MapPin } from "lucide-react";
import { icons } from "@/design/system";
import { dateRange, prettyDate } from "@/lib/dates/calendar";
import {
  categoryFor,
  type Category,
  type Tag,
  type TeamEvent,
} from "../events/types";

/** All matching dates stay in one scroll surface. A dated anchor makes Home exact,
 * including days without events; opening details never replaces this component. */
export function EventAgenda({
  events,
  categories,
  tags,
  today,
  anchor,
  jump,
  onOpen,
}: {
  events: TeamEvent[];
  categories: Category[];
  tags: Tag[];
  today: string;
  anchor: string;
  jump: number;
  onOpen: (event: TeamEvent) => void;
}) {
  const viewport = useRef<HTMLDivElement>(null);
  const anchorRef = useRef<HTMLDivElement>(null);
  // Hydrated local records and filtering can change rows above the anchor.
  // Opening details leaves this key stable, preserving the user's position.
  const contentKey = JSON.stringify(events);
  const groups = new Map<string, TeamEvent[]>();
  for (const event of events.toSorted(
    (a, b) =>
      a.startDate.localeCompare(b.startDate) ||
      a.title.localeCompare(b.title) ||
      a.id.localeCompare(b.id),
  )) {
    const group = groups.get(event.startDate) ?? [];
    group.push(event);
    groups.set(event.startDate, group);
  }
  if (!groups.has(anchor)) groups.set(anchor, []);
  if (!groups.has(today)) groups.set(today, []);
  useEffect(() => {
    const container = viewport.current;
    const target = anchorRef.current;
    if (container && target)
      container.scrollTop +=
        target.getBoundingClientRect().top -
        container.getBoundingClientRect().top;
  }, [anchor, jump, contentKey]);
  return (
    <div
      className="agenda-scroll"
      ref={viewport}
      role="region"
      aria-label="Events by date"
      tabIndex={0}
    >
      <p className="agenda-boundary">
        {events.length
          ? "Beginning of matching events · Scroll down for upcoming dates"
          : "No events match your filters."}
      </p>
      {[...groups.entries()]
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([date, items]) => (
          <div
            key={date}
            ref={date === anchor ? anchorRef : undefined}
            className={`agenda-day ${date === today ? "agenda-today" : ""}`}
            data-date={date}
          >
            <h2 className="agenda-date">
              <span>
                {date === today
                  ? "Today"
                  : new Intl.DateTimeFormat("en", {
                      weekday: "short",
                      timeZone: "UTC",
                    }).format(new Date(`${date}T00:00:00Z`))}
              </span>
              <time dateTime={date}>{prettyDate(date, true)}</time>
            </h2>
            <div className="agenda-items">
              {items.length ? (
                items.map((event) => {
                  const category = categoryFor(event.categoryId, categories);
                  return (
                    <button
                      key={event.id}
                      className="agenda-event"
                      style={
                        {
                          "--event-color": category.color,
                          "--event-bg": category.background,
                        } as CSSProperties
                      }
                      onClick={() => onOpen(event)}
                    >
                      <strong>{event.title}</strong>
                      <span className="agenda-event-meta">
                        {dateRange(event.startDate, event.endDate)}
                        <span>{category.name}</span>
                        {event.location && (
                          <span>
                            <MapPin size={icons.inline} />
                            {event.location}
                          </span>
                        )}
                      </span>
                      {!!event.tagIds.length && (
                        <span className="event-tags">
                          {event.tagIds.map((id) => {
                            const tag = tags.find((t) => t.id === id);
                            return tag ? (
                              <span key={id}>
                                <i style={{ background: tag.color }} />
                                {tag.name}
                              </span>
                            ) : null;
                          })}
                        </span>
                      )}
                    </button>
                  );
                })
              ) : (
                <p className="agenda-empty">
                  {events.length
                    ? "No events starting on this date."
                    : "No matching events. Try another search or clear your filters."}
                </p>
              )}
            </div>
          </div>
        ))}
      <p className="agenda-boundary">End of matching events</p>
    </div>
  );
}
