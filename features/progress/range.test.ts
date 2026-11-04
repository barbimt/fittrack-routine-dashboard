import { describe, expect, it } from "vitest";
import {
  progressMonthFromParam,
  progressMonths,
  progressRangeFromParam,
  progressRangeHref,
} from "./range";

const today = new Date(Date.UTC(2026, 10, 4));

describe("progress ranges", () => {
  it("keeps the 12-week view on the plain progress path", () => {
    expect(progressRangeFromParam(undefined).id).toBe("12w");
    expect(progressRangeHref("12w")).toBe("/progress");
    expect(progressRangeHref("4w")).toBe("/progress?range=4w");
  });
});

describe("progress months", () => {
  it("lists calendar months and closes the current one on today", () => {
    const months = progressMonths(today);
    expect(months[0]).toMatchObject({
      id: "2026-11",
      label: "November 2026",
      from: "2026-11-01",
      to: "2026-11-04",
    });
    expect(months.find((month) => month.id === "2026-10")).toMatchObject({
      from: "2026-10-01",
      to: "2026-10-31",
    });
    expect(progressMonthFromParam(undefined, today)).toBeNull();
    expect(progressMonthFromParam("2026-10", today)?.to).toBe("2026-10-31");
    expect(progressMonthFromParam("nope", today)).toBeNull();
  });
});
