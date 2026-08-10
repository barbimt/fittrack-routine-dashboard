import { describe, expect, it } from "vitest";
import { validateRoutineDays } from "./editorSchema";
import type { EditorDay, EditorExercise } from "./editorTypes";

function exercise(overrides: Partial<EditorExercise> = {}): EditorExercise {
  return {
    id: "ex-1",
    name: "Hip Thrust",
    muscleGroup: "Glutes",
    prescription: "4x10",
    plannedSets: 4,
    targetReps: "10",
    weight: "60kg",
    restTime: null,
    notes: null,
    sortOrder: 0,
    ...overrides,
  };
}

function day(overrides: Partial<EditorDay> = {}): EditorDay {
  return {
    id: "day-1",
    name: "Day 1",
    focus: "Glutes",
    originalName: "Day 1",
    sortOrder: 0,
    exercises: [exercise()],
    ...overrides,
  };
}

describe("validateRoutineDays", () => {
  it("returns no errors for a valid routine", () => {
    expect(validateRoutineDays([day()])).toEqual([]);
  });

  it("flags a routine with no training days", () => {
    const errors = validateRoutineDays([]);
    expect(errors).toHaveLength(1);
    expect(errors[0].messages).toContain("Add at least one training day");
  });

  it("flags a day with no exercises", () => {
    const errors = validateRoutineDays([day({ exercises: [] })]);
    expect(errors).toHaveLength(1);
    expect(errors[0].dayId).toBe("day-1");
    expect(errors[0].messages).toContain("Add at least one exercise");
  });

  it("flags a day with an empty name", () => {
    const errors = validateRoutineDays([day({ name: "  " })]);
    expect(errors[0].messages).toContain("Day name is required");
  });

  it("flags an exercise with an empty name, prefixed by position", () => {
    const errors = validateRoutineDays([
      day({ exercises: [exercise({ name: "" })] }),
    ]);
    expect(errors[0].messages).toContain(
      "Exercise 1: Exercise name is required"
    );
  });

  it("flags an exercise with non-positive or missing sets", () => {
    const errors = validateRoutineDays([
      day({
        exercises: [
          exercise({ plannedSets: null }),
          exercise({ id: "ex-2", plannedSets: 0 }),
        ],
      }),
    ]);
    expect(errors[0].messages).toContain("Exercise 1: Sets must be at least 1");
    expect(errors[0].messages).toContain("Exercise 2: Sets must be at least 1");
  });

  it("aggregates multiple issues per day and keeps the day name", () => {
    const errors = validateRoutineDays([
      day({ name: "Push", exercises: [] }),
      day({ id: "day-2", name: "Pull", exercises: [exercise({ id: "ex-9" })] }),
    ]);
    expect(errors).toHaveLength(1);
    expect(errors[0].dayName).toBe("Push");
  });
});
