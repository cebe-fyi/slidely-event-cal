import { dateKey, daysInMonth } from "@/lib/dates/calendar";
import type { TeamEvent } from "./types";
import { withDemoLocation } from "../locations/event-location";

// Fictional sample events keep the prototype useful without suggesting real schedules.
export function sampleEvents(year: number, month: number): TeamEvent[] {
  const rows = [
    [3, 4, "SaaS founders forum", "Bengaluru, India", "saas", ["networking"]],
    [6, 6, "The enterprise AI roundtable", "Online", "ai", ["speaking"]],
    [
      10,
      12,
      "Future of work conference",
      "Singapore",
      "enterprise",
      ["networking", "sponsorship"],
    ],
    [
      14,
      14,
      "Growth leaders exchange",
      "Mumbai, India",
      "marketing",
      ["networking"],
    ],
    [
      17,
      19,
      "Applied AI summit",
      "San Francisco, USA",
      "ai",
      ["speaking", "networking"],
    ],
    [18, 18, "Product-led growth meetup", "Online", "saas", ["networking"]],
    [
      22,
      23,
      "B2B marketing collective",
      "London, UK",
      "marketing",
      ["sponsorship"],
    ],
    [
      26,
      27,
      "Enterprise technology forum",
      "New Delhi, India",
      "enterprise",
      ["speaking"],
    ],
  ] as const;
  const events: TeamEvent[] = rows.map(
    ([start, end, title, location, categoryId, tagIds], index) => ({
      id: `sample-${index}`,
      title,
      startDate: dateKey(year, month, start),
      endDate: dateKey(year, month, end),
      location,
      categoryId,
      tagIds: [...tagIds],
      description:
        "A fictional event for exploring the calendar layout. Real event details will be added after the shared workspace is connected.",
      url: "",
    }),
  );
  const nextMonth = new Date(Date.UTC(year, month + 1, 1));
  events.push({
    id: "sample-cross-month",
    title: "Design partners retreat",
    startDate: dateKey(year, month, daysInMonth(year, month)),
    endDate: dateKey(nextMonth.getUTCFullYear(), nextMonth.getUTCMonth(), 2),
    location: "Dubai, UAE",
    categoryId: "enterprise",
    tagIds: ["networking"],
    description: "A fictional multi-day example spanning two months.",
    url: "",
  });
  return events.map(withDemoLocation);
}
