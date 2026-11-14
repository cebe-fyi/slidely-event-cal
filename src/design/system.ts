import tokens from "./tokens.json";

export const icons = tokens.icons;
export const layout = tokens.layout;
const colors = tokens.colors as Record<string, string>;
export const brandPalette = tokens.palette.map((item) => ({
  id: item.id,
  name: item.name,
  color: colors[item.foreground],
  background: colors[item.background],
}));

export function paletteColor(color: string) {
  return brandPalette.find(
    (item) => item.color.toLowerCase() === color.toLowerCase(),
  );
}

export function normalizePaletteColor(color: string, index = 0) {
  // Legacy previews used unrelated colors. Preserve records and associations; migrate only presentation.
  return paletteColor(color) ?? brandPalette[index % brandPalette.length];
}

export const uncategorizedStyle = brandPalette.find(
  (item) => item.id === "neutral",
)!;
