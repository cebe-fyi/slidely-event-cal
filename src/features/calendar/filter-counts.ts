import { eventMatchesSearch } from "../events/search";
import type { TeamEvent } from "../events/types";
import { overlaps } from "../../lib/dates/calendar";

/** Facet counts ignore their own selected group, so other choices keep useful counts. */
export function sidebarCounts(
  events: TeamEvent[],
  start: string,
  end: string,
  search: string,
  selectedCategories: string[],
  selectedTags: string[],
) {
  const categories = new Map<string, number>();
  const tags = new Map<string, number>();
  const query = search.trim().toLowerCase();
  for (const event of events) {
    if (
      !overlaps(event.startDate, event.endDate, start, end) ||
      !eventMatchesSearch(event, query)
    )
      continue;
    if (
      !selectedTags.length ||
      event.tagIds.some((id) => selectedTags.includes(id))
    )
      categories.set(
        event.categoryId,
        (categories.get(event.categoryId) ?? 0) + 1,
      );
    if (
      !selectedCategories.length ||
      selectedCategories.includes(event.categoryId)
    )
      for (const id of new Set(event.tagIds))
        tags.set(id, (tags.get(id) ?? 0) + 1);
  }
  return { categories, tags };
}
