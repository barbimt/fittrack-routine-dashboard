import { describe, expect, it } from "vitest";
import { buildPrescription } from "../prescription";

describe("buildPrescription", () => {
  it("combines sets and reps", () => {
    expect(buildPrescription(4, "8-10")).toBe("4x8-10");
  });

  it("uses reps only when there are no sets", () => {
    expect(buildPrescription(null, "12")).toBe("12");
    expect(buildPrescription(0, "12")).toBe("12");
  });

  it("describes sets only when there are no reps", () => {
    expect(buildPrescription(3, null)).toBe("3 sets");
  });

  it("falls back to a dash when nothing is provided", () => {
    expect(buildPrescription(null, null)).toBe("—");
    expect(buildPrescription(null, "  ")).toBe("—");
  });
});
