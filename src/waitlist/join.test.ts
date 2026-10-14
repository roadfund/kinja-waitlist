import { describe, expect, it } from "vitest";
import { createStore } from "@/db/store";
import { joinWaitlist, sourcingLabel } from "@/waitlist/join";
import { entriesToCsv } from "@/waitlist/csv";

const valid = {
  name: "Amina Kollie",
  email: "amina@example.com",
  business: "Jimmy's Group",
  sourcing: "COOPERATIVES",
  note: "We buy cassava through two cooperatives.",
};

describe("joinWaitlist", () => {
  it("stores a request and keeps the email unique regardless of case", () => {
    const store = createStore(":memory:");
    expect(joinWaitlist(store, valid)).toEqual({ ok: true });
    expect(store.list()).toMatchObject([{ name: "Amina Kollie", email: "amina@example.com", business: "Jimmy's Group", sourcing: "COOPERATIVES" }]);
    expect(joinWaitlist(store, { ...valid, email: "Amina@Example.com" })).toEqual({ ok: false, message: "That email is already on the list." });
    expect(store.list()).toHaveLength(1);
  });

  it("requires a name, a real email, a business, and a known sourcing method", () => {
    const store = createStore(":memory:");
    expect(joinWaitlist(store, { ...valid, name: "  " }).ok).toBe(false);
    expect(joinWaitlist(store, { ...valid, email: "not-an-email" }).ok).toBe(false);
    expect(joinWaitlist(store, { ...valid, business: "" }).ok).toBe(false);
    expect(joinWaitlist(store, { ...valid, sourcing: "friends" }).ok).toBe(false);
    expect(store.list()).toHaveLength(0);
  });

  it("allows a request with no note", () => {
    const store = createStore(":memory:");
    expect(joinWaitlist(store, { ...valid, note: "  " })).toEqual({ ok: true });
    expect(store.list()[0]?.note).toBeNull();
  });
});

describe("entriesToCsv", () => {
  it("uses the sourcing label and escapes commas", () => {
    const csv = entriesToCsv([{ id: "1", name: "Amina Kollie", email: "amina@example.com", business: "Jimmy's Group, Ltd", sourcing: "COOPERATIVES", note: 'Says "hello"', createdAt: "2026-10-12T13:00:00.000Z" }]);
    expect(csv).toContain("How they source");
    expect(csv).toContain(sourcingLabel("COOPERATIVES"));
    expect(csv).toContain('"Jimmy\'s Group, Ltd"');
    expect(csv).toContain('"Says ""hello"""');
  });
});
