import { describe, expect, it } from "vitest";
import {
  expandPrescriptionToSets,
  formatPrescriptionBlockLines,
  getPrescriptionBlockSummaries,
  hasWeightInPrescriptionText,
  isVariablePrescriptionStructure,
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

  it("parses weight per block with @ or space", () => {
    expect(parsePrescription("1x12@15kg-3x12@20kg")).toEqual({
      plannedSets: 4,
      targetReps: "12",
      parsed: true,
    });
    expect(parsePrescription("1x12 15kg-3x12 20kg")).toEqual({
      plannedSets: 4,
      targetReps: "12",
      parsed: true,
    });
  });

  it("does not treat c/pierna as weight", () => {
    expect(expandPrescriptionToSets("3x10 c/pierna", "10kg")).toEqual([
      { setNumber: 1, targetReps: 10, targetWeight: "10kg" },
      { setNumber: 2, targetReps: 10, targetWeight: "10kg" },
      { setNumber: 3, targetReps: 10, targetWeight: "10kg" },
    ]);
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

describe("expandPrescriptionToSets", () => {
  it("expands variable reps and weight into individual sets", () => {
    expect(expandPrescriptionToSets("1x12 15kg-3x12 20kg")).toEqual([
      { setNumber: 1, targetReps: 12, targetWeight: "15kg" },
      { setNumber: 2, targetReps: 12, targetWeight: "20kg" },
      { setNumber: 3, targetReps: 12, targetWeight: "20kg" },
      { setNumber: 4, targetReps: 12, targetWeight: "20kg" },
    ]);
    expect(expandPrescriptionToSets("1x12@15kg-3x12@20kg")).toEqual([
      { setNumber: 1, targetReps: 12, targetWeight: "15kg" },
      { setNumber: 2, targetReps: 12, targetWeight: "20kg" },
      { setNumber: 3, targetReps: 12, targetWeight: "20kg" },
      { setNumber: 4, targetReps: 12, targetWeight: "20kg" },
    ]);
  });

  it("splits space-separated blocks", () => {
    expect(expandPrescriptionToSets("1x12 15kg 3x12 20kg")).toHaveLength(4);
  });

  it("applies fallback weight when block has no load", () => {
    expect(expandPrescriptionToSets("3x10-2x8", "80kg")).toEqual([
      { setNumber: 1, targetReps: 10, targetWeight: "80kg" },
      { setNumber: 2, targetReps: 10, targetWeight: "80kg" },
      { setNumber: 3, targetReps: 10, targetWeight: "80kg" },
      { setNumber: 4, targetReps: 8, targetWeight: "80kg" },
      { setNumber: 5, targetReps: 8, targetWeight: "80kg" },
    ]);
  });

  it("produces no target weight when neither prescription nor fallback has load", () => {
    expect(expandPrescriptionToSets("3x12", null)).toEqual([
      { setNumber: 1, targetReps: 12, targetWeight: null },
      { setNumber: 2, targetReps: 12, targetWeight: null },
      { setNumber: 3, targetReps: 12, targetWeight: null },
    ]);
  });

  it("treats 3x12 + fallback weight the same as 3x12 with embedded load", () => {
    const fromColumn = expandPrescriptionToSets("3x12", "10kg");
    const fromPrescription = expandPrescriptionToSets("3x12 10kg", null);
    expect(fromColumn).toEqual(fromPrescription);
  });

  it("parses embedded load in a single block", () => {
    expect(expandPrescriptionToSets("3x12 20kg", null)).toEqual([
      { setNumber: 1, targetReps: 12, targetWeight: "20kg" },
      { setNumber: 2, targetReps: 12, targetWeight: "20kg" },
      { setNumber: 3, targetReps: 12, targetWeight: "20kg" },
    ]);
  });

  it("parses case-insensitive sets x reps", () => {
    expect(expandPrescriptionToSets("3X12", "10kg")).toHaveLength(3);
  });
});

describe("formatPrescriptionBlockLines", () => {
  it("formats block summaries for the exercise header", () => {
    expect(formatPrescriptionBlockLines("1x12 15kg-3x12 20kg")).toEqual([
      "1 × 12 · 15kg",
      "3 × 12 · 20kg",
    ]);
  });
});

describe("hasWeightInPrescriptionText", () => {
  it("detects kg in prescription blocks", () => {
    expect(hasWeightInPrescriptionText("1x12 15kg-3x12 20kg")).toBe(true);
    expect(hasWeightInPrescriptionText("3x12 20kg")).toBe(true);
    expect(hasWeightInPrescriptionText("3x12")).toBe(false);
  });
});

describe("isVariablePrescriptionStructure", () => {
  it("detects multiple blocks", () => {
    expect(isVariablePrescriptionStructure("1x12-3x10")).toBe(true);
    expect(isVariablePrescriptionStructure("1x12 15kg-3x12 20kg")).toBe(true);
    expect(isVariablePrescriptionStructure("3x12")).toBe(false);
  });
});

describe("getPrescriptionBlockSummaries", () => {
  it("applies fallback weight to blocks without embedded load", () => {
    expect(getPrescriptionBlockSummaries("3x12", "10kg")).toEqual([
      { sets: 3, reps: 12, weight: "10kg" },
    ]);
  });

  it("returns per-block weights for variable prescriptions", () => {
    expect(getPrescriptionBlockSummaries("1x12 15kg-3x12 20kg")).toEqual([
      { sets: 1, reps: 12, weight: "15kg" },
      { sets: 3, reps: 12, weight: "20kg" },
    ]);
  });
});
