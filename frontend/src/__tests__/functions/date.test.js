import { describe, it, expect } from "vitest";
import { toDayISO } from "../../functions/date";

describe("toDayISO", () => {
  it("serializes a valid Date to its ISO instant", () => {
    const d = new Date("2026-06-10T00:00:00.000Z");
    expect(toDayISO(d)).toBe("2026-06-10T00:00:00.000Z");
  });

  it("returns null for null / undefined (cleared field)", () => {
    expect(toDayISO(null)).toBeNull();
    expect(toDayISO(undefined)).toBeNull();
  });

  it("returns null for an invalid Date instead of throwing", () => {
    expect(toDayISO(new Date("not-a-date"))).toBeNull();
  });

  it("round-trips a local-midnight Date back to the same calendar day", () => {
    // Picker emits local midnight; new Date(iso) reads back in local time.
    const picked = new Date(2026, 5, 10); // 10 Jun, local midnight
    const back = new Date(toDayISO(picked));
    expect(back.getFullYear()).toBe(2026);
    expect(back.getMonth()).toBe(5);
    expect(back.getDate()).toBe(10);
  });
});
