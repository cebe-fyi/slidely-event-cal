import demoPlaces from "./demo-places.json";
import { isEventPlace, type EventPlace } from "./types";
import type { TeamEvent } from "../events/types";

/** Upgrade only the exact, explicitly named demo locations. Arbitrary legacy
 * text stays untouched and unpinned until a user selects a verified city. */
export function withDemoLocation(event: TeamEvent): TeamEvent {
  if (event.locationKind || event.place) return event;
  if (!event.id.startsWith("sample-")) return event;
  if (event.location.toLowerCase() === "online")
    return { ...event, locationKind: "online" };
  const place = (demoPlaces as Record<string, EventPlace>)[event.location];
  if (event.id.startsWith("sample-") && place)
    return { ...event, locationKind: "city", place };
  return event;
}
export function mappedPlace(event: TeamEvent) {
  return event.locationKind === "city" && isEventPlace(event.place)
    ? event.place
    : undefined;
}
export function groupMapEvents(events: TeamEvent[]) {
  const groups = new Map<string, { place: EventPlace; events: TeamEvent[] }>();
  const unmapped: TeamEvent[] = [];
  for (const event of events) {
    const place = mappedPlace(event);
    if (!place) {
      unmapped.push(event);
      continue;
    }
    const key = `${place.latitude},${place.longitude}`;
    const group = groups.get(key) ?? { place, events: [] };
    group.events.push(event);
    groups.set(key, group);
  }
  return { groups: [...groups.values()], unmapped };
}
