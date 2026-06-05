import { describe, expect, it } from "vitest";
import {
  normalizePrescriptionInput,
  parsePrescription,
} from "./parsePrescription";

describe("normalizePrescriptionInput", () => {
  it("replaces Unicode multiplication signs with ASCII x", () => {
    expect(normalizePrescriptionInput("4×10")).toBe("4x10");
    expect(normalizePrescriptionInput("3\u271510")).toBe("3x10");
  });
});

describe("parsePrescription", () => {
  it("parses simple sets x reps", () => {
    expect(parsePrescription("3x12")).toEqual({
      plannedSets: 3,
      targetReps: "12",
      parsed: true,
    });
  });

  it("parses Unicode multiplication sign", () => {
    expect(parsePrescription("4×10")).toEqual({
      plannedSets: 4,
      targetReps: "10",
      parsed: true,
    });
  });

  it("parses multi-block prescriptions", () => {
    expect(parsePrescription("3x10-2x8")).toEqual({
      plannedSets: 5,
      targetReps: "8",
      parsed: true,
    });
  });

  it("uses single rep value when all blocks match", () => {
    expect(parsePrescription("2x10-1x10")).toEqual({
      plannedSets: 3,
      targetReps: "10",
      parsed: true,
    });
  });

  it("returns unparsed for empty or invalid input", () => {
    expect(parsePrescription("")).toEqual({
      plannedSets: null,
      targetReps: null,
      parsed: false,
    });
    expect(parsePrescription("   ")).toEqual({
      plannedSets: null,
      targetReps: null,
      parsed: false,
    });
    expect(parsePrescription("asdf")).toEqual({
      plannedSets: null,
      targetReps: null,
      parsed: false,
    });
  });
});
