import test from "node:test";
import assert from "node:assert/strict";
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
      { id: "a", name: "SaaS", color: "#112233", background: "#11223315" },
      {
        id: "b",
        name: "Enterprise",
        color: "#334455",
        background: "#33445515",
      },
    ],
    tags: [
      { id: "x", name: "Networking", color: "#aabbcc" },
      { id: "y", name: "Speaking", color: "#123456" },
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
    "#aabbcc",
  );
  assert.equal(result.categories[2].name, "Healthcare");
  assert.throws(() =>
    saveVocabulary(result, "categories", "other", "healthcare", "#aabbcc"),
  );
  assert.throws(() =>
    saveVocabulary(result, "categories", "other", "Uncategorized", "#aabbcc"),
  );
  assert.throws(() =>
    saveVocabulary(result, "tags", "other", "Good name", "red"),
  );
  assert.equal(
    saveVocabulary(result, "categories", "new", "Healthcare AI", "#223344")
      .categories.length,
    3,
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
