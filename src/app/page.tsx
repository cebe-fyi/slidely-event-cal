import { CalendarWorkspace } from "@/features/calendar/calendar-workspace";

export const dynamic = "force-dynamic";

export default function Home() {
  // A stable server-provided date prevents hydration differences around midnight.
  const today = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
  return <CalendarWorkspace today={today} />;
}
