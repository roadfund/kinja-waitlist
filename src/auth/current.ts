import { cookies } from "next/headers";
import { connection } from "next/server";
import { readSession, SESSION_COOKIE } from "@/auth/session";

export async function isAdmin(): Promise<boolean> {
  await connection();
  const secret = process.env.SESSION_SECRET;
  if (!secret) return false;
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!token) return false;
  return readSession(token, secret, new Date());
}
