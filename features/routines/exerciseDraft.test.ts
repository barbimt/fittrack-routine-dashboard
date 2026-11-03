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
    sets: [
      {
        id: "s1",
        setNumber: 1,
        targetReps: 12,
        actualReps: null,
        completed: false,
      },
      {
        id: "s2",
        setNumber: 2,
        targetReps: 12,
        actualReps: null,
        completed: false,
      },
    ],
    ...overrides,
  };
}

describe("exerciseToEditorDraft", () => {
  it("maps workout exercise fields into editor draft shape", () => {
    expect(exerciseToEditorDraft(exercise())).toMatchObject({
      id: "ex-1",
      name: "Squat",
      muscleGroup: "quads",
      secondaryMuscles: [],
      sets: [
        { setType: "working", reps: "12", weightKg: "60" },
        { setType: "working", reps: "12", weightKg: "60" },
      ],
      restTime: "90s",
      notes: "Brace",
    });
  });

  it("prefers per-set targets and keeps ranges and set types", () => {
    const draft = exerciseToEditorDraft(
      exercise({
        weight: "—",
        restTime: "—",
        muscleSlug: "glutes",
        secondaryMuscles: ["hamstrings"],
        sets: [
          {
            id: "s1",
            setNumber: 1,
            setType: "warmup",
            targetReps: 15,
            targetWeightKg: 20,
            actualReps: null,
            completed: false,
          },
          {
            id: "s2",
            setNumber: 2,
            targetReps: 8,
            targetRepsMax: 10,
            targetWeightKg: null,
            actualReps: null,
            completed: false,
          },
        ],
      })
    );
    expect(draft).toMatchObject({
      muscleGroup: "glutes",
      secondaryMuscles: ["hamstrings"],
      restTime: null,
      sets: [
        { setType: "warmup", reps: "15", weightKg: "20" },
        { setType: "working", reps: "8-10", weightKg: "" },
      ],
    });
  });
});
