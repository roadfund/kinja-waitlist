import { mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { DatabaseSync } from "node:sqlite";
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

const EntryRow = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string(),
  business: z.string(),
  sourcing: z.enum(sourcingValues),
  note: z.string().nullable(),
  created_at: z.string(),
});

export type EntryStore = {
  insert(entry: Entry): "created" | "duplicate";
  list(): Entry[];
  count(): number;
  recentIds(limit: number): string[];
};

function isUniqueConstraint(error: unknown): boolean {
  return typeof error === "object" && error !== null && "message" in error && String(error.message).includes("UNIQUE constraint failed");
}

export function createStore(filename: string): EntryStore {
  if (filename !== ":memory:") mkdirSync(dirname(filename), { recursive: true });
  const db = new DatabaseSync(filename);
  db.prepare(`create table if not exists entries (
    id text primary key,
    name text not null,
    email text not null collate nocase unique,
    business text not null,
    sourcing text not null,
    note text,
    created_at text not null
  )`).run();
  const insert = db.prepare("insert into entries (id, name, email, business, sourcing, note, created_at) values (?, ?, ?, ?, ?, ?, ?)");
  const select = db.prepare("select id, name, email, business, sourcing, note, created_at from entries order by created_at desc");
  const findEmail = db.prepare("select id from entries where email = ? collate nocase");
  const countAll = db.prepare("select count(*) as total from entries");

  return {
    insert(entry) {
      if (findEmail.get(entry.email)) return "duplicate";
      try {
        insert.run(entry.id, entry.name, entry.email, entry.business, entry.sourcing, entry.note, entry.createdAt);
        return "created";
      } catch (error) {
        if (isUniqueConstraint(error)) return "duplicate";
        throw error;
      }
    },
    list() {
      return select.all().map((row) => {
        const parsed = EntryRow.parse(row);
        return {
          id: parsed.id,
          name: parsed.name,
          email: parsed.email,
          business: parsed.business,
          sourcing: parsed.sourcing,
          note: parsed.note,
          createdAt: parsed.created_at,
        };
      });
    },
    count() {
      return z.object({ total: z.number() }).parse(countAll.get()).total;
    },
    recentIds(limit) {
      const rows = db.prepare(`select id from entries order by created_at desc limit ${Math.max(0, Math.floor(limit))}`).all();
      return rows.map((row) => z.object({ id: z.string() }).parse(row).id);
    },
  };
}

let shared: EntryStore | undefined;

export function getStore(): EntryStore {
  shared ??= createStore(process.env.WAITLIST_DB ?? join(process.cwd(), ".data", "waitlist.db"));
  return shared;
}
