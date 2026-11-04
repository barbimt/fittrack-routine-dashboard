import { describe, expect, it } from "vitest";
import { progressMonthFromParam, progressMonthHref, progressMonths } from "./range";

const today = new Date(Date.UTC(2026, 10, 4));

describe("progress months", () => {
  it("offers the newest six months and defaults to the current one", () => {
    expect(progressMonths(today).map((month) => month.id)).toEqual([
      "2026-11",
      "2026-10",
      "2026-09",
      "2026-08",
      "2026-07",
      "2026-06",
    ]);
    expect(progressMonthFromParam(undefined, today).from).toBe("2026-11-01");
    expect(progressMonthFromParam("2026-08", today).from).toBe("2026-08-01");
    expect(progressMonthFromParam("not-a-month", today).id).toBe("2026-11");
  });

  it("keeps the current month on the plain progress path", () => {
    expect(progressMonthHref("2026-11", today)).toBe("/progress");
    expect(progressMonthHref("2026-08", today)).toBe("/progress?from=2026-08");
  });
});
