"use client";

import { icons } from "@/design/system";

import { useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  House,
  MapPin,
  Plus,
  Search,
  X,
} from "lucide-react";
import { MONTHS, dateKey, overlaps, periodBounds } from "@/lib/dates/calendar";
import { type TeamEvent } from "@/features/events/types";
import { MonthCalendar } from "./month-calendar";
import { EventAgenda } from "./event-agenda";
import { EventDetails } from "@/features/events/event-details";
import { EventDialog } from "@/features/events/event-modal";
import {
  VocabularyModal,
  type VocabularyRequest,
} from "@/features/taxonomy/vocabulary-modal";
import { LeftSidebar } from "./left-sidebar";
import { sidebarCounts } from "./filter-counts";
import { useLocalWorkspace } from "@/features/workspace/use-local-workspace";
import { trashEvent } from "@/features/workspace/model";

type View = "month" | "list";

export function CalendarWorkspace({ today }: { today: string }) {
  const [todayYear, todayMonth] = today.split("-").map(Number);
  const [year, setYear] = useState(todayYear);
  const [month, setMonth] = useState(todayMonth - 1);
  const [view, setView] = useState<View>("list");
  const {
    workspace: data,
    updateWorkspace,
    storageError,
    clearStorageError,
  } = useLocalWorkspace(todayYear, todayMonth - 1);
  const events = data.events;
  const [managing, setManaging] = useState<VocabularyRequest | null>(null);
  const [search, setSearch] = useState("");
  const [categories, setCategories] = useState<string[]>([]);
  const [tags, setTags] = useState<string[]>([]);
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const [detailsId, setDetailsId] = useState<string | null>(null);
  const details = events.find((event) => event.id === detailsId);
  const [agendaAnchor, setAgendaAnchor] = useState(today);
  const [agendaJump, setAgendaJump] = useState(0);
  function jumpToDate(date: string) {
    setAgendaAnchor(date);
    setAgendaJump((value) => value + 1);
  }
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
  const [start, end] =
    view === "list" ? ["1900-01-01", "2200-12-31"] : periodBounds(year, month);
  const periodEvents = filtered.filter((event) =>
    overlaps(event.startDate, event.endDate, start, end),
  );
  const counts = sidebarCounts(events, start, end, search, categories, tags);
  const periodLabel = `${MONTHS[month]} ${year}`;
  const activeCount = categories.length + tags.length;

  function selectMonth(index: number) {
    setMonth(index);
    if (view !== "list") setView("month");
    jumpToDate(dateKey(year, index, 1));
    setSelectedDay(null);
  }
  function move(amount: number) {
    const date = new Date(Date.UTC(year, month + amount, 1));
    if (date.getUTCFullYear() >= 1900 && date.getUTCFullYear() <= 2200) {
      setYear(date.getUTCFullYear());
      setMonth(date.getUTCMonth());
      jumpToDate(dateKey(date.getUTCFullYear(), date.getUTCMonth(), 1));
    }
    setSelectedDay(null);
  }
  function selectDay(key: string) {
    const [y, m] = key.split("-").map(Number);
    setYear(y);
    setMonth(m - 1);
    setSelectedDay(key);
    setView("list");
    jumpToDate(key);
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
    jumpToDate(event.startDate);
    setDetailsId(event.id);
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
      <div className="workspace">
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
            jumpToDate(
              dateKey(Math.min(2200, Math.max(1900, year + amount)), month, 1),
            );
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
              aria-label="Go to today"
              onClick={() => {
                setYear(todayYear);
                setMonth(todayMonth - 1);
                jumpToDate(today);
                setSelectedDay(null);
              }}
            >
              <House size={icons.navigation} />
            </button>
            <h2>{periodLabel}</h2>
            <div className="period-arrows">
              <button
                className="icon-button"
                aria-label="Previous month"
                onClick={() => move(-1)}
              >
                <ChevronLeft size={icons.control} />
              </button>
              <button
                className="icon-button"
                aria-label="Next month"
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
                jumpToDate(today);
                setSelectedDay(null);
              }}
            >
              Today
            </button>
          </div>
          <div className="view-control" aria-label="Calendar view">
            <button
              aria-pressed={view === "list"}
              className={view === "list" ? "active" : ""}
              onClick={() => {
                setView("list");
                setSelectedDay(null);
                jumpToDate(today);
              }}
            >
              List
            </button>
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
            <button disabled title="Available after map setup">
              <MapPin size={icons.inline} />
              Map
            </button>
          </div>
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
          className={`calendar-main ${view === "list" ? "agenda-main" : ""}`}
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
          {view === "list" ? (
            <EventAgenda
              events={filtered}
              categories={data.categories}
              tags={data.tags}
              today={today}
              anchor={agendaAnchor}
              jump={agendaJump}
              onOpen={(event) => setDetailsId(event.id)}
            />
          ) : (
            <div className="calendar-surface">
              <MonthCalendar
                year={year}
                month={month}
                today={today}
                selectedDay={selectedDay}
                events={filtered}
                categories={data.categories}
                tags={data.tags}
                onDaySelect={selectDay}
                onOpen={(event) => setDetailsId(event.id)}
              />
              <div className="calendar-footer">
                <span>
                  <i className="today-legend" />
                  Today
                </span>
                <span>Dates only. More room for what matters.</span>
              </div>
            </div>
          )}
        </main>
      </div>
      {details && editing === undefined && (
        <EventDetails
          event={details}
          categories={data.categories}
          tags={data.tags}
          onClose={() => setDetailsId(null)}
          onEdit={() => {
            clearStorageError();
            setEditing(details);
          }}
        />
      )}
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
            setDetailsId(null);
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
