import { describe, expect, it } from "vitest";
import { parseExerciseRow } from "./parseExerciseRow";
import { mapHeaderRow } from "./normaliseExcelHeaders";

const context = { sheetName: "Day 1 - Legs", rowNumber: 2, sortOrder: 1 };

describe("parseExerciseRow", () => {
  it("reads every column into a normalized exercise", () => {
    const { exercise, warnings } = parseExerciseRow(
      {
        EXERCISE: "Hip Thrust",
        SETS_X_REPS: "4x10",
        WEIGHT: "60",
        MUSCLE: "Glúteos",
        SECONDARY: "Hamstrings",
        REST: "90",
        NOTES: "Pause at top",
      },
      context
    );

    expect(warnings).toEqual([]);
    expect(exercise).toMatchObject({
      name: "Hip Thrust",
      muscleGroup: "glutes",
      secondaryMuscles: ["hamstrings"],
      restTime: "90s",
      notes: "Pause at top",
      warnings: [],
    });
    expect(exercise.sets).toHaveLength(4);
    expect(exercise.sets[0]).toEqual({
      setType: "working",
      repsMin: 10,
      repsMax: 10,
      weightKg: 60,
    });
  });

  it("keeps an unreadable exercise with one empty set and a clear warning", () => {
    const { exercise, warnings } = parseExerciseRow(
      { EXERCISE: "Plank", SETS_X_REPS: "as long as possible" },
      context
    );
    expect(exercise.sets).toEqual([
      { setType: "working", repsMin: null, repsMax: null, weightKg: null },
    ]);
    expect(exercise.notes).toBe("as long as possible");
    expect(warnings[0]).toMatchObject({
      type: "unparsed_prescription",
      column: "SETS x REPS",
      rowNumber: 2,
      exerciseName: "Plank",
    });
  });

  it("warns about text in WEIGHT, unknown muscles and bad rest", () => {
    const { exercise, warnings } = parseExerciseRow(
      {
        EXERCISE: "Row",
        SETS_X_REPS: "3x12",
        WEIGHT: "TBD",
        MUSCLE: "lats??",
        REST: "soon",
      },
      context
    );
    expect(warnings.map((warning) => warning.column)).toEqual([
      "WEIGHT (kg)",
      "MUSCLE",
      "REST (sec)",
    ]);
    expect(exercise.muscleGroup).toBeNull();
    expect(exercise.restTime).toBeNull();
    expect(exercise.warnings).toHaveLength(3);
  });

  it("uses extra primary muscles as secondary ones", () => {
    const { exercise } = parseExerciseRow(
      { EXERCISE: "Squat", SETS_X_REPS: "3x5", MUSCLE: "quads, glutes" },
      context
    );
    expect(exercise.muscleGroup).toBe("quads");
    expect(exercise.secondaryMuscles).toEqual(["glutes"]);
  });

  it("does not warn for bodyweight", () => {
    const { warnings, exercise } = parseExerciseRow(
      { EXERCISE: "Push-up", SETS_X_REPS: "3x12", WEIGHT: "Bodyweight" },
      context
    );
    expect(warnings).toEqual([]);
    expect(exercise.sets[0].weightKg).toBeNull();
  });
});

describe("mapHeaderRow new columns", () => {
  it("maps template, Spanish and decorated headers", () => {
    const { map } = mapHeaderRow([
      "EJERCICIO",
      "SERIES x REPS",
      "WEIGHT (kg)",
      "MÚSCULO",
      "ALSO WORKS",
      "REST (sec)",
      "NOTAS",
    ]);
    expect(map).toEqual({
      EXERCISE: 0,
      SETS_X_REPS: 1,
      WEIGHT: 2,
      MUSCLE: 3,
      SECONDARY: 4,
      REST: 5,
      NOTES: 6,
    });
  });
});
