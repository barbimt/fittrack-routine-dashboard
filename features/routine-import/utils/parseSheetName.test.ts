import { describe, expect, it } from "vitest";
import { parseSheetName } from "./parseSheetName";

describe("parseSheetName", () => {
  it("splits day name and focus on dash", () => {
    expect(parseSheetName("Day 1 - FULL BODY")).toEqual({
      name: "Day 1",
      focus: "FULL BODY",
    });
  });

  it("returns focus null when no dash separator", () => {
    expect(parseSheetName("Monday")).toEqual({
      name: "Monday",
      focus: null,
    });
  });

  it("returns focus null when dash parts are empty", () => {
    expect(parseSheetName(" - ")).toEqual({
      name: "-",
      focus: null,
    });
  });
});
