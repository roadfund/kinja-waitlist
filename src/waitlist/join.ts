import { randomUUID } from "node:crypto";
import { z } from "zod";
import type { EntryStore } from "@/db/store";
import { sourcingLabel, sourcingValues } from "@/waitlist/sourcing";

export { sourcingLabel };

const JoinInput = z.object({
  name: z.string().trim().min(1, "Enter your name.").max(200, "Name is too long."),
  email: z.string().trim().email("Enter a valid email address.").max(320, "Email is too long.").transform((email) => email.toLowerCase()),
  business: z.string().trim().min(1, "Enter the business name.").max(200, "Business name is too long."),
  sourcing: z.enum(sourcingValues, { error: "Choose how you source." }),
  note: z.string().trim().max(1000, "Note is too long.").optional(),
});

export type JoinBody = {
  name: string;
  email: string;
  business: string;
  sourcing: string;
  note?: string;
};

export type JoinResult = { ok: true } | { ok: false; message: string };

export async function joinWaitlist(store: EntryStore, input: JoinBody, now = new Date()): Promise<JoinResult> {
  const note = input.note?.trim() ? input.note : undefined;
  const parsed = JoinInput.safeParse({ ...input, note });
  if (!parsed.success) return { ok: false, message: parsed.error.issues[0]?.message ?? "Some details are missing." };
  const saved = await store.insert({
    id: randomUUID(),
    name: parsed.data.name,
    email: parsed.data.email,
    business: parsed.data.business,
    sourcing: parsed.data.sourcing,
    note: parsed.data.note ?? null,
    createdAt: now.toISOString(),
  });
  if (saved === "duplicate") return { ok: false, message: "That email is already on the list." };
  return { ok: true };
}
