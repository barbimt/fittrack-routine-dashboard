import { describe, expect, it } from "vitest";
import type { ExerciseSet } from "@/lib/mock-data";
import {
  buildRepsChangePatch,
  buildSetTogglePatch,
  bumpRevisionMap,
} from "./setProgress";

function set(overrides: Partial<ExerciseSet> = {}): ExerciseSet {
  return {
    id: "s1",
    setNumber: 1,
    targetReps: 10,
    actualReps: null,
    completed: false,
    ...overrides,
  };
}

describe("buildSetTogglePatch", () => {
  it("auto-fills target reps when completing an empty set", () => {
    expect(buildSetTogglePatch(set())).toEqual({
      completed: true,
      actualReps: 10,
    });
  });

  it("clears reps when uncompleting", () => {
    expect(
      buildSetTogglePatch(set({ completed: true, actualReps: 8 }))
    ).toEqual({
      completed: false,
      actualReps: null,
    });
  });

  it("keeps existing reps when completing a logged set", () => {
    expect(
      buildSetTogglePatch(set({ completed: false, actualReps: 7 }))
    ).toEqual({ completed: true });
  });
});

describe("buildRepsChangePatch", () => {
  it("marks incomplete for null or zero", () => {
    expect(buildRepsChangePatch(null)).toEqual({
      actualReps: null,
      completed: false,
    });
    expect(buildRepsChangePatch(0)).toEqual({
      actualReps: 0,
      completed: false,
    });
  });

  it("marks complete for positive reps", () => {
    expect(buildRepsChangePatch(12)).toEqual({
      actualReps: 12,
      completed: true,
    });
  });
});

describe("bumpRevisionMap", () => {
  it("increments only the given ids", () => {
    expect(bumpRevisionMap({ a: 1 }, ["a", "b"])).toEqual({ a: 2, b: 1 });
  });
});
