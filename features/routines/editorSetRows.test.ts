import { describe, expect, it } from "vitest";
import type { EditorExercise } from "./editorTypes";
import {
  addEditorSetRow,
  exerciseToSetRows,
  formatWeightKg,
  removeEditorSetRow,
  setRowsToExercisePatch,
  stripWeightUnit,
  updateEditorSetRow,
} from "./editorSetRows";

function exercise(overrides: Partial<EditorExercise> = {}): EditorExercise {
  return {
    id: "ex-1",
    name: "Squat",
    muscleGroup: null,
    prescription: "3x12",
    plannedSets: 3,
    targetReps: "12",
    weight: "60kg",
    restTime: null,
    notes: null,
    sortOrder: 0,
    ...overrides,
  };
}

describe("stripWeightUnit / formatWeightKg", () => {
  it("strips and re-applies kg", () => {
    expect(stripWeightUnit("60kg")).toBe("60");
    expect(stripWeightUnit("60 kg")).toBe("60");
    expect(formatWeightKg("60")).toBe("60kg");
    expect(formatWeightKg("")).toBeNull();
  });
});

describe("exerciseToSetRows", () => {
  it("expands a simple prescription into N rows", () => {
    expect(exerciseToSetRows(exercise())).toEqual([
      { reps: "12", weightKg: "60" },
      { reps: "12", weightKg: "60" },
      { reps: "12", weightKg: "60" },
    ]);
  });

  it("expands variable weight prescriptions per set", () => {
    expect(
      exerciseToSetRows(
        exercise({
          prescription: "1x12 15kg-3x12 20kg",
          plannedSets: 4,
          targetReps: "12",
          weight: null,
        })
      )
    ).toEqual([
      { reps: "12", weightKg: "15" },
      { reps: "12", weightKg: "20" },
      { reps: "12", weightKg: "20" },
      { reps: "12", weightKg: "20" },
    ]);
  });
});

describe("setRowsToExercisePatch", () => {
  it("writes uniform sets as NxR plus weight column", () => {
    expect(
      setRowsToExercisePatch([
        { reps: "12", weightKg: "60" },
        { reps: "12", weightKg: "60" },
        { reps: "12", weightKg: "60" },
      ])
    ).toEqual({
      prescription: "3x12",
      plannedSets: 3,
      targetReps: "12",
      weight: "60kg",
    });
  });

  it("encodes mixed weights in the prescription string", () => {
    expect(
      setRowsToExercisePatch([
        { reps: "12", weightKg: "15" },
        { reps: "12", weightKg: "20" },
        { reps: "12", weightKg: "20" },
        { reps: "12", weightKg: "20" },
      ])
    ).toEqual({
      prescription: "1x12 15kg-3x12 20kg",
      plannedSets: 4,
      targetReps: "12",
      weight: null,
    });
  });

  it("round-trips variable rows through hydrate", () => {
    const patch = setRowsToExercisePatch([
      { reps: "10", weightKg: "40" },
      { reps: "8", weightKg: "50" },
    ]);
    const rows = exerciseToSetRows(
      exercise({
        ...patch,
      })
    );
    expect(rows).toEqual([
      { reps: "10", weightKg: "40" },
      { reps: "8", weightKg: "50" },
    ]);
  });
});

describe("update / add / remove editor set rows", () => {
  it("updates a single row", () => {
    expect(
      updateEditorSetRow(
        [
          { reps: "12", weightKg: "40" },
          { reps: "12", weightKg: "40" },
        ],
        1,
        { weightKg: "45" }
      )
    ).toEqual([
      { reps: "12", weightKg: "40" },
      { reps: "12", weightKg: "45" },
    ]);
  });

  it("appends a copy of the last row", () => {
    expect(
      addEditorSetRow([{ reps: "10", weightKg: "50" }])
    ).toEqual([
      { reps: "10", weightKg: "50" },
      { reps: "10", weightKg: "50" },
    ]);
  });

  it("keeps one empty row when removing the last set", () => {
    expect(removeEditorSetRow([{ reps: "12", weightKg: "40" }], 0)).toEqual([
      { reps: "", weightKg: "" },
    ]);
  });
});
