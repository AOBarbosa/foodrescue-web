import { describe, expect, it } from "vitest";
import { daysUntil, getExpirationStatus } from "./expiration";

// Late evening, to catch UTC/local off-by-one mistakes.
const today = new Date(2026, 8, 24, 23, 30);

describe("daysUntil", () => {
  it("counts calendar days in local time", () => {
    expect(daysUntil("2026-09-24", today)).toBe(0);
    expect(daysUntil("2026-09-25", today)).toBe(1);
    expect(daysUntil("2026-09-23", today)).toBe(-1);
    expect(daysUntil("2026-10-24", today)).toBe(30);
  });
});

describe("getExpirationStatus", () => {
  it.each([
    [null, "none"],
    ["2026-09-23", "expired"],
    ["2026-09-24", "expiring"],
    ["2026-09-27", "expiring"],
    ["2026-09-28", "ok"],
  ] as const)("%s → %s", (date, status) => {
    expect(getExpirationStatus(date, today)).toBe(status);
  });
});
