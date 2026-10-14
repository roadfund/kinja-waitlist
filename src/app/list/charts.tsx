"use client";

import { useState, type KeyboardEvent } from "react";
import type { Bucket, SourceCount } from "@/waitlist/stats";

// Round the axis up to a clean step (1, 2, 5, 10, 20, 50...) so ticks read as whole numbers.
function niceScale(max: number): { top: number; step: number } {
  if (max <= 4) return { top: Math.max(max, 1), step: 1 };
  const rough = max / 4;
  const magnitude = 10 ** Math.floor(Math.log10(rough));
  const step = [1, 2, 5, 10].map((n) => n * magnitude).find((n) => n >= rough) ?? rough;
  return { top: Math.ceil(max / step) * step, step };
}

// Near either edge, anchor the tooltip on its inner side so it stays inside the card.
function edge(index: number, count: number): string {
  const position = (index + 0.5) / count;
  if (position > 0.8) return "-translate-x-[calc(100%-0.75rem)]";
  if (position < 0.2) return "-translate-x-3";
  return "-translate-x-1/2";
}

function people(count: number): string {
  return count === 1 ? "1 signup" : `${count} signups`;
}

export function SignupsChart({ buckets, unit }: { buckets: Bucket[]; unit: "day" | "week" }) {
  const [active, setActive] = useState<number | null>(null);
  const max = Math.max(0, ...buckets.map((bucket) => bucket.count));
  const { top, step } = niceScale(max);
  const ticks = Array.from({ length: Math.floor(top / step) + 1 }, (_, index) => index * step);
  const peak = buckets.findIndex((bucket) => bucket.count === max && max > 0);
  const shown = active === null ? null : buckets[active];
  const xLabels = new Set([0, Math.floor((buckets.length - 1) / 2), buckets.length - 1]);

  function onKey(event: KeyboardEvent<HTMLDivElement>): void {
    if (event.key !== "ArrowRight" && event.key !== "ArrowLeft") return;
    event.preventDefault();
    const delta = event.key === "ArrowRight" ? 1 : -1;
    setActive((current) => Math.min(Math.max((current ?? (delta > 0 ? -1 : buckets.length)) + delta, 0), buckets.length - 1));
  }

  return (
    <div>
      <div className="flex">
        <div className="relative mr-3 h-48 w-6 shrink-0 text-right text-xs tabular-nums text-moss" aria-hidden="true">
          {ticks.map((tick) => (
            <span className="absolute right-0 translate-y-1/2" key={tick} style={{ bottom: `${(tick / top) * 100}%` }}>{tick}</span>
          ))}
        </div>
        <div
          className="relative h-48 flex-1 rounded-sm outline-none focus-visible:ring-2 focus-visible:ring-forest/40"
          tabIndex={0}
          role="group"
          aria-label={`Signups per ${unit}. Use the left and right arrow keys to read each ${unit}.`}
          onKeyDown={onKey}
          onBlur={() => setActive(null)}
          onPointerLeave={() => setActive(null)}
        >
          {ticks.map((tick) => (
            <div className="absolute inset-x-0 border-t border-line" key={tick} style={{ bottom: `${(tick / top) * 100}%` }} aria-hidden="true" />
          ))}
          <div className="absolute inset-0 flex items-end gap-0.5">
            {buckets.map((bucket, index) => (
              <div className="relative flex h-full flex-1 items-end justify-center" key={bucket.start} onPointerEnter={() => setActive(index)}>
                {bucket.count > 0 && (
                  <div
                    className={`w-full max-w-6 rounded-t transition-colors ${active === index ? "bg-forest-deep" : active === null ? "bg-forest" : "bg-forest/70"}`}
                    style={{ height: `${(bucket.count / top) * 100}%` }}
                  />
                )}
                {index === peak && active === null && (
                  <span className="absolute pb-1 text-xs font-medium tabular-nums text-ink" style={{ bottom: `${(bucket.count / top) * 100}%` }}>{bucket.count}</span>
                )}
              </div>
            ))}
          </div>
          {shown && active !== null && (
            <div
              className={`pointer-events-none absolute z-10 -translate-y-full rounded-lg bg-ink px-3 py-2 text-left whitespace-nowrap text-white shadow-lg ${edge(active, buckets.length)}`}
              style={{ left: `${((active + 0.5) / buckets.length) * 100}%`, bottom: `calc(${Math.min((shown.count / top) * 100, 62)}% + 0.5rem)` }}
            >
              <p className="text-sm font-bold">{people(shown.count)}</p>
              <p className="text-xs text-white/70">{shown.label}</p>
            </div>
          )}
          <p className="sr-only" aria-live="polite">{shown ? `${shown.label}: ${people(shown.count)}` : ""}</p>
        </div>
      </div>
      <div className="ml-9 mt-2 flex text-xs text-moss" aria-hidden="true">
        {buckets.map((bucket, index) => (
          <span className="relative flex-1" key={bucket.start}>
            {xLabels.has(index) && (
              <span className={`absolute top-0 whitespace-nowrap ${index === 0 ? "left-0" : index === buckets.length - 1 ? "right-0" : "left-1/2 -translate-x-1/2"}`}>
                {bucket.label.replace("Week of ", "")}
              </span>
            )}
          </span>
        ))}
      </div>
    </div>
  );
}

export function SourceChart({ sources, total }: { sources: SourceCount[]; total: number }) {
  const [active, setActive] = useState<string | null>(null);
  const max = Math.max(1, ...sources.map((source) => source.count));
  return (
    <ul className="space-y-3" onPointerLeave={() => setActive(null)}>
      {sources.map((source) => {
        const share = total ? Math.round((source.count / total) * 100) : 0;
        return (
          <li className="grid grid-cols-[minmax(0,10rem)_1fr] items-center gap-3 text-sm leading-snug" key={source.value} onPointerEnter={() => setActive(source.value)}>
            <span className="text-ink">{source.label}</span>
            <span className="flex items-center gap-2">
              {source.count > 0 && (
                <span
                  className={`h-5 rounded-r transition-colors ${active === source.value ? "bg-forest-deep" : active === null ? "bg-forest" : "bg-forest/70"}`}
                  style={{ width: `calc((100% - 5rem) * ${source.count / max})` }}
                />
              )}
              <span className="shrink-0 tabular-nums text-moss">
                <span className="font-medium text-ink">{source.count}</span> · {share}%
              </span>
            </span>
          </li>
        );
      })}
    </ul>
  );
}
