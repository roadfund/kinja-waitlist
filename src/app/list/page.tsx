import type { Metadata } from "next";
import { isAdmin } from "@/auth/current";
import { Dashboard } from "@/app/list/dashboard";
import { getStore } from "@/db/store";
import { parseRange } from "@/waitlist/stats";

export const metadata: Metadata = {
  title: "Kinja waitlist",
  robots: { index: false, follow: false },
};

// The list depends on the admin session, so this page waits for that check.
export const instant = false;

export default async function ListPage({ searchParams }: { searchParams: Promise<{ error?: string; q?: string; range?: string }> }) {
  const { error, q, range } = await searchParams;
  if (!(await isAdmin())) return <SignIn error={error} />;
  const all = await getStore().list();

  return (
    <div className="min-h-screen bg-cream text-forest">
      <div className="mx-auto max-w-6xl px-5 py-8 sm:px-10">
        <header className="flex items-center justify-between gap-4">
          <p className="text-2xl font-bold tracking-tight">kinja<span className="text-gold">.</span></p>
          <form action="/list/logout" method="post">
            <button className="text-sm font-medium underline decoration-sand underline-offset-4" type="submit">Sign out</button>
          </form>
        </header>

        <Dashboard all={all} initialRange={parseRange(range)} initialSearch={q ?? ""} />
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
