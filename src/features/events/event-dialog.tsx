"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { CalendarDays, MapPin, X } from "lucide-react";
import { CATEGORIES, TAGS, type TeamEvent } from "./types";
import { isValidDate } from "@/lib/dates/calendar";

type Props = {
  event: TeamEvent | null;
  date: string;
  onClose: () => void;
  onSave: (event: TeamEvent) => void;
  onDelete: (id: string) => void;
};

export function EventDialog({ event, date, onClose, onSave, onDelete }: Props) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [error, setError] = useState("");
  const [confirmDelete, setConfirmDelete] = useState(false);
  useEffect(() => {
    dialog.current?.showModal();
  }, []);

  function save(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const title = String(data.get("title") ?? "").trim();
    const startDate = String(data.get("startDate"));
    const endDate = String(data.get("endDate"));
    const url = String(data.get("url") ?? "").trim();
    if (
      !title ||
      !isValidDate(startDate) ||
      !isValidDate(endDate) ||
      endDate < startDate
    ) {
      setError(
        "Add a title and valid dates. The end date must be on or after the start date.",
      );
      return;
    }
    if (url && !/^https?:\/\//i.test(url)) {
      setError("Use a website link beginning with https:// or http://.");
      return;
    }
    onSave({
      id: event?.id ?? crypto.randomUUID(),
      title,
      startDate,
      endDate,
      location: String(data.get("location") ?? "").trim(),
      categoryId: String(data.get("categoryId")),
      tagIds: data.getAll("tags").map(String),
      description: String(data.get("description") ?? "").trim(),
      url,
    });
  }

  return (
    <dialog
      ref={dialog}
      className="event-dialog"
      aria-labelledby="event-form-title"
      onCancel={onClose}
    >
      <form onSubmit={save}>
        <div className="dialog-header">
          <div>
            <span className="small-muted">Sample workspace</span>
            <h2 id="event-form-title">
              {event ? "Edit event" : "Add an event"}
            </h2>
          </div>
          <button
            type="button"
            className="icon-button"
            onClick={onClose}
            aria-label="Close event form"
          >
            <X size={20} />
          </button>
        </div>
        <p className="form-notice">
          Preview changes stay in this tab until you reload. Use sample
          information only.
        </p>
        <label>
          Event name
          <input
            name="title"
            defaultValue={event?.title}
            placeholder="e.g. Product leaders conference"
            maxLength={160}
            required
            autoFocus
          />
        </label>
        <div className="form-row">
          <label>
            <span>
              <CalendarDays size={14} /> Start date
            </span>
            <input
              type="date"
              name="startDate"
              defaultValue={event?.startDate ?? date}
              min="1900-01-01"
              max="2200-12-31"
              required
            />
          </label>
          <label>
            End date
            <input
              type="date"
              name="endDate"
              defaultValue={event?.endDate ?? date}
              min="1900-01-01"
              max="2200-12-31"
              required
            />
          </label>
        </div>
        <label>
          <span>
            <MapPin size={14} /> Location
          </span>
          <input
            name="location"
            defaultValue={event?.location}
            placeholder="City, country or Online"
            maxLength={160}
          />
        </label>
        <label htmlFor="event-category">Category</label>
        <select
          id="event-category"
          name="categoryId"
          defaultValue={event?.categoryId ?? ""}
        >
          <option value="">Uncategorized</option>
          {CATEGORIES.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
        <fieldset>
          <legend>Tags</legend>
          <div className="form-tags">
            {TAGS.map((tag) => (
              <label key={tag.id}>
                <input
                  type="checkbox"
                  name="tags"
                  value={tag.id}
                  defaultChecked={event?.tagIds.includes(tag.id)}
                />
                {tag.name}
              </label>
            ))}
          </div>
        </fieldset>
        <label>
          Event website
          <input
            name="url"
            type="url"
            defaultValue={event?.url}
            placeholder="https://"
            maxLength={2000}
          />
        </label>
        <label>
          Notes
          <textarea
            name="description"
            defaultValue={event?.description}
            placeholder="What should the team know?"
            maxLength={3000}
            rows={3}
          />
        </label>
        {error && (
          <p role="alert" className="form-error">
            {error}
          </p>
        )}
        <div className="dialog-actions">
          {event && (
            <button
              type="button"
              className="text-button danger"
              onClick={() => {
                if (confirmDelete) onDelete(event.id);
                else setConfirmDelete(true);
              }}
            >
              {confirmDelete ? "Confirm removal" : "Remove sample"}
            </button>
          )}
          <button type="button" className="secondary-button" onClick={onClose}>
            Cancel
          </button>
          <button className="primary-button" type="submit">
            {event ? "Save changes" : "Add sample event"}
          </button>
        </div>
      </form>
    </dialog>
  );
}
