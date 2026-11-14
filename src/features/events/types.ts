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
    color: "#4f59c7",
    background: "#eff0ff",
  },
  {
    id: "ai",
    name: "AI & innovation",
    color: "#a1499a",
    background: "#faeffa",
  },
  {
    id: "marketing",
    name: "Marketing & growth",
    color: "#bc592b",
    background: "#fff1e9",
  },
  {
    id: "enterprise",
    name: "Enterprise",
    color: "#237969",
    background: "#eaf6f1",
  },
];
export const TAGS: Tag[] = [
  { id: "networking", name: "Networking", color: "#5468ad" },
  { id: "speaking", name: "Speaking opportunity", color: "#9c538b" },
  { id: "sponsorship", name: "Sponsorship", color: "#ac6b24" },
];

export function categoryFor(
  id: string,
  options: Category[] = CATEGORIES,
): Category {
  return (
    options.find((category) => category.id === id) ?? {
      id: "",
      name: "Uncategorized",
      color: "#697586",
      background: "#f0f2f4",
    }
  );
}
