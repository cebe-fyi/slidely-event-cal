import type { TeamEvent } from "./types";
export function eventMatchesSearch(event: TeamEvent, search: string) {
  return `${event.title} ${event.location} ${event.place?.countryName ?? ""} ${event.place?.city ?? ""} ${event.description}`
    .toLowerCase()
    .includes(search.trim().toLowerCase());
}
