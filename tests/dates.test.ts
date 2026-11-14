import assert from "node:assert/strict";
import test from "node:test";
import {
  daysInMonth,
  isValidDate,
  monthCells,
  overlaps,
  periodBounds,
} from "../src/lib/dates/calendar";

test("inclusive overlap includes a conference spanning December and January", () => {
  assert.equal(
    overlaps("2026-12-30", "2027-01-02", ...periodBounds(2027, 0)),
    true,
  );
  assert.equal(
    overlaps("2026-12-30", "2027-01-02", "2027-01-02", "2027-01-02"),
    true,
  );
  assert.equal(
    overlaps("2026-12-30", "2027-01-02", "2027-01-03", "2027-01-03"),
    false,
  );
});
test("leap years and impossible dates are handled", () => {
  assert.equal(daysInMonth(2028, 1), 29);
  assert.equal(isValidDate("2028-02-29"), true);
  assert.equal(isValidDate("2027-02-29"), false);
  assert.equal(isValidDate("2026-13-01"), false);
  assert.equal(isValidDate("2026-11-31"), false);
});
test("month starts on Monday and covers dates across year boundaries", () => {
  const january = monthCells(2027, 0);
  assert.equal(january[0].key, "2026-12-28");
  assert.equal(january.length % 7, 0);
  assert.equal(january.filter((d) => d.inMonth).length, 31);
});
test("calendar labels stay stable in different browser/server timezones", () => {
  const original = process.env.TZ;
  try {
    for (const tz of [
      "UTC",
      "America/Los_Angeles",
      "Asia/Kolkata",
      "Pacific/Auckland",
    ]) {
      process.env.TZ = tz;
      assert.equal(
        monthCells(2026, 10).find((d) => d.inMonth)?.key,
        "2026-11-01",
      );
      assert.deepEqual(periodBounds(2026, 11), ["2026-12-01", "2026-12-31"]);
    }
  } finally {
    if (original === undefined) delete process.env.TZ;
    else process.env.TZ = original;
  }
});
