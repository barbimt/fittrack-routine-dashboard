import { describe, expect, it } from "vitest";
import {
  getCompletedSets,
  getExerciseProgress,
  getTotalSets,
  trainingDays,
  type TrainingDay,
} from "./mock-data";

describe("progress helpers", () => {
  const monday = trainingDays.find((day) => day.id === "monday");
  if (!monday) throw new Error("Expected monday fixture in trainingDays");

  it("counts completed sets across exercises", () => {
    expect(getCompletedSets(monday)).toBe(4);
  });

  it("counts total sets across exercises", () => {
    expect(getTotalSets(monday)).toBe(13);
  });

  it("counts exercise-level progress by completed sets only", () => {
    const hipThrust = monday.exercises.find((ex) => ex.name === "Hip Thrust");
    if (!hipThrust) throw new Error("Expected Hip Thrust in monday fixture");

    expect(getExerciseProgress(hipThrust)).toEqual({ completed: 2, total: 4 });
  });

  it("returns zero completed when no sets are checked", () => {
    const emptyDay: TrainingDay = {
      id: "test",
      dayName: "Test",
      focus: "Test",
      exercises: [
        {
          id: "ex",
          name: "Squat",
          muscleGroup: "Legs",
          targetSets: 3,
          targetReps: 10,
          weight: "—",
          restTime: "—",
          sets: [
            {
              id: "s1",
              setNumber: 1,
              targetReps: 10,
              actualReps: null,
              completed: false,
            },
          ],
        },
      ],
    };

    expect(getCompletedSets(emptyDay)).toBe(0);
    expect(getTotalSets(emptyDay)).toBe(1);
  });
});
