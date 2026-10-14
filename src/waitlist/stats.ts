import type { Entry } from "@/db/store";
import { sourcingChoices, type Sourcing } from "@/waitlist/sourcing";

export const ranges = [
  { id: "7d", label: "Last 7 days", days: 7 },
  { id: "30d", label: "Last 30 days", days: 30 },
  { id: "90d", label: "Last 90 days", days: 90 },
  { id: "all", label: "All time", days: null },
] as const;

export type RangeId = (typeof ranges)[number]["id"];

export function parseRange(value: string | undefined): RangeId {
  return ranges.find((range) => range.id === value)?.id ?? "30d";
}

export type Bucket = { start: string; label: string; count: number };
export type SourceCount = { value: Sourcing; label: string; count: number };

export type Summary = {
  entries: Entry[];
  total: number;
  // Signups in the period of the same length just before this one; null for "All time".
  previousTotal: number | null;
  perDay: number;
  withNote: number;
  buckets: Bucket[];
  bucketUnit: "day" | "week";
  bySource: SourceCount[];
};

const dayMs = 24 * 60 * 60 * 1000;

// Days are counted in UTC, which is also Monrovia time.
function startOfDay(time: number): number {
  return Math.floor(time / dayMs) * dayMs;
}

function bucketLabel(start: number, unit: "day" | "week"): string {
  const date = new Intl.DateTimeFormat("en-GB", { timeZone: "UTC", day: "numeric", month: "short" }).format(new Date(start));
  return unit === "week" ? `Week of ${date}` : date;
}

export function summarize(all: readonly Entry[], rangeId: RangeId, now = new Date()): Summary {
  const range = ranges.find((item) => item.id === rangeId) ?? ranges[1];
  const today = startOfDay(now.getTime());
  const times = all.map((entry) => new Date(entry.createdAt).getTime());
  const earliest = times.length ? startOfDay(Math.min(...times)) : today;
  const from = range.days === null ? earliest : today - (range.days - 1) * dayMs;
  const days = Math.round((today - from) / dayMs) + 1;

  const entries = all.filter((entry) => new Date(entry.createdAt).getTime() >= from);
  const previousTotal = range.days === null ? null : all.filter((entry) => {
    const time = new Date(entry.createdAt).getTime();
    return time >= from - range.days * dayMs && time < from;
  }).length;

  // Past 90 days a column per day gets too thin, so group by week.
  const unit = days > 90 ? "week" : "day";
  const size = unit === "week" ? 7 * dayMs : dayMs;
  const buckets: Bucket[] = [];
  for (let start = from; start <= today; start += size) {
    buckets.push({ start: new Date(start).toISOString(), label: bucketLabel(start, unit), count: 0 });
  }
  for (const entry of entries) {
    const index = Math.floor((new Date(entry.createdAt).getTime() - from) / size);
    const bucket = buckets[Math.min(Math.max(index, 0), buckets.length - 1)];
    if (bucket) bucket.count += 1;
  }

  const bySource = sourcingChoices
    .map(([value, label]) => ({ value, label, count: entries.filter((entry) => entry.sourcing === value).length }))
    .sort((a, b) => b.count - a.count);

  return {
    entries,
    total: entries.length,
    previousTotal,
    perDay: entries.length / days,
    withNote: entries.filter((entry) => entry.note).length,
    buckets,
    bucketUnit: unit,
    bySource,
  };
}
