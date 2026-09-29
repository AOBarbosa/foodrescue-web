import { describe, expect, it } from "vitest";
import { defaultPeriodRange, toSalePeriod } from "./period";

// Late evening, to catch UTC/local off-by-one mistakes.
const today = new Date(2026, 8, 24, 23, 30);

describe("defaultPeriodRange", () => {
  it("covers the last 30 days, ending today", () => {
    expect(defaultPeriodRange(today)).toEqual({ from: "2026-08-26", to: "2026-09-24" });
  });
});

describe("toSalePeriod", () => {
  it("starts at midnight and ends at midnight of the day after (end is exclusive)", () => {
    expect(toSalePeriod({ from: "2026-09-01", to: "2026-09-24" })).toEqual({
      startDate: "2026-09-01T00:00:00",
      endDate: "2026-09-25T00:00:00",
    });
  });

  it("keeps a single-day period covering that whole day", () => {
    expect(toSalePeriod({ from: "2026-09-24", to: "2026-09-24" })).toEqual({
      startDate: "2026-09-24T00:00:00",
      endDate: "2026-09-25T00:00:00",
    });
  });

  it("rolls over month and year boundaries", () => {
    expect(toSalePeriod({ from: "2026-12-31", to: "2026-12-31" }).endDate).toBe("2027-01-01T00:00:00");
  });
});
