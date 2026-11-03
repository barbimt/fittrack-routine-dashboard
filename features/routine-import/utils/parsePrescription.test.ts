import { describe, expect, it } from "vitest";
import { parsePrescriptionToSets } from "./parsePrescription";

const working = (reps: number, kg: number | null) => ({
  setType: "working",
  repsMin: reps,
  repsMax: reps,
  weightKg: kg,
});

describe("parsePrescriptionToSets", () => {
  it("expands simple sets x reps into one row per set", () => {
    const result = parsePrescriptionToSets("3x12");
    expect(result.ok).toBe(true);
    expect(result.sets).toEqual([
      working(12, null),
      working(12, null),
      working(12, null),
    ]);
  });

  it.each(["4×10", "4X10", "4 x 10"])("reads %s", (input) => {
    expect(parsePrescriptionToSets(input).sets).toHaveLength(4);
  });

  it("applies the WEIGHT column to every set", () => {
    expect(parsePrescriptionToSets("2x10", "60kg").sets).toEqual([
      working(10, 60),
      working(10, 60),
    ]);
    expect(parsePrescriptionToSets("1x10", 7.5).sets).toEqual([working(10, 7.5)]);
  });

  it("reads rep ranges", () => {
    const range = { setType: "working", repsMin: 8, repsMax: 10, weightKg: null };
    expect(parsePrescriptionToSets("2x8-10").sets).toEqual([range, range]);
  });

  it("reads a different weight per block", () => {
    const result = parsePrescriptionToSets("1x12 15kg-3x12 20kg");
    expect(result.sets.map((set) => set.weightKg)).toEqual([15, 20, 20, 20]);
  });

  it.each([
    ["3x12 @ 60", 60],
    ["3x12 con 60", 60],
    ["3x12 7,5kg", 7.5],
    ["3x12 @ 20 lb", 9.07],
  ])("reads the load in %s", (input, kg) => {
    expect(parsePrescriptionToSets(input).sets[0].weightKg).toBe(kg);
  });

  it("uses the WEIGHT column only for blocks without their own load", () => {
    const result = parsePrescriptionToSets("1x12 15kg-2x10", "20");
    expect(result.sets.map((set) => set.weightKg)).toEqual([15, 20, 20]);
  });

  it("marks warm-up and drop sets", () => {
    const result = parsePrescriptionToSets("W1x15 20kg-2x8 60kg-D1x12 40kg");
    expect(result.sets.map((set) => set.setType)).toEqual([
      "warmup",
      "working",
      "working",
      "drop",
    ]);
  });

  it("keeps extra words as notes instead of losing them", () => {
    const result = parsePrescriptionToSets("3x10 per leg", "8kg each");
    expect(result.sets[0].weightKg).toBe(8);
    expect(result.notes).toEqual(["per leg", "each"]);
  });

  it("does not read words like c/pierna as a weight", () => {
    const result = parsePrescriptionToSets("3x10 c/pierna");
    expect(result.sets[0].weightKg).toBeNull();
    expect(result.notes).toEqual(["c/pierna"]);
  });

  it("reads a bare number as the set count", () => {
    const result = parsePrescriptionToSets("3");
    expect(result.ok).toBe(true);
    expect(result.sets).toEqual([
      { setType: "working", repsMin: null, repsMax: null, weightKg: null },
      { setType: "working", repsMin: null, repsMax: null, weightKg: null },
      { setType: "working", repsMin: null, repsMax: null, weightKg: null },
    ]);
  });

  it("treats timed sets as sets without reps", () => {
    const result = parsePrescriptionToSets("2x20-30 sec per side");
    expect(result.sets).toHaveLength(2);
    expect(result.sets[0].repsMin).toBeNull();
    expect(result.notes).toEqual(["20-30 sec per side"]);
  });

  it("returns not ok for empty or unreadable input", () => {
    expect(parsePrescriptionToSets("").ok).toBe(false);
    expect(parsePrescriptionToSets("—").ok).toBe(false);
    const result = parsePrescriptionToSets("as many as you can");
    expect(result.ok).toBe(false);
    expect(result.unreadable).toEqual(["as many as you can"]);
  });

  it("rejects impossible numbers", () => {
    expect(parsePrescriptionToSets("0x10").ok).toBe(false);
    expect(parsePrescriptionToSets("3x10-8").ok).toBe(false);
    expect(parsePrescriptionToSets("3x500").ok).toBe(false);
  });
});
