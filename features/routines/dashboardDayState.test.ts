import { describe, expect, it } from "vitest";
import type { TrainingDay } from "@/lib/mock-data";
import {
  canSaveWorkoutForDay,
  findSetInDays,
  resetDayInDays,
  resetExerciseInDays,
  updateSetInDays,
} from "./dashboardDayState";

const sampleDays: TrainingDay[] = [
  {
    id: "day-1",
    dayName: "Monday",
    focus: "Legs",
    exercises: [
      {
        id: "ex-a",
        name: "Squat",
        muscleGroup: "Legs",
        targetSets: 2,
        targetReps: 10,
        weight: "60kg",
        restTime: "90s",
        sets: [
          {
            id: "set-a1",
            setNumber: 1,
            targetReps: 10,
            actualReps: 10,
            completed: true,
          },
          {
            id: "set-a2",
            setNumber: 2,
            targetReps: 10,
            actualReps: null,
            completed: false,
          },
        ],
      },
      {
        id: "ex-b",
        name: "RDL",
        muscleGroup: "Legs",
        targetSets: 1,
        targetReps: 12,
        weight: "40kg",
        restTime: "60s",
        sets: [
          {
            id: "set-b1",
            setNumber: 1,
            targetReps: 12,
            actualReps: 12,
            completed: true,
          },
        ],
      },
    ],
  },
  {
    id: "day-2",
    dayName: "Tuesday",
    focus: "Upper",
    exercises: [],
  },
];

describe("resetExerciseInDays", () => {
  it("clears completed and actual reps for one exercise on the selected day", () => {
    const result = resetExerciseInDays(sampleDays, "day-1", "ex-a");
    const squat = result[0].exercises[0];
    const rdl = result[0].exercises[1];

    expect(squat.sets.every((s) => !s.completed && s.actualReps === null)).toBe(
      true
    );
    expect(rdl.sets[0].completed).toBe(true);
    expect(rdl.sets[0].actualReps).toBe(12);
    expect(result[1]).toEqual(sampleDays[1]);
  });
});

describe("resetDayInDays", () => {
  it("clears all exercises on the selected day only", () => {
    const result = resetDayInDays(sampleDays, "day-1");

    for (const exercise of result[0].exercises) {
      expect(
        exercise.sets.every((s) => !s.completed && s.actualReps === null)
      ).toBe(true);
    }
    expect(result[1]).toEqual(sampleDays[1]);
  });
});

describe("canSaveWorkoutForDay", () => {
  it("returns false when no sets are completed", () => {
    const emptyProgress = resetDayInDays(sampleDays, "day-1");
    expect(canSaveWorkoutForDay(emptyProgress[0])).toBe(false);
  });

  it("returns true when at least one set is completed", () => {
    expect(canSaveWorkoutForDay(sampleDays[0])).toBe(true);
  });
});

describe("findSetInDays", () => {
  it("returns the matching set across days", () => {
    expect(findSetInDays(sampleDays, "set-a1")?.completed).toBe(true);
    expect(findSetInDays(sampleDays, "missing")).toBeNull();
  });
});

describe("updateSetInDays", () => {
  it("patches a single set without affecting others", () => {
    const result = updateSetInDays(sampleDays, "set-a2", {
      completed: true,
      actualReps: 11,
    });

    expect(result[0].exercises[0].sets[1]).toMatchObject({
      completed: true,
      actualReps: 11,
    });
    expect(result[0].exercises[0].sets[0].completed).toBe(true);
    expect(result[0].exercises[1].sets[0].completed).toBe(true);
  });
});
