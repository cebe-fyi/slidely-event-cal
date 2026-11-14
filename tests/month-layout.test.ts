import assert from "node:assert/strict";
import test from "node:test";
import { monthWeeks } from "../src/features/calendar/month-layout";
import type { TeamEvent } from "../src/features/events/types";

function event(id: string, startDate: string, endDate: string): TeamEvent {
  return {
    id,
    title: id,
    startDate,
    endDate,
    categoryId: "",
    tagIds: [],
    location: "",
    description: "",
    url: "",
  };
}

test("inclusive multi-day event is one strip across three cells", () => {
  const weeks = monthWeeks(2026, 10, [
    event("conference", "2026-11-10", "2026-11-12"),
  ]);
  const segments = weeks.flatMap((week) => week.segments);
  assert.equal(segments.length, 1);
  assert.equal(segments[0].start, 1);
  assert.equal(segments[0].end, 3);
});

test("week and year boundaries clip strips and mark continuation", () => {
  const weeks = monthWeeks(2027, 0, [
    event("conference", "2026-12-30", "2027-01-05"),
  ]);
  const segments = weeks.flatMap((week) => week.segments);
  assert.equal(segments.length, 2);
  assert.deepEqual(
    segments.map((s) => [s.start, s.end, s.continuesBefore, s.continuesAfter]),
    [
      [2, 6, false, true],
      [0, 1, true, false],
    ],
  );
});

test("overlapping strips get separate lanes; adjacent dates reuse a lane", () => {
  const records = [
    event("long", "2026-11-10", "2026-11-12"),
    event("overlap", "2026-11-12", "2026-11-13"),
    event("later", "2026-11-13", "2026-11-14"),
  ];
  const segments = monthWeeks(2026, 10, records).flatMap((w) => w.segments);
  assert.deepEqual(
    segments.map((s) => [s.event.id, s.lane]),
    [
      ["long", 0],
      ["overlap", 1],
      ["later", 0],
    ],
  );
  assert.deepEqual(
    records.map((e) => e.id),
    ["long", "overlap", "later"],
  );
});

test("events outside the displayed grid are omitted; a whole-grid range stays bounded", () => {
  const segments = monthWeeks(2026, 10, [
    event("outside", "2025-01-01", "2025-02-01"),
    event("long", "2026-01-01", "2027-01-01"),
  ]).flatMap((w) => w.segments);
  assert.equal(segments.length, 6);
  assert.ok(
    segments.every(
      (s) =>
        s.start === 0 && s.end === 6 && s.continuesBefore && s.continuesAfter,
    ),
  );
});
