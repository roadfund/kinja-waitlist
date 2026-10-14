import { describe, expect, it } from "vitest";
import { passwordMatches, readSession, signSession } from "@/auth/session";

const secret = "test-session-secret";
const now = new Date("2026-10-12T13:00:00.000Z");

describe("admin session", () => {
  it("accepts the configured password and rejects anything else", () => {
    expect(passwordMatches("kinja-waitlist-admin", "kinja-waitlist-admin")).toBe(true);
    expect(passwordMatches("wrong", "kinja-waitlist-admin")).toBe(false);
    expect(passwordMatches("kinja-waitlist-admin", "")).toBe(false);
  });

  it("signs a session that stays valid until it expires", () => {
    const token = signSession(secret, now);
    expect(readSession(token, secret, now)).toBe(true);
    expect(readSession(token, "other-secret", now)).toBe(false);
    expect(readSession(token, secret, new Date(now.getTime() + 8 * 24 * 60 * 60 * 1000))).toBe(false);
    expect(readSession("not-a-token", secret, now)).toBe(false);
  });
});
