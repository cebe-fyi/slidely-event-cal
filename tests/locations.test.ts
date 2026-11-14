import test from "node:test";
import assert from "node:assert/strict";
import { countries, searchCities } from "../src/features/locations/catalog";
import { isEventPlace, placeKey } from "../src/features/locations/types";
import {
  groupMapEvents,
  withDemoLocation,
} from "../src/features/locations/event-location";
import { sampleEvents } from "../src/features/events/sample-events";
import { CATEGORIES, TAGS } from "../src/features/events/types";
import { parseWorkspace } from "../src/features/workspace/model";
import { eventMatchesSearch } from "../src/features/events/search";

test("global catalogue returns country-scoped, map-ready cities and ranks exact matches first", () => {
  assert.ok(countries.length > 200);
  const result = searchCities("IN", "Mumbai")!;
  assert.equal(result.cities[0].city, "Mumbai");
  assert.ok(
    result.cities.every(
      (city) => city.countryCode === "IN" && isEventPlace(city),
    ),
  );
  assert.equal(searchCities("XX", "Mumbai"), null);
  assert.ok(searchCities("US", "")!.total > 100);
  assert.equal(searchCities("US", "")!.cities.length, 100);
});
test("same-named cities retain distinct state-qualified selection keys", () => {
  const result = searchCities("US", "Springfield")!.cities.filter(
    (city) => city.city === "Springfield",
  );
  assert.ok(result.length > 1);
  assert.equal(new Set(result.map(placeKey)).size, result.length);
});
test("demo migration maps known sample cities without guessing arbitrary legacy locations", () => {
  const original = sampleEvents(2026, 10)[0];
  const legacy = { ...original, place: undefined, locationKind: undefined };
  assert.ok(withDemoLocation(legacy).place);
  assert.equal(
    withDemoLocation({ ...legacy, id: "user-event" }).place,
    undefined,
  );
  assert.equal(
    withDemoLocation({ ...legacy, location: "Venue to be announced" }).place,
    undefined,
  );
});
test("same-city events group without losing records and online events remain unpinned", () => {
  const seed = sampleEvents(2026, 10);
  const { groups, unmapped } = groupMapEvents([
    ...seed,
    { ...seed[0], id: "second-bengaluru" },
  ]);
  assert.equal(groups.length, 7);
  assert.equal(
    groups.find((group) => group.place.city === "Bengaluru")!.events.length,
    2,
  );
  assert.equal(unmapped.length, 2);
  assert.equal(
    groups.reduce((sum, group) => sum + group.events.length, 0) +
      unmapped.length,
    10,
  );
});
test("structured locations persist across reload and malformed or online coordinates are rejected", () => {
  const event = sampleEvents(2026, 10)[0];
  const workspace = {
    version: 1,
    events: [event],
    categories: CATEGORIES,
    tags: TAGS,
    trash: [],
  };
  assert.deepEqual(
    parseWorkspace(JSON.stringify(workspace)).events[0].place,
    event.place,
  );
  for (const patch of [
    { latitude: NaN },
    { latitude: 91 },
    { longitude: 181 },
    { countryCode: "bad" },
    { city: "" },
  ]) {
    assert.throws(() =>
      parseWorkspace(
        JSON.stringify({
          ...workspace,
          events: [{ ...event, place: { ...event.place, ...patch } }],
        }),
      ),
    );
  }
  assert.throws(() =>
    parseWorkspace(
      JSON.stringify({
        ...workspace,
        events: [{ ...event, locationKind: "online" }],
      }),
    ),
  );
  assert.ok(isEventPlace({ ...event.place, latitude: 0, longitude: 0 }));
});
test("country search matches structured names consistently across views", () => {
  const event = sampleEvents(2026, 10).find(
    (event) => event.place?.countryCode === "US",
  )!;
  assert.ok(eventMatchesSearch(event, "United States"));
});
