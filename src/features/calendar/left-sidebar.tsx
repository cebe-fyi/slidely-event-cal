"use client";

import Image from "next/image";
import Link from "next/link";
import {
  Check,
  ChevronLeft,
  ChevronRight,
  Plus,
  UserRound,
} from "lucide-react";
import { useEffect, useRef, type CSSProperties } from "react";
import { icons } from "@/design/system";
import { DropdownMenu } from "@/components/ui/dropdown-menu";
import { MONTHS, overlaps, periodBounds } from "@/lib/dates/calendar";
import {
  categoryFor,
  type Category,
  type Tag,
  type TeamEvent,
} from "../events/types";
import type { VocabularyKind } from "../workspace/model";
import type { VocabularyRequest } from "../taxonomy/vocabulary-modal";

type Props = {
  year: number;
  month: number;
  view: "month" | "year";
  categories: Category[];
  tags: Tag[];
  filteredEvents: TeamEvent[];
  selectedCategories: string[];
  selectedTags: string[];
  categoryCounts: Map<string, number>;
  tagCounts: Map<string, number>;
  onYearChange: (amount: number) => void;
  onMonthSelect: (month: number) => void;
  onCategoryToggle: (id: string) => void;
  onTagToggle: (id: string) => void;
  onCategoryReset: () => void;
  onTagReset: () => void;
  onAction: (request: VocabularyRequest) => void;
};

function FilterSection({
  title,
  kind,
  items,
  selected,
  counts,
  onToggle,
  onReset,
  onAction,
}: {
  title: string;
  kind: VocabularyKind;
  items: (Category | Tag)[];
  selected: string[];
  counts: Map<string, number>;
  onToggle: (id: string) => void;
  onReset: () => void;
  onAction: (request: VocabularyRequest) => void;
}) {
  return (
    <section className="filter-section" aria-label={title}>
      <div className="section-label">
        <h2>{title}</h2>
        {selected.length > 0 && (
          <button className="text-button" onClick={onReset}>
            Reset
          </button>
        )}
        <button
          type="button"
          className="icon-button section-add"
          aria-label={`Create ${kind === "categories" ? "category" : "tag"}`}
          onClick={() => onAction({ kind, action: "create" })}
        >
          <Plus size={icons.control} />
        </button>
      </div>
      <div className="filter-items">
        {items.map((item) => (
          <div
            className="filter-row"
            key={item.id}
            style={{ "--filter-color": item.color } as CSSProperties}
          >
            <label className="filter-option">
              <span className="color-checkbox">
                <input
                  type="checkbox"
                  aria-label={`Filter ${title.toLowerCase()}: ${item.name}`}
                  checked={selected.includes(item.id)}
                  onChange={() => onToggle(item.id)}
                />
                <Check size={icons.inline} aria-hidden="true" />
              </span>
              <span className="filter-name">{item.name}</span>
            </label>
            <div className={`filter-row-end ${!item.id ? "no-menu" : ""}`}>
              <span
                className="filter-count"
                aria-label={`${counts.get(item.id) ?? 0} events`}
              >
                {counts.get(item.id) ?? 0}
              </span>
              {item.id && (
                <DropdownMenu
                  label={`Options for ${item.name}`}
                  actions={[
                    {
                      label: "Edit",
                      onSelect: () =>
                        onAction({ kind, action: "edit", id: item.id }),
                    },
                    {
                      label: "Merge",
                      disabled: items.filter((item) => item.id).length < 2,
                      onSelect: () =>
                        onAction({ kind, action: "merge", id: item.id }),
                    },
                    {
                      label: "Delete",
                      danger: true,
                      onSelect: () =>
                        onAction({ kind, action: "delete", id: item.id }),
                    },
                  ]}
                />
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export function LeftSidebar(props: Props) {
  const { year, month, view, categories, tags, filteredEvents } = props;
  const scrollArea = useRef<HTMLElement>(null);
  useEffect(() => {
    const element = scrollArea.current;
    if (!element) return;
    // Scrollbars consume part of the right inset; don't add a second gutter.
    const measure = () => {
      const style = getComputedStyle(element);
      const borders =
        parseFloat(style.borderLeftWidth) + parseFloat(style.borderRightWidth);
      const width = Math.max(
        0,
        element.offsetWidth - element.clientWidth - borders,
      );
      element.style.setProperty("--sidebar-scrollbar-width", `${width}px`);
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(element);
    return () => observer.disconnect();
  }, []);
  return (
    <>
      <div className="sidebar-brand">
        <Link href="/" className="brand" aria-label="Slidely Events home">
          <Image
            src="/brand/slidely-wordmark.png"
            alt="Slidely AI"
            width={120}
            height={28}
            priority
            className="brand-image"
          />
        </Link>
        <Link
          href="/setup"
          className="icon-button"
          aria-label="Local workspace information"
          title="Local sample workspace · Setup information"
        >
          <UserRound size={icons.control} />
        </Link>
      </div>
      <aside
        ref={scrollArea}
        className="left-panel"
        aria-label="Calendar navigation and filters"
        id="filters-panel"
      >
        <div className="sidebar-overview">
          <div className="year-selector">
            <button
              className="icon-button"
              aria-label="Previous year"
              disabled={year <= 1900}
              onClick={() => props.onYearChange(-1)}
            >
              <ChevronLeft size={icons.control} />
            </button>
            <span className="year-label" aria-live="polite">
              {year}
            </span>
            <button
              className="icon-button"
              aria-label="Next year"
              disabled={year >= 2200}
              onClick={() => props.onYearChange(1)}
            >
              <ChevronRight size={icons.control} />
            </button>
          </div>
          <div className="month-picker">
            {MONTHS.map((name, index) => {
              const [start, end] = periodBounds(year, index);
              const matches = filteredEvents.filter((event) =>
                overlaps(event.startDate, event.endDate, start, end),
              );
              const colors = [
                ...new Set(matches.map((event) => event.categoryId)),
              ];
              return (
                <button
                  key={name}
                  aria-label={`${name} ${year}, ${matches.length} events`}
                  aria-pressed={view === "month" && month === index}
                  className={
                    view === "month" && month === index ? "selected" : ""
                  }
                  onClick={() => props.onMonthSelect(index)}
                >
                  <span>{name.slice(0, 3)}</span>
                  <span className="month-dots" aria-hidden="true">
                    {colors.slice(0, 4).map((id) => (
                      <i
                        key={id}
                        style={{
                          background: categoryFor(id, categories).color,
                        }}
                      />
                    ))}
                    {!colors.length && <i className="empty-dot" />}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
        <FilterSection
          title="Categories"
          kind="categories"
          items={[...categories, categoryFor("", categories)]}
          selected={props.selectedCategories}
          counts={props.categoryCounts}
          onToggle={props.onCategoryToggle}
          onReset={props.onCategoryReset}
          onAction={props.onAction}
        />
        <FilterSection
          title="Tags"
          kind="tags"
          items={tags}
          selected={props.selectedTags}
          counts={props.tagCounts}
          onToggle={props.onTagToggle}
          onReset={props.onTagReset}
          onAction={props.onAction}
        />
      </aside>
    </>
  );
}
