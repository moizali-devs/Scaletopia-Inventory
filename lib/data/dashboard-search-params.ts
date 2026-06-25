import type { DashboardDateRange } from "@/lib/data/dashboard";

export type DateRangePreset = "today" | "7d" | "30d" | "all";

function addDays(date: Date, days: number): Date {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

/** `from`/`to` (yyyy-mm-dd, from a date input) win over `range` when present.
 * `to` is resolved to the start of the *next* day so the picked day is fully included. */
export function parseDashboardRange(searchParams: URLSearchParams): DashboardDateRange {
  const customFrom = searchParams.get("from");
  const customTo = searchParams.get("to");
  if (customFrom || customTo) {
    return {
      from: customFrom ? new Date(customFrom).toISOString() : undefined,
      to: customTo ? addDays(new Date(customTo), 1).toISOString() : undefined,
    };
  }

  const preset = (searchParams.get("range") as DateRangePreset | null) ?? "all";
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);

  switch (preset) {
    case "today":
      return { from: startOfToday.toISOString() };
    case "7d":
      return { from: addDays(startOfToday, -6).toISOString() };
    case "30d":
      return { from: addDays(startOfToday, -29).toISOString() };
    default:
      return {};
  }
}
