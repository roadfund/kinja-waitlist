import { createHash, createHmac, timingSafeEqual } from "node:crypto";

const WEEK_MS = 7 * 24 * 60 * 60 * 1000;
export const SESSION_COOKIE = "kinja_waitlist_session";
export const SESSION_MAX_AGE = WEEK_MS / 1000;

export function passwordMatches(input: string, expected: string): boolean {
  if (!expected) return false;
  const actual = createHash("sha256").update(input).digest();
  const wanted = createHash("sha256").update(expected).digest();
  return timingSafeEqual(actual, wanted);
}

export function signSession(secret: string, now = new Date()): string {
  const payload = String(now.getTime() + WEEK_MS);
  const mac = createHmac("sha256", secret).update(payload).digest("base64url");
  return `${payload}.${mac}`;
}

export function readSession(token: string, secret: string, now = new Date()): boolean {
  const parts = token.split(".");
  const payload = parts[0];
  const mac = parts[1];
  if (!payload || !mac || parts.length !== 2) return false;
  const expected = createHmac("sha256", secret).update(payload).digest("base64url");
  const actualBytes = Buffer.from(mac);
  const expectedBytes = Buffer.from(expected);
  if (actualBytes.length !== expectedBytes.length || !timingSafeEqual(actualBytes, expectedBytes)) return false;
  const expiresAt = Number(payload);
  return Number.isFinite(expiresAt) && expiresAt > now.getTime();
}

export function sessionCookieOptions(): { httpOnly: true; sameSite: "lax"; secure: boolean; maxAge: number; path: "/" } {
  return { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", maxAge: SESSION_MAX_AGE, path: "/" };
}
