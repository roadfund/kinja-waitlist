"use server";

import { headers } from "next/headers";
import { getStore } from "@/db/store";
import { joinWaitlist } from "@/waitlist/join";
import { allowJoin } from "@/waitlist/rate-limit";
import type { JoinState } from "@/waitlist/state";

function text(formData: FormData, name: string): string {
  const value = formData.get(name);
  return typeof value === "string" ? value : "";
}

export async function joinAction(_previous: JoinState, formData: FormData): Promise<JoinState> {
  const joined: JoinState = {
    status: "joined",
    firstName: text(formData, "name").trim().split(/\s+/)[0] ?? "",
    email: text(formData, "email").trim().toLowerCase(),
  };
  const website = formData.get("website");
  if (typeof website === "string" && website.trim()) return joined;
  const headerList = await headers();
  const ip = headerList.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
  if (!allowJoin(ip)) return { status: "error", message: "Too many attempts. Try again in a little while." };
  const result = joinWaitlist(getStore(), {
    name: text(formData, "name"),
    email: text(formData, "email"),
    business: text(formData, "business"),
    sourcing: text(formData, "sourcing"),
    note: text(formData, "note"),
  });
  if (!result.ok) return { status: "error", message: result.message };
  return joined;
}
