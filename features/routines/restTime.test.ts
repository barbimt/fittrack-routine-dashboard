import { describe, expect, it } from "vitest";
import {
  formatRestLabel,
  formatRestTime,
  parseRestTime,
  secondsToParts,
} from "./restTime";

describe("parseRestTime", () => {
  it("parses into minutes and seconds", () => {
    expect(parseRestTime("90s")).toEqual({ minutes: 1, seconds: 30 });
    expect(parseRestTime("120s")).toEqual({ minutes: 2, seconds: 0 });
    expect(parseRestTime("2m")).toEqual({ minutes: 2, seconds: 0 });
    expect(parseRestTime("45")).toEqual({ minutes: 0, seconds: 45 });
  });

  it("returns empty for null/blank/dash", () => {
    expect(parseRestTime(null)).toEqual({ minutes: 0, seconds: 0 });
    expect(parseRestTime("—")).toEqual({ minutes: 0, seconds: 0 });
  });
});

describe("formatRestTime", () => {
  it("normalises minutes + seconds to Ns", () => {
    expect(formatRestTime(1, 30)).toBe("90s");
    expect(formatRestTime(2, 0)).toBe("120s");
    expect(formatRestTime(0, 45)).toBe("45s");
    expect(formatRestTime(0, 0)).toBeNull();
  });
});

describe("formatRestLabel", () => {
  it("shows compact minutes and seconds", () => {
    expect(formatRestLabel("90s")).toBe("1m 30s");
    expect(formatRestLabel("120s")).toBe("2m");
    expect(formatRestLabel("45s")).toBe("45s");
    expect(formatRestLabel(null)).toBe("");
  });
});

describe("secondsToParts", () => {
  it("splits total seconds", () => {
    expect(secondsToParts(90)).toEqual({ minutes: 1, seconds: 30 });
    expect(secondsToParts(0)).toEqual({ minutes: 0, seconds: 0 });
  });
});
