import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const tokens = JSON.parse(
  await readFile(path.join(root, "src/design/tokens.json"), "utf8"),
);
const lines = [
  "/* GENERATED from src/design/tokens.json. Run npm run design:generate; do not edit. */",
  ":root {",
];
function add(prefix, values) {
  for (const [name, value] of Object.entries(values))
    lines.push(`  --${prefix}${name}: ${value};`);
}
add("brand-", tokens.colors);
add(
  "",
  Object.fromEntries(
    Object.entries(tokens.semanticColors).map(([key, brand]) => [
      key,
      `var(--brand-${brand})`,
    ]),
  ),
);
lines.push(`  --font-sans: ${tokens.typography.family};`);
add("text-", tokens.typography.sizes);
add("weight-", tokens.typography.weights);
add("leading-", tokens.typography.leading);
add("tracking-", tokens.typography.tracking);
add("space-", tokens.spacing);
add("radius-", tokens.radii);
add("shadow-", tokens.shadows);
add("effect-", tokens.effects);
add("layout-", tokens.layout);
lines.push("}", "");
const output = lines.join("\n");
const target = path.join(root, "src/design/theme.css");
if (process.argv.includes("--check")) {
  if ((await readFile(target, "utf8")) !== output)
    throw new Error(
      "Design tokens changed. Run npm run design:generate to update the theme.",
    );
  console.log("Generated theme matches the central design tokens.");
} else {
  await writeFile(target, output);
  console.log("Generated src/design/theme.css from the central design tokens.");
}
