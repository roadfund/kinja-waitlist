import type { Metadata } from "next";
import { isAdmin } from "@/auth/current";
import { getStore, type Entry } from "@/db/store";
import { sourcingLabel } from "@/waitlist/sourcing";

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

export default async function ListPage({ searchParams }: { searchParams: Promise<{ error?: string; q?: string }> }) {
  const { error, q } = await searchParams;
  if (!(await isAdmin())) return <SignIn error={error} />;

  const query = (q ?? "").trim().toLowerCase();
  const entries = getStore().list().filter((entry) => matches(entry, query));
  const countLabel = entries.length === 1 ? "1 person" : `${entries.length} people`;

  return (
    <div className="min-h-screen bg-[#f4f1e8] text-[#344e41]">
      <div className="mx-auto max-w-6xl px-5 py-8 sm:px-10">
        <header className="flex items-center justify-between gap-4">
          <p className="text-2xl font-medium tracking-tight">kinja<span className="text-[#c4922a]">.</span></p>
          <form action="/list/logout" method="post">
            <button className="text-sm font-medium underline decoration-[#d9d3c4] underline-offset-4" type="submit">Sign out</button>
          </form>
        </header>
        <div className="mt-10 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-4xl font-bold tracking-tight">Who has joined</h1>
            <p className="mt-2 text-sm text-[#5d685e]">{countLabel}</p>
          </div>
          <a className="inline-flex h-11 items-center bg-[#24382c] px-4 text-sm font-medium text-[#f4f1e8]" href="/list/export">Export CSV</a>
        </div>
        <form className="mt-8" action="/list" method="get">
          <label className="block text-sm font-medium" htmlFor="q">Search</label>
          <input id="q" name="q" defaultValue={q ?? ""} placeholder="Name, email, or business" className="mt-2 h-12 w-full max-w-md border border-[#d9d3c4] bg-white px-3 outline-none focus:border-[#24382c]" />
        </form>
        {entries.length === 0 ? (
          <p className="mt-10 text-lg">{query ? "No one matches that search." : "No one has joined yet."}</p>
        ) : (
          <div className="mt-8 overflow-x-auto">
            <table className="w-full min-w-[46rem] border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-[#d9d3c4] text-[#5d685e]">
                  <th className="py-3 pr-4 font-medium">Joined</th>
                  <th className="py-3 pr-4 font-medium">Name</th>
                  <th className="py-3 pr-4 font-medium">Email</th>
                  <th className="py-3 pr-4 font-medium">Business</th>
                  <th className="py-3 pr-4 font-medium">How they source</th>
                  <th className="py-3 font-medium">Note</th>
                </tr>
              </thead>
              <tbody>
                {entries.map((entry) => (
                  <tr className="border-b border-[#e7e1d4]" key={entry.id}>
                    <td className="py-3 pr-4 align-top whitespace-nowrap">{formatJoined(entry.createdAt)}</td>
                    <td className="py-3 pr-4 align-top">{entry.name}</td>
                    <td className="py-3 pr-4 align-top">{entry.email}</td>
                    <td className="py-3 pr-4 align-top">{entry.business}</td>
                    <td className="py-3 pr-4 align-top">{sourcingLabel(entry.sourcing)}</td>
                    <td className="max-w-xs py-3 align-top whitespace-pre-wrap">{entry.note}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
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
