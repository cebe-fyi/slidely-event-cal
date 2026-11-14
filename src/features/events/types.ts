import { brandPalette, uncategorizedStyle } from "../../design/system";

export type Category = {
  id: string;
  name: string;
  color: string;
  background: string;
};
export type Tag = { id: string; name: string; color: string };
export type TeamEvent = {
  id: string;
  title: string;
  startDate: string;
  endDate: string;
  location: string;
  categoryId: string;
  tagIds: string[];
  description: string;
  url: string;
};

export const CATEGORIES: Category[] = [
  {
    id: "saas",
    name: "SaaS & technology",
    color: brandPalette[0].color,
    background: brandPalette[0].background,
  },
  {
    id: "ai",
    name: "AI & innovation",
    color: brandPalette[1].color,
    background: brandPalette[1].background,
  },
  {
    id: "marketing",
    name: "Marketing & growth",
    color: brandPalette[2].color,
    background: brandPalette[2].background,
  },
  {
    id: "enterprise",
    name: "Enterprise",
    color: brandPalette[3].color,
    background: brandPalette[3].background,
  },
];
export const TAGS: Tag[] = [
  { id: "networking", name: "Networking", color: brandPalette[0].color },
  {
    id: "speaking",
    name: "Speaking opportunity",
    color: brandPalette[1].color,
  },
  { id: "sponsorship", name: "Sponsorship", color: brandPalette[4].color },
];

export function categoryFor(
  id: string,
  options: Category[] = CATEGORIES,
): Category {
  return (
    options.find((category) => category.id === id) ?? {
      id: "",
      name: "Uncategorized",
      color: uncategorizedStyle.color,
      background: uncategorizedStyle.background,
    }
  );
}
