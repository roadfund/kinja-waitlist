import { neon, type NeonQueryFunction } from "@neondatabase/serverless";
import { z } from "zod";
import { sourcingValues, type Sourcing } from "@/waitlist/sourcing";

export type { Sourcing };

export type Entry = {
  id: string;
  name: string;
  email: string;
  business: string;
  sourcing: Sourcing;
  note: string | null;
  createdAt: string;
};

export type EntryStore = {
  insert(entry: Entry): Promise<"created" | "duplicate">;
  list(): Promise<Entry[]>;
  count(): Promise<number>;
  recentIds(limit: number): Promise<string[]>;
};

const EntryRow = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string(),
  business: z.string(),
  sourcing: z.enum(sourcingValues),
  note: z.string().nullable(),
  created_at: z.coerce.date(),
});

function toEntry(row: unknown): Entry {
  const parsed = EntryRow.parse(row);
  return {
    id: parsed.id,
    name: parsed.name,
    email: parsed.email,
    business: parsed.business,
    sourcing: parsed.sourcing,
    note: parsed.note,
    createdAt: parsed.created_at.toISOString(),
  };
}

export function createPostgresStore(sql: NeonQueryFunction<false, false>): EntryStore {
  let ready: Promise<unknown> | undefined;
  // Creates the table on first use, once per server process.
  function schema(): Promise<unknown> {
    ready ??= sql`create table if not exists entries (
      id text primary key,
      name text not null,
      email text not null,
      business text not null,
      sourcing text not null,
      note text,
      created_at timestamptz not null
    )`.then(() => sql`create unique index if not exists entries_email_key on entries (lower(email))`).catch((error: unknown) => {
      ready = undefined;
      throw error;
    });
    return ready;
  }

  return {
    async insert(entry) {
      await schema();
      const rows = await sql`insert into entries (id, name, email, business, sourcing, note, created_at)
        values (${entry.id}, ${entry.name}, ${entry.email}, ${entry.business}, ${entry.sourcing}, ${entry.note}, ${entry.createdAt})
        on conflict do nothing
        returning id`;
      return rows.length > 0 ? "created" : "duplicate";
    },
    async list() {
      await schema();
      const rows = await sql`select id, name, email, business, sourcing, note, created_at from entries order by created_at desc`;
      return rows.map(toEntry);
    },
    async count() {
      await schema();
      const rows = await sql`select count(*)::int as total from entries`;
      return z.object({ total: z.number() }).parse(rows[0]).total;
    },
    async recentIds(limit) {
      await schema();
      const rows = await sql`select id from entries order by created_at desc limit ${limit}`;
      return rows.map((row) => z.object({ id: z.string() }).parse(row).id);
    },
  };
}

// For tests: same behaviour as the Postgres store, kept in memory.
export function createMemoryStore(): EntryStore {
  const entries: Entry[] = [];
  const newestFirst = () => [...entries].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  return {
    async insert(entry) {
      if (entries.some((existing) => existing.id === entry.id || existing.email.toLowerCase() === entry.email.toLowerCase())) return "duplicate";
      entries.push(entry);
      return "created";
    },
    async list() {
      return newestFirst();
    },
    async count() {
      return entries.length;
    },
    async recentIds(limit) {
      return newestFirst().slice(0, limit).map((entry) => entry.id);
    },
  };
}

let shared: EntryStore | undefined;

export function getStore(): EntryStore {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL is not set. Add your Neon connection string to .env.local.");
  shared ??= createPostgresStore(neon(url));
  return shared;
}
