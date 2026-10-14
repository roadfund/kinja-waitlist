import type { Metadata } from "next";
import type { ReactNode } from "react";
import { isAdmin } from "@/auth/current";
import { getStore, type Entry } from "@/db/store";
import { SignupsChart, SourceChart } from "@/app/list/charts";
import { sourcingLabel } from "@/waitlist/sourcing";
import { parseRange, ranges, summarize, type RangeId } from "@/waitlist/stats";

export const metadata: Metadata = {
  title: "Kinja waitlist",
  robots: { index: false, follow: false },
};

// The list depends on the admin session, so this page waits for that check.
export const instant = false;

function formatJoined(iso: string): string {
  return new Intl.DateTimeFormat("en-GB", { timeZone: "Africa/Monrovia", dateStyle: "medium", timeStyle: "short" }).format(new Date(iso));
}

function matches(entry: Entry, query: string): boolean {
  if (!query) return true;
  const haystack = [entry.name, entry.email, entry.business, sourcingLabel(entry.sourcing), entry.note ?? ""].join(" ").toLowerCase();
  return haystack.includes(query);
}

function formatCount(value: number): string {
  return new Intl.NumberFormat("en", { notation: value >= 10000 ? "compact" : "standard", maximumFractionDigits: 1 }).format(value);
}

function StatCard({ label, value, detail, size = "md" }: { label: string; value: string; detail?: ReactNode; size?: "lg" | "md" | "sm" }) {
  return (
    <div className="rounded-2xl bg-white p-4 sm:p-5">
      <p className="text-sm text-moss">{label}</p>
      <p className={`mt-2 font-bold leading-tight tracking-tight text-ink ${{ lg: "text-4xl sm:text-5xl", md: "text-3xl", sm: "text-lg sm:text-xl" }[size]}`}>{value}</p>
      {detail && <div className="mt-2 text-sm text-moss">{detail}</div>}
    </div>
  );
}

function Delta({ current, previous, period }: { current: number; previous: number; period: string }) {
  const change = current - previous;
  if (change === 0) return <p>Same as the previous {period}</p>;
  const up = change > 0;
  return (
    <p>
      <span className={`font-medium ${up ? "text-forest" : "text-danger"}`}>
        <span aria-hidden="true">{up ? "▲" : "▼"}</span> {up ? "+" : "−"}{Math.abs(change)}
      </span>{" "}
      vs the previous {period}
    </p>
  );
}

export default async function ListPage({ searchParams }: { searchParams: Promise<{ error?: string; q?: string; range?: string }> }) {
  const { error, q, range: rawRange } = await searchParams;
  if (!(await isAdmin())) return <SignIn error={error} />;

  const range = parseRange(rawRange);
  const rangeInfo = ranges.find((item) => item.id === range) ?? ranges[1];
  const all = await getStore().list();
  const summary = summarize(all, range);
  const query = (q ?? "").trim().toLowerCase();
  const entries = summary.entries.filter((entry) => matches(entry, query));
  const allLabel = all.length === 1 ? "1 person is on the list" : `${formatCount(all.length)} people are on the list`;
  const period = rangeInfo.days === null ? "" : `${rangeInfo.days} days`;
  const top = summary.bySource[0];
  const notePercent = summary.total ? Math.round((summary.withNote / summary.total) * 100) : 0;
  const hrefFor = (id: RangeId) => `/list?${new URLSearchParams({ range: id, ...(q ? { q } : {}) }).toString()}`;

  return (
    <div className="min-h-screen bg-cream text-forest">
      <div className="mx-auto max-w-6xl px-5 py-8 sm:px-10">
        <header className="flex items-center justify-between gap-4">
          <p className="text-2xl font-bold tracking-tight">kinja<span className="text-gold">.</span></p>
          <form action="/list/logout" method="post">
            <button className="text-sm font-medium underline decoration-sand underline-offset-4" type="submit">Sign out</button>
          </form>
        </header>

        <div className="mt-10 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-4xl font-bold tracking-tight text-ink">Waitlist</h1>
            <p className="mt-2 text-sm text-moss">{allLabel}</p>
          </div>
          <a className="inline-flex h-11 items-center rounded-full bg-forest-deep px-5 text-sm font-medium text-cream-soft hover:bg-ink" href="/list/export">Export CSV</a>
        </div>

        <nav className="mt-8 flex flex-wrap gap-2" aria-label="Date range">
          {ranges.map((item) => (
            <a
              className={`inline-flex h-10 items-center rounded-full px-4 text-sm font-medium ${item.id === range ? "bg-forest text-white" : "border border-sand bg-white text-forest hover:bg-cream-soft"}`}
              aria-current={item.id === range ? "page" : undefined}
              href={hrefFor(item.id)}
              key={item.id}
            >
              {item.label}
            </a>
          ))}
        </nav>

        <section className="mt-6 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4" aria-label="Summary">
          <StatCard
            size="lg"
            label="Signups"
            value={formatCount(summary.total)}
            detail={summary.previousTotal === null ? <p>Since the first signup</p> : <Delta current={summary.total} previous={summary.previousTotal} period={period} />}
          />
          <StatCard label="Average per day" value={summary.perDay < 10 ? summary.perDay.toFixed(1) : formatCount(Math.round(summary.perDay))} detail={<p>{rangeInfo.label.toLowerCase()}</p>} />
          <StatCard size="sm" label="Most common sourcing" value={top && top.count > 0 ? top.label : "—"} detail={top && top.count > 0 ? <p>{top.count} of {summary.total} signups</p> : <p>No signups yet</p>} />
          <StatCard label="Left a note" value={`${notePercent}%`} detail={<p>{summary.withNote} of {summary.total} signups</p>} />
        </section>

        <section className="mt-4 grid gap-4 lg:grid-cols-5">
          <div className="rounded-2xl bg-white p-5 lg:col-span-3">
            <h2 className="font-bold text-ink">Signups per {summary.bucketUnit}</h2>
            <p className="mt-1 text-sm text-moss">{rangeInfo.label}</p>
            <div className="mt-6">
              <SignupsChart buckets={summary.buckets} unit={summary.bucketUnit} />
            </div>
          </div>
          <div className="rounded-2xl bg-white p-5 lg:col-span-2">
            <h2 className="font-bold text-ink">How they source</h2>
            <p className="mt-1 text-sm text-moss">Share of signups, {rangeInfo.label.toLowerCase()}</p>
            <div className="mt-6">
              <SourceChart sources={summary.bySource} total={summary.total} />
            </div>
          </div>
        </section>

        <details className="mt-4 rounded-2xl bg-white p-5 text-sm">
          <summary className="cursor-pointer font-medium">Show chart data as a table</summary>
          <div className="mt-4 grid gap-6 sm:grid-cols-2">
            <table className="w-full text-left tabular-nums">
              <caption className="pb-2 text-left font-medium">Signups per {summary.bucketUnit}</caption>
              <thead><tr className="border-b border-line text-moss"><th className="py-2 font-normal">{summary.bucketUnit === "week" ? "Week of" : "Day"}</th><th className="py-2 text-right font-normal">Signups</th></tr></thead>
              <tbody>
                {summary.buckets.map((bucket) => (
                  <tr className="border-b border-line/60" key={bucket.start}><td className="py-1.5">{bucket.label.replace("Week of ", "")}</td><td className="py-1.5 text-right">{bucket.count}</td></tr>
                ))}
              </tbody>
            </table>
            <table className="w-full self-start text-left tabular-nums">
              <caption className="pb-2 text-left font-medium">How they source</caption>
              <thead><tr className="border-b border-line text-moss"><th className="py-2 font-normal">Method</th><th className="py-2 text-right font-normal">Signups</th></tr></thead>
              <tbody>
                {summary.bySource.map((source) => (
                  <tr className="border-b border-line/60" key={source.value}><td className="py-1.5">{source.label}</td><td className="py-1.5 text-right">{source.count}</td></tr>
                ))}
              </tbody>
            </table>
          </div>
        </details>

        <section className="mt-10" aria-labelledby="people">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <h2 id="people" className="text-2xl font-bold tracking-tight text-ink">People</h2>
            <form className="w-full max-w-md" action="/list" method="get" role="search">
              <input type="hidden" name="range" value={range} />
              <label className="sr-only" htmlFor="q">Search</label>
              <input id="q" name="q" defaultValue={q ?? ""} placeholder="Search name, email, or business" className="h-11 w-full rounded-full border border-sand bg-white px-5 outline-none focus:border-forest-deep focus:ring-4 focus:ring-forest/10" />
            </form>
          </div>
          {entries.length === 0 ? (
            <p className="mt-8 text-lg">{query ? "No one matches that search." : `No one joined in this period.`}</p>
          ) : (
            <div className="mt-6 overflow-x-auto rounded-2xl bg-white">
              <table className="w-full min-w-[46rem] border-collapse text-left text-sm">
                <thead>
                  <tr className="border-b border-line text-moss">
                    <th className="px-5 py-3 font-medium">Joined</th>
                    <th className="py-3 pr-4 font-medium">Name</th>
                    <th className="py-3 pr-4 font-medium">Email</th>
                    <th className="py-3 pr-4 font-medium">Business</th>
                    <th className="py-3 pr-4 font-medium">How they source</th>
                    <th className="py-3 pr-5 font-medium">Note</th>
                  </tr>
                </thead>
                <tbody>
                  {entries.map((entry) => (
                    <tr className="border-b border-line/60 last:border-0" key={entry.id}>
                      <td className="px-5 py-3 align-top whitespace-nowrap tabular-nums">{formatJoined(entry.createdAt)}</td>
                      <td className="py-3 pr-4 align-top text-ink">{entry.name}</td>
                      <td className="py-3 pr-4 align-top">{entry.email}</td>
                      <td className="py-3 pr-4 align-top">{entry.business}</td>
                      <td className="py-3 pr-4 align-top">{sourcingLabel(entry.sourcing)}</td>
                      <td className="max-w-xs py-3 pr-5 align-top whitespace-pre-wrap">{entry.note}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

function SignIn({ error }: { error?: string }) {
  const message = error === "password" ? "That password is not correct." : error === "config" ? "Admin sign-in is not configured." : null;
  return (
    <div className="flex min-h-screen items-center bg-[#f4f1e8] px-5 text-[#344e41]">
      <form action="/list/login" method="post" className="mx-auto w-full max-w-sm">
        <p className="text-2xl font-medium tracking-tight">kinja<span className="text-[#c4922a]">.</span></p>
        <h1 className="mt-10 text-4xl font-bold tracking-tight">The waitlist</h1>
        <p className="mt-3 text-sm leading-6 text-[#5d685e]">Enter the admin password to see who has joined.</p>
        <label className="sr-only" htmlFor="username">Username<input id="username" name="username" autoComplete="username" defaultValue="kinja" /></label>
        <label className="mt-8 block text-sm font-medium" htmlFor="password">
          Password
          <input id="password" name="password" type="password" autoComplete="current-password" required className="mt-2 h-12 w-full border border-[#d9d3c4] bg-white px-3 outline-none focus:border-[#24382c]" />
        </label>
        {message && <p className="mt-3 text-sm text-[#8c3a32]" role="alert">{message}</p>}
        <button className="mt-6 h-12 w-full bg-[#24382c] font-medium text-[#f4f1e8]" type="submit">See the list</button>
      </form>
    </div>
  );
}
