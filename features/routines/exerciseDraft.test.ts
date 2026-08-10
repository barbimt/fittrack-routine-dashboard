import { describe, expect, it } from "vitest";
import type { Exercise } from "@/lib/mock-data";
import { exerciseToEditorDraft } from "./exerciseDraft";

function exercise(overrides: Partial<Exercise> = {}): Exercise {
  return {
    id: "ex-1",
    name: "Squat",
    muscleGroup: "Quads",
    prescription: "3x12",
    targetSets: 3,
    targetReps: 12,
    weight: "60kg",
    restTime: "90s",
    notes: "Brace",
    sets: [],
    ...overrides,
  };
}

describe("exerciseToEditorDraft", () => {
  it("maps workout exercise fields into editor draft shape", () => {
    expect(exerciseToEditorDraft(exercise())).toMatchObject({
      id: "ex-1",
      name: "Squat",
      muscleGroup: "Quads",
      prescription: "3x12",
      plannedSets: 3,
      targetReps: "12",
      weight: "60kg",
      restTime: "90s",
      notes: "Brace",
    });
  });

  it("normalizes placeholders and numeric targetReps", () => {
    expect(
      exerciseToEditorDraft(
        exercise({
          weight: "—",
          restTime: "—",
          targetReps: "8-10",
          targetSets: 0,
        })
      )
    ).toMatchObject({
      weight: null,
      restTime: null,
      targetReps: "8-10",
      plannedSets: null,
    });
  });
});
