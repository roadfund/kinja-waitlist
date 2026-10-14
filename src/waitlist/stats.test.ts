import { describe, expect, it } from "vitest";
import type { Entry } from "@/db/store";
import { parseRange, summarize } from "@/waitlist/stats";

const now = new Date("2026-10-14T12:00:00Z");

function entry(id: string, createdAt: string, sourcing: Entry["sourcing"], note: string | null = null): Entry {
  return { id, name: id, email: `${id}@example.com`, business: "Hub", sourcing, note, createdAt };
}

const entries = [
  entry("a", "2026-10-14T08:00:00Z", "FARMERS", "Cassava"),
  entry("b", "2026-10-13T08:00:00Z", "FARMERS"),
  entry("c", "2026-10-09T08:00:00Z", "COOPERATIVES"),
  entry("d", "2026-10-03T08:00:00Z", "TRADERS"),
  entry("e", "2026-06-01T08:00:00Z", "MIXED"),
];

describe("summarize", () => {
  it("counts the range, the period before it, and one column per day", () => {
    const summary = summarize(entries, "7d", now);
    expect(summary.total).toBe(3);
    expect(summary.previousTotal).toBe(1);
    expect(summary.withNote).toBe(1);
    expect(summary.bucketUnit).toBe("day");
    expect(summary.buckets).toHaveLength(7);
    expect(summary.buckets.at(-1)).toMatchObject({ label: "14 Oct", count: 1 });
    expect(summary.buckets.reduce((sum, bucket) => sum + bucket.count, 0)).toBe(3);
  });

  it("sorts sourcing methods by count and keeps the ones with none", () => {
    const summary = summarize(entries, "30d", now);
    expect(summary.bySource[0]).toMatchObject({ value: "FARMERS", count: 2 });
    expect(summary.bySource).toHaveLength(6);
  });

  it("groups all time by week once it spans more than 90 days", () => {
    const summary = summarize(entries, "all", now);
    expect(summary.total).toBe(5);
    expect(summary.previousTotal).toBeNull();
    expect(summary.bucketUnit).toBe("week");
    expect(summary.buckets.reduce((sum, bucket) => sum + bucket.count, 0)).toBe(5);
  });

  it("handles an empty list", () => {
    const summary = summarize([], "all", now);
    expect(summary.total).toBe(0);
    expect(summary.buckets).toHaveLength(1);
  });
});

describe("parseRange", () => {
  it("falls back to 30 days", () => {
    expect(parseRange("90d")).toBe("90d");
    expect(parseRange("forever")).toBe("30d");
    expect(parseRange(undefined)).toBe("30d");
  });
});
