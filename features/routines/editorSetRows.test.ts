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
  type EditorSetRow,
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

function row(
  reps: string,
  weightKg: string,
  id = crypto.randomUUID()
): EditorSetRow {
  return { id, reps, weightKg };
}

function expectRows(
  actual: EditorSetRow[],
  expected: Array<{ reps: string; weightKg: string }>
) {
  expect(actual).toHaveLength(expected.length);
  actual.forEach((item, index) => {
    expect(item.id).toEqual(expect.any(String));
    expect(item.reps).toBe(expected[index]?.reps);
    expect(item.weightKg).toBe(expected[index]?.weightKg);
  });
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
    expectRows(exerciseToSetRows(exercise()), [
      { reps: "12", weightKg: "60" },
      { reps: "12", weightKg: "60" },
      { reps: "12", weightKg: "60" },
    ]);
  });

  it("keeps stable row ids across re-hydrates so weight inputs keep focus", () => {
    const ex = exercise();
    const first = exerciseToSetRows(ex);
    const second = exerciseToSetRows({ ...ex, weight: "55kg" });
    expect(first.map((row) => row.id)).toEqual([
      "ex-1-set-0",
      "ex-1-set-1",
      "ex-1-set-2",
    ]);
    expect(second.map((row) => row.id)).toEqual(first.map((row) => row.id));
  });

  it("expands variable weight prescriptions per set", () => {
    expectRows(
      exerciseToSetRows(
        exercise({
          prescription: "1x12 15kg-3x12 20kg",
          plannedSets: 4,
          targetReps: "12",
          weight: null,
        })
      ),
      [
        { reps: "12", weightKg: "15" },
        { reps: "12", weightKg: "20" },
        { reps: "12", weightKg: "20" },
        { reps: "12", weightKg: "20" },
      ]
    );
  });
});

describe("setRowsToExercisePatch", () => {
  it("writes uniform sets as NxR plus weight column", () => {
    expect(
      setRowsToExercisePatch([
        row("12", "60", "a"),
        row("12", "60", "b"),
        row("12", "60", "c"),
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
        row("12", "15", "a"),
        row("12", "20", "b"),
        row("12", "20", "c"),
        row("12", "20", "d"),
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
      row("10", "40", "a"),
      row("8", "50", "b"),
    ]);
    const rows = exerciseToSetRows(
      exercise({
        ...patch,
      })
    );
    expectRows(rows, [
      { reps: "10", weightKg: "40" },
      { reps: "8", weightKg: "50" },
    ]);
  });
});

describe("update / add / remove editor set rows", () => {
  it("updates a single row", () => {
    expect(
      updateEditorSetRow([row("12", "40", "a"), row("12", "40", "b")], 1, {
        weightKg: "45",
      })
    ).toEqual([row("12", "40", "a"), row("12", "45", "b")]);
  });

  it("appends a copy of the last row", () => {
    const result = addEditorSetRow([row("10", "50", "a")]);
    expect(result).toHaveLength(2);
    expect(result[0]).toEqual(row("10", "50", "a"));
    expect(result[1]?.id).toEqual(expect.any(String));
    expect(result[1]?.reps).toBe("10");
    expect(result[1]?.weightKg).toBe("50");
  });

  it("keeps one empty row when removing the last set", () => {
    const result = removeEditorSetRow([row("12", "40", "a")], 0);
    expect(result).toHaveLength(1);
    expect(result[0]?.id).toEqual(expect.any(String));
    expect(result[0]?.reps).toBe("");
    expect(result[0]?.weightKg).toBe("");
  });
});
