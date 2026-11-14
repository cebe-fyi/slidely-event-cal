import assert from "node:assert/strict";
import { readFile, readdir } from "node:fs/promises";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const src = path.join(root, "src");
const tokens = JSON.parse(
  await readFile(path.join(src, "design/tokens.json"), "utf8"),
);
assert.equal(
  Object.keys(tokens.typography.sizes).length,
  4,
  "Keep the type scale to four intentional sizes.",
);
assert.deepEqual(
  Object.values(tokens.typography.weights),
  [400, 500, 600],
  "Use regular, medium, and semibold only.",
);
for (const value of Object.values(tokens.semanticColors))
  assert.ok(tokens.colors[value], `Unknown semantic color reference: ${value}`);
for (const color of tokens.palette) {
  assert.ok(
    tokens.colors[color.foreground] && tokens.colors[color.background],
    `Invalid Slidely palette entry: ${color.id}`,
  );
}

async function inspect(directory) {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const file = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      await inspect(file);
      continue;
    }
    if (!/\.(css|tsx?|svg)$/.test(file)) continue;
    const relative = path.relative(root, file).replaceAll("\\", "/");
    const text = await readFile(file, "utf8");
    if (!relative.startsWith("src/design/")) {
      if (relative !== "src/components/ui/modal.tsx")
        assert.ok(
          !/<dialog\b|\.showModal\(/.test(text),
          `Reuse the shared modal components instead of defining another modal shell in ${relative}.`,
        );
      assert.ok(
        !/#[\da-f]{3,8}\b/i.test(text),
        `Put color values in design/tokens.json, not ${relative}.`,
      );
      assert.ok(
        !/font-(?:family|size|weight)\s*:/.test(text),
        `Put typography definitions in design/typography.css, not ${relative}.`,
      );
      assert.ok(
        !/\b(?:fontFamily|fontSize|fontWeight|lineHeight|letterSpacing)\s*:/.test(
          text,
        ),
        `Use a shared typography role rather than inline text styling in ${relative}.`,
      );
      assert.ok(
        !/size=\{\d+\}/.test(text),
        `Use icons from design/system.ts in ${relative}.`,
      );
    }
    if (relative === "src/design/components.css") {
      assert.ok(
        !/#[\da-f]{3,8}\b|\brgba?\(/i.test(text),
        "Shared component recipes must reference color/shadow tokens.",
      );
      assert.ok(
        !/(?:font-family|font-size|font-weight|line-height|letter-spacing)\s*:/.test(
          text,
        ),
        "Typography role assignments belong only in design/typography.css.",
      );
    }
  }
}
await inspect(src);
console.log(
  "Central design rules pass: four type sizes, three weights, Slidely palette, and no scattered color/type/icon definitions.",
);
