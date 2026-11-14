import test from "node:test";
import assert from "node:assert/strict";
import { brandPalette } from "../src/design/system";
import {
  parseWorkspace,
  removeVocabulary,
  restoreEvent,
  saveVocabulary,
  trashEvent,
  type WorkspaceData,
} from "../src/features/workspace/model";

function fixture(): WorkspaceData {
  return {
    version: 1,
    categories: [
      {
        id: "a",
        name: "SaaS",
        color: brandPalette[0].color,
        background: brandPalette[0].background,
      },
      {
        id: "b",
        name: "Enterprise",
        color: brandPalette[3].color,
        background: brandPalette[3].background,
      },
    ],
    tags: [
      { id: "x", name: "Networking", color: brandPalette[0].color },
      { id: "y", name: "Speaking", color: brandPalette[1].color },
    ],
    events: [
      {
        id: "e",
        title: "Test conference",
        startDate: "2026-11-20",
        endDate: "2026-11-22",
        location: "Online",
        description: "",
        url: "",
        categoryId: "a",
        tagIds: ["x", "y"],
      },
    ],
    trash: [],
  };
}

test("category merge reassigns live and deleted events without mutating the original", () => {
  const original = fixture();
  const withTrash = {
    ...original,
    trash: [{ ...original.events[0], id: "deleted" }],
  };
  const result = removeVocabulary(withTrash, "categories", "a", "b", true);
  assert.equal(result.events[0].categoryId, "b");
  assert.equal(result.trash[0].categoryId, "b");
  assert.equal(result.categories.length, 1);
  assert.equal(original.events[0].categoryId, "a");
});
test("tag merge deduplicates and tag deletion keeps the event", () => {
  const result = removeVocabulary(fixture(), "tags", "x", "y", true);
  assert.deepEqual(result.events[0].tagIds, ["y"]);
  const deleted = removeVocabulary(result, "tags", "y");
  assert.deepEqual(deleted.events[0].tagIds, []);
  assert.equal(deleted.events.length, 1);
});
test("category deletion explicitly uncategorizes or reassigns", () => {
  assert.equal(
    removeVocabulary(fixture(), "categories", "a").events[0].categoryId,
    "",
  );
  assert.equal(
    removeVocabulary(fixture(), "categories", "a", "b").events[0].categoryId,
    "b",
  );
  assert.throws(() =>
    removeVocabulary(fixture(), "categories", "a", "a", true),
  );
  assert.throws(() =>
    removeVocabulary(fixture(), "categories", "a", "missing", true),
  );
  assert.throws(() => removeVocabulary(fixture(), "tags", "x", "", true));
});
test("vocabulary names are trimmed, unique ignoring case, and colors validated", () => {
  const result = saveVocabulary(
    fixture(),
    "categories",
    "new",
    "  Healthcare  ",
    brandPalette[0].color,
  );
  assert.equal(result.categories[2].name, "Healthcare");
  assert.throws(() =>
    saveVocabulary(
      result,
      "categories",
      "other",
      "healthcare",
      brandPalette[0].color,
    ),
  );
  assert.throws(() =>
    saveVocabulary(
      result,
      "categories",
      "other",
      "Uncategorized",
      brandPalette[0].color,
    ),
  );
  assert.throws(() =>
    saveVocabulary(result, "tags", "other", "Good name", "red"),
  );
  assert.equal(
    saveVocabulary(
      result,
      "categories",
      "new",
      "Healthcare AI",
      brandPalette[1].color,
    ).categories.length,
    3,
  );
});

test("legacy saved colors migrate to the Slidely palette without losing records or associations", () => {
  const data = fixture();
  data.categories[0].color = "#112233";
  data.categories[0].background = "#11223315";
  data.tags[0].color = "#aabbcc";
  data.trash = [{ ...data.events[0], id: "deleted" }];
  const migrated = parseWorkspace(JSON.stringify(data));
  assert.equal(migrated.categories[0].color, brandPalette[0].color);
  assert.equal(migrated.tags[0].color, brandPalette[0].color);
  assert.deepEqual(migrated.events, data.events);
  assert.deepEqual(migrated.trash, data.trash);
  assert.deepEqual(
    migrated.categories.map((c) => [c.id, c.name]),
    data.categories.map((c) => [c.id, c.name]),
  );
  assert.throws(
    () => saveVocabulary(migrated, "tags", "off-brand", "Off brand", "#123456"),
    /Slidely palette/,
  );
});
test("trash and restore round trip event associations even after vocabulary merge", () => {
  const deleted = trashEvent(fixture(), "e");
  assert.equal(deleted.events.length, 0);
  const merged = removeVocabulary(deleted, "tags", "x", "y", true);
  const restored = restoreEvent(merged, "e");
  assert.equal(restored.trash.length, 0);
  assert.deepEqual(restored.events[0].tagIds, ["y"]);
  assert.throws(() => restoreEvent(restored, "e"));
});
test("saved workspace parser rejects corrupt data, broken references, duplicate IDs, invalid dates and dangerous links", () => {
  const data = fixture();
  assert.deepEqual(parseWorkspace(JSON.stringify(data)), data);
  assert.throws(() => parseWorkspace("{bad"));
  assert.throws(() => parseWorkspace(JSON.stringify({ ...data, version: 2 })));
  for (const patch of [
    { categoryId: "missing" },
    { tagIds: ["missing"] },
    { startDate: "2026-02-30" },
    { endDate: "2026-11-19" },
    { url: "javascript:alert(1)" },
  ]) {
    assert.throws(() =>
      parseWorkspace(
        JSON.stringify({ ...data, events: [{ ...data.events[0], ...patch }] }),
      ),
    );
  }
  assert.throws(() =>
    parseWorkspace(JSON.stringify({ ...data, trash: data.events })),
  );
});
