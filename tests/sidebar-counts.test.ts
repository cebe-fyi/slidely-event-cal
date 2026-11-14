import test from "node:test";
import assert from "node:assert/strict";
import { sidebarCounts } from "../src/features/calendar/filter-counts";
import type { TeamEvent } from "../src/features/events/types";

const base = { location: "Online", description: "", url: "" };
const events: TeamEvent[] = [
  {
    ...base,
    id: "1",
    title: "AI conference",
    startDate: "2026-10-30",
    endDate: "2026-11-02",
    categoryId: "ai",
    tagIds: ["speaking", "networking"],
  },
  {
    ...base,
    id: "2",
    title: "SaaS forum",
    startDate: "2026-11-12",
    endDate: "2026-11-14",
    categoryId: "saas",
    tagIds: ["networking"],
  },
  {
    ...base,
    id: "3",
    title: "Later forum",
    startDate: "2026-12-01",
    endDate: "2026-12-01",
    categoryId: "saas",
    tagIds: ["speaking"],
  },
];
test("sidebar counts overlapping conferences once and excludes other months", () => {
  const counts = sidebarCounts(events, "2026-11-01", "2026-11-30", "", [], []);
  assert.equal(counts.categories.get("ai"), 1);
  assert.equal(counts.categories.get("saas"), 1);
  assert.equal(counts.tags.get("networking"), 2);
});
test("category choices keep counts while tag counts respect selected categories", () => {
  const counts = sidebarCounts(
    events,
    "2026-11-01",
    "2026-11-30",
    "",
    ["saas"],
    [],
  );
  assert.equal(counts.categories.get("ai"), 1);
  assert.equal(counts.tags.get("networking"), 1);
  assert.equal(counts.tags.get("speaking"), undefined);
});
test("tag choices keep counts while categories respect selected tags", () => {
  const counts = sidebarCounts(
    events,
    "2026-11-01",
    "2026-11-30",
    "",
    [],
    ["speaking"],
  );
  assert.equal(counts.categories.get("ai"), 1);
  assert.equal(counts.categories.get("saas"), undefined);
  assert.equal(counts.tags.get("networking"), 2);
});
test("both count groups respect search and empty results", () => {
  const counts = sidebarCounts(
    events,
    "2026-11-01",
    "2026-11-30",
    "SaaS",
    [],
    [],
  );
  assert.equal(counts.categories.get("ai"), undefined);
  assert.equal(counts.categories.get("saas"), 1);
  assert.equal(counts.tags.get("networking"), 1);
  assert.equal(
    sidebarCounts(events, "2026-11-01", "2026-11-30", "no match", [], [])
      .categories.size,
    0,
  );
});
