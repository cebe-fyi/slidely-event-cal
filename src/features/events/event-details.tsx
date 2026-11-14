"use client";

import { CalendarDays, MapPin, Pencil, ArrowUpRight } from "lucide-react";
import { Modal } from "@/components/ui/modal";
import { icons } from "@/design/system";
import { dateRange, prettyDate } from "@/lib/dates/calendar";
import { categoryFor, type Category, type Tag, type TeamEvent } from "./types";

export function EventDetails({
  event,
  categories,
  tags,
  onClose,
  onEdit,
}: {
  event: TeamEvent;
  categories: Category[];
  tags: Tag[];
  onClose: () => void;
  onEdit: () => void;
}) {
  const category = categoryFor(event.categoryId, categories);
  return (
    <Modal
      title="Event details"
      placement="right"
      onClose={onClose}
      closeLabel="Close event details"
      headerActions={
        <button
          className="icon-button"
          aria-label="Edit event"
          onClick={onEdit}
        >
          <Pencil size={icons.control} />
        </button>
      }
    >
      <h3 className="event-detail-title">{event.title}</h3>
      <dl className="event-detail-fields">
        <div>
          <dt>
            <CalendarDays size={icons.control} />
            Dates
          </dt>
          <dd>
            {dateRange(event.startDate, event.endDate)}
            <span className="small-muted">
              {event.startDate.slice(0, 4) !== event.endDate.slice(0, 4)
                ? `${prettyDate(event.startDate, true)} – ${prettyDate(event.endDate, true)}`
                : event.startDate.slice(0, 4)}
            </span>
          </dd>
        </div>
        <div>
          <dt>
            <MapPin size={icons.control} />
            Location
          </dt>
          <dd>{event.location || "Location to confirm"}</dd>
        </div>
        <div>
          <dt>Category</dt>
          <dd>
            <span
              className="detail-category"
              style={{ color: category.color, background: category.background }}
            >
              {category.name}
            </span>
          </dd>
        </div>
        <div>
          <dt>Tags</dt>
          <dd className="detail-tags">
            {event.tagIds.length
              ? event.tagIds.map((id) => {
                  const tag = tags.find((t) => t.id === id);
                  return tag ? (
                    <span key={id}>
                      <i style={{ background: tag.color }} />
                      {tag.name}
                    </span>
                  ) : null;
                })
              : "No tags"}
          </dd>
        </div>
      </dl>
      {event.url && (
        <a
          className="secondary-button event-website"
          href={event.url}
          target="_blank"
          rel="noopener noreferrer"
        >
          Event website <ArrowUpRight size={icons.control} />
        </a>
      )}
      <section className="event-notes">
        <h3>Notes</h3>
        <p>{event.description || "No notes added yet."}</p>
      </section>
    </Modal>
  );
}
