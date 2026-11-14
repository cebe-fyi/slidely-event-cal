"use client";

import { useState, type FormEvent } from "react";
import {
  ConfirmModal,
  FormField,
  Modal,
  ModalActions,
} from "@/components/ui/modal";
import type { Category, Tag, TeamEvent } from "./types";
import { isValidDate } from "@/lib/dates/calendar";
import { LocationFields } from "../locations/location-fields";
import {
  placeLabel,
  type EventPlace,
  type LocationKind,
} from "../locations/types";

type Props = {
  event: TeamEvent | null;
  date: string;
  onClose: () => void;
  onSave: (event: TeamEvent) => void;
  onDelete: (id: string) => void;
  categories: Category[];
  tags: Tag[];
  saveError: string;
};

export function EventDialog({
  event,
  date,
  onClose,
  onSave,
  onDelete,
  categories,
  tags,
  saveError,
}: Props) {
  const [error, setError] = useState("");
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [locationKind, setLocationKind] = useState<LocationKind>(
    event?.locationKind ??
      (event?.location.toLowerCase() === "online"
        ? "online"
        : event
          ? "unknown"
          : "city"),
  );
  const [place, setPlace] = useState<EventPlace | undefined>(event?.place);
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
    if (locationKind === "city" && !place) {
      setError("Choose a country and city, or select Location to confirm.");
      return;
    }
    onSave({
      id: event?.id ?? crypto.randomUUID(),
      title,
      startDate,
      endDate,
      location:
        locationKind === "online"
          ? "Online"
          : place
            ? placeLabel(place)
            : event?.locationKind === undefined ||
                event?.locationKind === "unknown"
              ? (event?.location ?? "")
              : "",
      locationKind,
      place: locationKind === "city" ? place : undefined,
      categoryId: String(data.get("categoryId")),
      tagIds: data.getAll("tags").map(String),
      description: String(data.get("description") ?? "").trim(),
      url,
    });
  }
  return (
    <>
      <Modal
        title={event ? "Edit event" : "Add an event"}
        placement="right"
        onClose={onClose}
        closeLabel="Close event form"
        onSubmit={save}
        error={saveError || error}
        actions={
          <ModalActions
            onCancel={onClose}
            confirmLabel={event ? "Save changes" : "Add event"}
            leading={
              event && (
                <button
                  type="button"
                  className="text-button danger"
                  onClick={() => setConfirmDelete(true)}
                >
                  Remove event
                </button>
              )
            }
          />
        }
      >
        <FormField
          name="title"
          label="Event name"
          defaultValue={event?.title}
          placeholder="e.g. Product leaders conference"
          maxLength={160}
          required
          autoFocus
        />
        <div className="form-row">
          <FormField
            name="startDate"
            label="Start date"
            type="date"
            defaultValue={event?.startDate ?? date}
            min="1900-01-01"
            max="2200-12-31"
            required
          />
          <FormField
            name="endDate"
            label="End date"
            type="date"
            defaultValue={event?.endDate ?? date}
            min="1900-01-01"
            max="2200-12-31"
            required
          />
        </div>
        <LocationFields
          kind={locationKind}
          place={place}
          legacyLocation={event?.location}
          onKindChange={setLocationKind}
          onPlaceChange={setPlace}
        />
        <FormField
          name="categoryId"
          label="Category"
          type="select"
          defaultValue={event?.categoryId ?? ""}
          options={[
            { value: "", label: "Uncategorized" },
            ...categories.map((category) => ({
              value: category.id,
              label: category.name,
            })),
          ]}
        />
        <fieldset>
          <legend>Tags</legend>
          <div className="form-tags">
            {tags.map((tag) => (
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
        <FormField
          name="url"
          label="Event website"
          type="url"
          defaultValue={event?.url}
          placeholder="https://"
          maxLength={2000}
        />
        <FormField
          name="description"
          label="Notes"
          type="textarea"
          defaultValue={event?.description}
          placeholder="What should the team know?"
          maxLength={3000}
        />
      </Modal>
      {event && confirmDelete && (
        <ConfirmModal
          title={`Remove ${event.title}?`}
          description="This event will be removed from the calendar."
          confirmLabel="Remove event"
          onConfirm={() => onDelete(event.id)}
          danger
          error={saveError}
          onClose={() => setConfirmDelete(false)}
        />
      )}
    </>
  );
}
