"use client";

import { icons } from "@/design/system";

import { useState, useSyncExternalStore, type CSSProperties } from "react";
import {
  ArrowUpRight,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  List,
  House,
  MapPin,
  PanelRightClose,
  PanelRightOpen,
  Plus,
  Search,
  X,
} from "lucide-react";
import {
  MONTHS,
  WEEKDAYS,
  dateKey,
  dateRange,
  monthCells,
  overlaps,
  periodBounds,
  prettyDate,
} from "@/lib/dates/calendar";
import {
  categoryFor as findCategory,
  type Category,
  type TeamEvent,
} from "@/features/events/types";
import { EventDialog } from "@/features/events/event-modal";
import {
  VocabularyModal,
  type VocabularyRequest,
} from "@/features/taxonomy/vocabulary-modal";
import { LeftSidebar } from "./left-sidebar";
import { sidebarCounts } from "./filter-counts";
import { useLocalWorkspace } from "@/features/workspace/use-local-workspace";
import { trashEvent } from "@/features/workspace/model";

type View = "month" | "year";
function colorStyle(id: string, options: Category[]): CSSProperties {
  const category = findCategory(id, options);
  return {
    "--event-color": category.color,
    "--event-bg": category.background,
  } as CSSProperties;
}

function subscribePreferences(callback: () => void) {
  window.addEventListener("storage", callback);
  window.addEventListener("slidely-preferences", callback);
  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener("slidely-preferences", callback);
  };
}

function usePanelPreference(key: string) {
  const value = useSyncExternalStore(
    subscribePreferences,
    () => {
      try {
        return localStorage.getItem(key) === "true";
      } catch {
        return false;
      }
    },
    () => false,
  );
  const [fallback, setFallback] = useState(false);
  function toggle() {
    const next = !(value || fallback);
    try {
      localStorage.setItem(key, String(next));
    } catch {
      setFallback(next);
    }
    window.dispatchEvent(new Event("slidely-preferences"));
  }
  return [value || fallback, toggle] as const;
}

export function CalendarWorkspace({ today }: { today: string }) {
  const [todayYear, todayMonth] = today.split("-").map(Number);
  const [year, setYear] = useState(todayYear);
  const [month, setMonth] = useState(todayMonth - 1);
  const [view, setView] = useState<View>("month");
  const {
    workspace: data,
    updateWorkspace,
    storageError,
    clearStorageError,
  } = useLocalWorkspace(todayYear, todayMonth - 1);
  const events = data.events;
  const categoryFor = (id: string) => findCategory(id, data.categories);
  const eventStyle = (id: string) => colorStyle(id, data.categories);
  const [managing, setManaging] = useState<VocabularyRequest | null>(null);
  const [search, setSearch] = useState("");
  const [categories, setCategories] = useState<string[]>([]);
  const [tags, setTags] = useState<string[]>([]);
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const [rightClosed, toggleRight] = usePanelPreference(
    "slidely.events.rightClosed.v1",
  );
  const [mobileList, setMobileList] = useState(false);
  const [editing, setEditing] = useState<TeamEvent | null | undefined>(
    undefined,
  );
  const [notice, setNotice] = useState("");
  const filtered = events.filter(
    (event) =>
      (!categories.length || categories.includes(event.categoryId)) &&
      (!tags.length || event.tagIds.some((tag) => tags.includes(tag))) &&
      `${event.title} ${event.location} ${event.description}`
        .toLowerCase()
        .includes(search.trim().toLowerCase()),
  );
  const [start, end] = periodBounds(year, view === "month" ? month : undefined);
  const periodEvents = filtered.filter((event) =>
    overlaps(event.startDate, event.endDate, start, end),
  );
  const counts = sidebarCounts(events, start, end, search, categories, tags);
  const listEvents = periodEvents
    .filter(
      (event) =>
        !selectedDay ||
        overlaps(event.startDate, event.endDate, selectedDay, selectedDay),
    )
    .sort(
      (a, b) =>
        a.startDate.localeCompare(b.startDate) ||
        a.title.localeCompare(b.title) ||
        a.id.localeCompare(b.id),
    );
  const periodLabel =
    view === "year" ? String(year) : `${MONTHS[month]} ${year}`;
  const activeCount = categories.length + tags.length;

  function selectMonth(index: number) {
    setMonth(index);
    setView("month");
    setSelectedDay(null);
  }
  function move(amount: number) {
    if (view === "year")
      setYear((y) => Math.min(2200, Math.max(1900, y + amount)));
    else {
      const date = new Date(Date.UTC(year, month + amount, 1));
      if (date.getUTCFullYear() >= 1900 && date.getUTCFullYear() <= 2200) {
        setYear(date.getUTCFullYear());
        setMonth(date.getUTCMonth());
      }
    }
    setSelectedDay(null);
  }
  function selectDay(key: string) {
    const [y, m] = key.split("-").map(Number);
    setYear(y);
    setMonth(m - 1);
    setSelectedDay(key);
    setMobileList(true);
    if (rightClosed) toggleRight();
  }
  function toggleFilter(
    id: string,
    selected: string[],
    update: (ids: string[]) => void,
  ) {
    update(
      selected.includes(id)
        ? selected.filter((item) => item !== id)
        : [...selected, id],
    );
  }
  function clearFilters() {
    setCategories([]);
    setTags([]);
    setSearch("");
    setSelectedDay(null);
  }
  function saveEvent(event: TeamEvent) {
    if (
      !updateWorkspace((current) => ({
        ...current,
        events: current.events.some((e) => e.id === event.id)
          ? current.events.map((e) => (e.id === event.id ? event : e))
          : [...current.events, event],
      }))
    )
      return;
    const [y, m] = event.startDate.split("-").map(Number);
    setYear(y);
    setMonth(m - 1);
    setView("month");
    clearFilters();
    setEditing(undefined);
    setNotice(
      "Event saved in this browser. It will be here after you refresh.",
    );
  }

  return (
    <div className="app-shell">
      <a className="skip-link" href="#calendar">
        Skip to calendar
      </a>
      {storageError && editing === undefined && !managing && (
        <p className="storage-error" role="alert">
          {storageError}
        </p>
      )}
      <div className={`workspace ${rightClosed ? "right-collapsed" : ""}`}>
        <LeftSidebar
          year={year}
          month={month}
          view={view}
          categories={data.categories}
          tags={data.tags}
          filteredEvents={filtered}
          selectedCategories={categories}
          selectedTags={tags}
          categoryCounts={counts.categories}
          tagCounts={counts.tags}
          onYearChange={(amount) => {
            setYear((current) =>
              Math.min(2200, Math.max(1900, current + amount)),
            );
            setSelectedDay(null);
          }}
          onMonthSelect={selectMonth}
          onCategoryToggle={(id) => toggleFilter(id, categories, setCategories)}
          onTagToggle={(id) => toggleFilter(id, tags, setTags)}
          onCategoryReset={() => setCategories([])}
          onTagReset={() => setTags([])}
          onAction={(request) => {
            clearStorageError();
            setManaging(request);
          }}
        />

        <header className="calendar-toolbar" aria-label="Calendar controls">
          <div className="period-navigation">
            <button
              className="icon-button home-button"
              aria-label="Go to current month"
              onClick={() => {
                setYear(todayYear);
                setMonth(todayMonth - 1);
                setView("month");
                setSelectedDay(null);
              }}
            >
              <House size={icons.navigation} />
            </button>
            <h2>{periodLabel}</h2>
            <div className="period-arrows">
              <button
                className="icon-button"
                aria-label={
                  view === "month" ? "Previous month" : "Previous period year"
                }
                onClick={() => move(-1)}
              >
                <ChevronLeft size={icons.control} />
              </button>
              <button
                className="icon-button"
                aria-label={
                  view === "month" ? "Next month" : "Next period year"
                }
                onClick={() => move(1)}
              >
                <ChevronRight size={icons.control} />
              </button>
            </div>
            <button
              className="today-button"
              onClick={() => {
                setYear(todayYear);
                setMonth(todayMonth - 1);
                setSelectedDay(null);
              }}
            >
              Today
            </button>
          </div>
          <div className="view-control" aria-label="Calendar view">
            <button
              aria-pressed={view === "month"}
              className={view === "month" ? "active" : ""}
              onClick={() => {
                setView("month");
                setSelectedDay(null);
              }}
            >
              Month
            </button>
            <button
              aria-pressed={view === "year"}
              className={view === "year" ? "active" : ""}
              onClick={() => {
                setView("year");
                setSelectedDay(null);
              }}
            >
              Year
            </button>
            <button disabled title="Available after map setup">
              <MapPin size={icons.inline} />
              Map
            </button>
          </div>
          {rightClosed && (
            <button
              className="icon-button desktop-only"
              aria-label="Expand event list"
              onClick={toggleRight}
            >
              <PanelRightOpen size={icons.control} />
            </button>
          )}
          <button
            className="primary-button add-event"
            onClick={() => setEditing(null)}
            aria-label="Add event"
          >
            <Plus size={icons.control} />
            <span>Add event</span>
          </button>
        </header>

        <main
          className={`calendar-main ${mobileList ? "show-mobile-list" : ""}`}
          id="calendar"
        >
          <h1 className="sr-only">Events and conferences</h1>
          <div className="search-toolbar">
            <label className="search-field">
              <Search size={icons.control} />
              <input
                type="search"
                aria-label="Search events"
                placeholder="Search events, places, ideas…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </label>
            <span className="results-count">
              {periodEvents.length}{" "}
              {periodEvents.length === 1 ? "event" : "events"}
            </span>
            {activeCount > 0 && (
              <button className="filter-clear" onClick={clearFilters}>
                Clear {activeCount} filters <X size={icons.inline} />
              </button>
            )}
          </div>
          <div className="mobile-view-switch mobile-only">
            <button
              className={!mobileList ? "active" : ""}
              onClick={() => setMobileList(false)}
            >
              <CalendarDays size={icons.control} />
              Calendar
            </button>
            <button
              className={mobileList ? "active" : ""}
              onClick={() => setMobileList(true)}
            >
              <List size={icons.control} />
              Event list
            </button>
          </div>
          <div className="calendar-surface">
            {view === "month" ? (
              <div className="month-calendar">
                <div className="weekdays">
                  {WEEKDAYS.map((day) => (
                    <span key={day}>{day}</span>
                  ))}
                </div>
                <div
                  className="month-grid"
                  style={
                    {
                      "--week-count": monthCells(year, month).length / 7,
                    } as CSSProperties
                  }
                >
                  {monthCells(year, month).map((cell) => {
                    const dayEvents = filtered.filter((event) =>
                      overlaps(
                        event.startDate,
                        event.endDate,
                        cell.key,
                        cell.key,
                      ),
                    );
                    return (
                      <div
                        key={cell.key}
                        className={`day-cell ${!cell.inMonth ? "outside-month" : ""} ${cell.key === selectedDay ? "selected-day" : ""}`}
                      >
                        <button
                          className={`day-number ${cell.key === today ? "is-today" : ""}`}
                          aria-label={`${prettyDate(cell.key, true)}, ${dayEvents.length} events`}
                          aria-pressed={selectedDay === cell.key}
                          onClick={() => selectDay(cell.key)}
                        >
                          {cell.day}
                        </button>
                        <div className="day-event-labels">
                          {dayEvents.slice(0, 2).map((event) => (
                            <button
                              className="calendar-event"
                              key={event.id}
                              style={eventStyle(event.categoryId)}
                              onClick={() => setEditing(event)}
                              title={`${event.title}, ${dateRange(event.startDate, event.endDate)}`}
                            >
                              <span className="event-dot" />
                              <span>{event.title}</span>
                            </button>
                          ))}
                          {dayEvents.length > 2 && (
                            <button
                              className="overflow-events"
                              onClick={() => selectDay(cell.key)}
                            >
                              +{dayEvents.length - 2} more
                            </button>
                          )}
                        </div>
                        <span className="mobile-day-dots" aria-hidden="true">
                          {dayEvents.slice(0, 4).map((event) => (
                            <i
                              key={event.id}
                              style={{
                                background: categoryFor(event.categoryId).color,
                              }}
                            />
                          ))}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="year-grid">
                {MONTHS.map((name, index) => (
                  <button
                    className="year-month"
                    key={name}
                    onClick={() => selectMonth(index)}
                    aria-label={`Open ${name} ${year}`}
                  >
                    <span
                      className={`year-month-name ${index === todayMonth - 1 && year === todayYear ? "current" : ""}`}
                    >
                      {name}
                      <ChevronRight size={icons.control} />
                    </span>
                    <span className="mini-weekdays">
                      {WEEKDAYS.map((d) => (
                        <span key={d}>{d.slice(0, 1)}</span>
                      ))}
                    </span>
                    <span className="mini-grid">
                      {monthCells(year, index).map((cell) => (
                        <span
                          className={
                            !cell.inMonth
                              ? "muted-day"
                              : cell.key === today
                                ? "mini-today"
                                : ""
                          }
                          key={cell.key}
                        >
                          <span>{cell.day}</span>
                          <span className="mini-dots">
                            {cell.inMonth &&
                              [
                                ...new Set(
                                  filtered
                                    .filter((e) =>
                                      overlaps(
                                        e.startDate,
                                        e.endDate,
                                        cell.key,
                                        cell.key,
                                      ),
                                    )
                                    .map((e) => e.categoryId),
                                ),
                              ]
                                .slice(0, 3)
                                .map((id) => (
                                  <i
                                    key={id}
                                    style={{
                                      background: categoryFor(id).color,
                                    }}
                                  />
                                ))}
                          </span>
                        </span>
                      ))}
                    </span>
                  </button>
                ))}
              </div>
            )}
            <div className="calendar-footer">
              <span>
                <i className="today-legend" />
                Today
              </span>
              <span>Dates only. More room for what matters.</span>
            </div>
          </div>
        </main>

        <aside
          className={`right-panel ${mobileList ? "mobile-list-open" : ""}`}
          aria-label="Events in selected period"
          id="event-list"
        >
          <div className="panel-title">
            <span>
              {selectedDay ? prettyDate(selectedDay, true) : "Coming together"}
            </span>
            <button
              className="icon-button desktop-only"
              aria-label="Collapse event list"
              onClick={toggleRight}
            >
              <PanelRightClose size={icons.control} />
            </button>
          </div>
          <div className="list-subheading">
            <span>{selectedDay ? "Selected day" : periodLabel}</span>
            <span className="count-pill">{listEvents.length}</span>
          </div>
          {selectedDay && (
            <button
              className="back-to-period"
              onClick={() => setSelectedDay(null)}
            >
              <ChevronLeft size={icons.inline} />
              All events in {MONTHS[month]}
            </button>
          )}
          <div className="event-list">
            {listEvents.length ? (
              listEvents.map((event, index) => {
                const c = categoryFor(event.categoryId);
                return (
                  <div key={event.id}>
                    {(index === 0 ||
                      listEvents[index - 1].startDate !== event.startDate) && (
                      <div className="list-date-heading">
                        {prettyDate(event.startDate)}
                        {event.startDate <= today && event.endDate >= today && (
                          <span>Happening now</span>
                        )}
                      </div>
                    )}
                    <button
                      className="event-card"
                      style={eventStyle(event.categoryId)}
                      onClick={() => setEditing(event)}
                    >
                      <span className="event-category">
                        {c.name}
                        <ArrowUpRight size={icons.inline} />
                      </span>
                      <strong>{event.title}</strong>
                      <span className="event-meta">
                        <CalendarDays size={icons.inline} />
                        {dateRange(event.startDate, event.endDate)}
                      </span>
                      <span className="event-meta">
                        <MapPin size={icons.inline} />
                        {event.location || "Location to confirm"}
                      </span>
                      {event.tagIds.length > 0 && (
                        <span className="event-tags">
                          {event.tagIds.map((id) => (
                            <span key={id}>
                              <i
                                style={{
                                  background: data.tags.find((t) => t.id === id)
                                    ?.color,
                                }}
                              />
                              {data.tags.find((t) => t.id === id)?.name}
                            </span>
                          ))}
                        </span>
                      )}
                    </button>
                  </div>
                );
              })
            ) : (
              <div className="empty-state">
                <CalendarDays size={icons.illustration} />
                <h3>A little room to explore</h3>
                <p>
                  No events match this selection. Try another month or clear
                  your filters.
                </p>
                {(activeCount > 0 || search || selectedDay) && (
                  <button className="secondary-button" onClick={clearFilters}>
                    Clear selection
                  </button>
                )}
                <button
                  className="text-button"
                  onClick={() => setEditing(null)}
                >
                  Add an event <Plus size={icons.control} />
                </button>
              </div>
            )}
          </div>
          <div className="list-footer">
            The next great conversation is out there.
          </div>
        </aside>
      </div>
      {notice && (
        <div className="toast" role="status">
          {notice}
          <button
            className="icon-button"
            aria-label="Dismiss notification"
            onClick={() => setNotice("")}
          >
            <X size={icons.control} />
          </button>
        </div>
      )}
      {editing !== undefined && (
        <EventDialog
          event={editing}
          categories={data.categories}
          tags={data.tags}
          saveError={storageError}
          date={
            selectedDay ??
            (year === todayYear && month === todayMonth - 1
              ? today
              : dateKey(year, month, 1))
          }
          onClose={() => setEditing(undefined)}
          onSave={saveEvent}
          onDelete={(id) => {
            if (!updateWorkspace((current) => trashEvent(current, id))) return;
            setEditing(undefined);
            setNotice("Event removed from this local calendar.");
          }}
        />
      )}
      {managing && (
        <VocabularyModal
          key={`${managing.kind}-${managing.action}-${managing.id ?? "new"}`}
          request={managing}
          data={data}
          error={storageError}
          onChange={(update) => {
            const saved = updateWorkspace(update);
            if (saved) {
              setCategories([]);
              setTags([]);
            }
            return saved;
          }}
          onClose={() => setManaging(null)}
        />
      )}
    </div>
  );
}
