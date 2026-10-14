import type { Entry } from "@/db/store";
import { sourcingLabel } from "@/waitlist/sourcing";

function cell(value: string): string {
  if (/[",\n]/.test(value)) return `"${value.replaceAll('"', '""')}"`;
  return value;
}

export function entriesToCsv(entries: readonly Entry[]): string {
  const header = ["Joined", "Name", "Email", "Business", "How they source", "Note"];
  const lines = entries.map((entry) =>
    [entry.createdAt, entry.name, entry.email, entry.business, sourcingLabel(entry.sourcing), entry.note ?? ""].map(cell).join(","),
  );
  return [header.join(","), ...lines].join("\n");
}
