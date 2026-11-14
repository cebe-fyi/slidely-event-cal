import { isValidDate } from "../../lib/dates/calendar";
import type { Category, Tag, TeamEvent } from "../events/types";
import { normalizePaletteColor, paletteColor } from "../../design/system";
import { isEventPlace } from "../locations/types";
import { withDemoLocation } from "../locations/event-location";

export type WorkspaceData = {
  version: 1;
  events: TeamEvent[];
  categories: Category[];
  tags: Tag[];
  trash: TeamEvent[];
};
export type VocabularyKind = "categories" | "tags";

function normalized(value: string) {
  return value.trim().toLocaleLowerCase("en-US");
}
function transformEvents(
  data: WorkspaceData,
  transform: (event: TeamEvent) => TeamEvent,
): Pick<WorkspaceData, "events" | "trash"> {
  // Keep associations consistent in trash as well, so restoring cannot resurrect deleted tags.
  return {
    events: data.events.map(transform),
    trash: data.trash.map(transform),
  };
}

export function saveVocabulary(
  data: WorkspaceData,
  kind: VocabularyKind,
  id: string,
  name: string,
  color: string,
): WorkspaceData {
  name = name.trim();
  if (!name || name.length > 64)
    throw new Error("Use a name between 1 and 64 characters.");
  if (kind === "categories" && normalized(name) === "uncategorized")
    throw new Error("Uncategorized is reserved for events without a category.");
  if (!/^#[0-9a-f]{6}$/i.test(color))
    throw new Error("Choose a valid six-digit color.");
  const preset = paletteColor(color);
  if (!preset) throw new Error("Choose a color from the Slidely palette.");
  if (
    data[kind].some(
      (item) => item.id !== id && normalized(item.name) === normalized(name),
    )
  )
    throw new Error(
      `A ${kind === "categories" ? "category" : "tag"} with that name already exists.`,
    );
  const item = {
    id,
    name,
    color,
    ...(kind === "categories" ? { background: preset.background } : {}),
  };
  const items = data[kind].some((item) => item.id === id)
    ? data[kind].map((existing) => (existing.id === id ? item : existing))
    : [...data[kind], item];
  return { ...data, [kind]: items } as WorkspaceData;
}

export function removeVocabulary(
  data: WorkspaceData,
  kind: VocabularyKind,
  sourceId: string,
  targetId = "",
  merging = false,
): WorkspaceData {
  if (!data[kind].some((item) => item.id === sourceId))
    throw new Error(
      "This item has already been removed. Close this action and try again.",
    );
  if (sourceId === targetId) throw new Error("Choose a different destination.");
  if (merging && !targetId) throw new Error("Choose an item to merge into.");
  if (targetId && !data[kind].some((item) => item.id === targetId))
    throw new Error("The destination no longer exists. Choose another item.");
  const updated = transformEvents(data, (event) =>
    kind === "categories"
      ? {
          ...event,
          categoryId:
            event.categoryId === sourceId ? targetId : event.categoryId,
        }
      : {
          ...event,
          tagIds: [
            ...new Set(
              event.tagIds.flatMap((id) =>
                id === sourceId ? (targetId ? [targetId] : []) : [id],
              ),
            ),
          ],
        },
  );
  return {
    ...data,
    ...updated,
    [kind]: data[kind].filter((item) => item.id !== sourceId),
  };
}

export function affectedEventCount(
  data: WorkspaceData,
  kind: VocabularyKind,
  id: string,
): number {
  return [...data.events, ...data.trash].filter((e) =>
    kind === "categories" ? e.categoryId === id : e.tagIds.includes(id),
  ).length;
}

export function trashEvent(data: WorkspaceData, id: string): WorkspaceData {
  const event = data.events.find((e) => e.id === id);
  if (!event) throw new Error("This event has already been removed.");
  return {
    ...data,
    events: data.events.filter((e) => e.id !== id),
    trash: [...data.trash.filter((e) => e.id !== id), event],
  };
}

export function restoreEvent(data: WorkspaceData, id: string): WorkspaceData {
  const event = data.trash.find((e) => e.id === id);
  if (!event) throw new Error("This event has already been restored.");
  if (data.events.some((e) => e.id === id))
    throw new Error("An event with this ID already exists.");
  return {
    ...data,
    trash: data.trash.filter((e) => e.id !== id),
    events: [...data.events, event],
  };
}

function record(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
function boundedString(value: unknown, max: number): value is string {
  return typeof value === "string" && value.length <= max;
}
function hasUniqueIds(items: { id: string }[]) {
  return new Set(items.map((i) => i.id)).size === items.length;
}

export function parseWorkspace(serialized: string): WorkspaceData {
  const value: unknown = JSON.parse(serialized);
  if (
    !record(value) ||
    value.version !== 1 ||
    !Array.isArray(value.events) ||
    !Array.isArray(value.categories) ||
    !Array.isArray(value.tags) ||
    !Array.isArray(value.trash)
  )
    throw new Error("Unsupported saved workspace format.");
  if (
    value.events.length + value.trash.length > 5000 ||
    value.categories.length > 200 ||
    value.tags.length > 500
  )
    throw new Error("This preview has reached its local data limit.");
  for (const items of [value.categories, value.tags]) {
    if (
      !items.every(
        (item) =>
          record(item) &&
          boundedString(item.id, 100) &&
          item.id.length > 0 &&
          boundedString(item.name, 64) &&
          item.name.trim().length > 0 &&
          boundedString(item.color, 7) &&
          /^#[0-9a-f]{6}$/i.test(item.color),
      )
    )
      throw new Error("Saved categories or tags are invalid.");
    if (
      !hasUniqueIds(items) ||
      new Set(items.map((item) => normalized(item.name))).size !== items.length
    )
      throw new Error("Saved category or tag names must be unique.");
  }
  if (
    !value.categories.every(
      (item) =>
        boundedString(item.background, 9) &&
        /^#[0-9a-f]{6}([0-9a-f]{2})?$/i.test(item.background),
    )
  )
    throw new Error("Saved category colors are invalid.");
  const categoryIds = new Set(value.categories.map((item) => item.id));
  const tagIds = new Set(value.tags.map((item) => item.id));
  const allEvents = [...value.events, ...value.trash];
  if (
    !allEvents.every(
      (event) =>
        record(event) &&
        boundedString(event.id, 100) &&
        event.id.length > 0 &&
        boundedString(event.title, 160) &&
        event.title.trim().length > 0 &&
        boundedString(event.startDate, 10) &&
        isValidDate(event.startDate) &&
        boundedString(event.endDate, 10) &&
        isValidDate(event.endDate) &&
        event.endDate >= event.startDate &&
        boundedString(event.location, 160) &&
        (event.locationKind === undefined ||
          ["city", "online", "unknown"].includes(
            event.locationKind as string,
          )) &&
        (event.place === undefined || isEventPlace(event.place)) &&
        (event.locationKind !== "city" || isEventPlace(event.place)) &&
        (event.place === undefined || event.locationKind === "city") &&
        boundedString(event.description, 3000) &&
        boundedString(event.url, 2000) &&
        (!event.url || /^https?:\/\//i.test(event.url)) &&
        boundedString(event.categoryId, 100) &&
        (!event.categoryId || categoryIds.has(event.categoryId)) &&
        Array.isArray(event.tagIds) &&
        event.tagIds.every((id) => typeof id === "string" && tagIds.has(id)) &&
        new Set(event.tagIds).size === event.tagIds.length,
    )
  )
    throw new Error(
      "Saved events have invalid dates, links, or category/tag references.",
    );
  if (!hasUniqueIds(allEvents))
    throw new Error("Saved events must have unique IDs.");
  const data = value as WorkspaceData;
  // Existing saved previews may use the old arbitrary palette. Upgrade colors only,
  // without discarding event data, user-defined names, IDs, links, or trash records.
  return {
    ...data,
    events: data.events.map(withDemoLocation),
    trash: data.trash.map(withDemoLocation),
    categories: data.categories.map((item, index) => {
      const preset = normalizePaletteColor(item.color, index);
      return { ...item, color: preset.color, background: preset.background };
    }),
    tags: data.tags.map((item, index) => ({
      ...item,
      color: normalizePaletteColor(item.color, index).color,
    })),
  };
}
