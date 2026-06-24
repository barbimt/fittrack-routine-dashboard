import { describe, expect, it } from "vitest";
import { computeRoutinePatch, isEmptyPatch } from "./routinePatch";
import type { EditorDay, EditorExercise } from "./editorTypes";

function exercise(overrides: Partial<EditorExercise> = {}): EditorExercise {
  return {
    id: "11111111-1111-4111-8111-111111111111",
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
    id: "22222222-2222-4222-8222-222222222222",
    name: "Day 1",
    focus: "Glutes",
    originalName: "Day 1",
    sortOrder: 0,
    exercises: [exercise()],
    ...overrides,
  };
}

describe("computeRoutinePatch", () => {
  it("returns an empty patch when nothing changed", () => {
    const baseline = [day()];
    const current = structuredClone(baseline);
    const patch = computeRoutinePatch("routine-1", baseline, current);
    expect(isEmptyPatch(patch)).toBe(true);
  });

  it("upserts only the exercise whose field changed", () => {
    const baseline = [day()];
    const current = structuredClone(baseline);
    current[0].exercises[0].plannedSets = 5;

    const patch = computeRoutinePatch("routine-1", baseline, current);

    expect(patch.upsertExercises).toHaveLength(1);
    expect(patch.upsertExercises[0]).toMatchObject({
      id: baseline[0].exercises[0].id,
      dayId: baseline[0].id,
      plannedSets: 5,
      sortOrder: 0,
    });
    expect(patch.upsertDays).toHaveLength(0);
    expect(patch.deleteDayIds).toHaveLength(0);
    expect(patch.deleteExerciseIds).toHaveLength(0);
  });

  it("detects prescription text changes", () => {
    const baseline = [day()];
    const current = structuredClone(baseline);
    current[0].exercises[0].prescription = "1x12 15kg-3x12 20kg";
    current[0].exercises[0].plannedSets = 4;
    current[0].exercises[0].weight = null;

    const patch = computeRoutinePatch("routine-1", baseline, current);

    expect(patch.upsertExercises).toHaveLength(1);
    expect(patch.upsertExercises[0]).toMatchObject({
      prescription: "1x12 15kg-3x12 20kg",
      plannedSets: 4,
      weight: null,
    });
  });

  it("detects reordering via array position, not the stored sortOrder", () => {
    const second = exercise({
      id: "33333333-3333-4333-8333-333333333333",
      name: "RDL",
      sortOrder: 1,
    });
    const baseline = [day({ exercises: [exercise(), second] })];
    const current = structuredClone(baseline);
    current[0].exercises.reverse();

    const patch = computeRoutinePatch("routine-1", baseline, current);

    expect(patch.upsertExercises).toHaveLength(2);
    const byId = new Map(patch.upsertExercises.map((e) => [e.id, e.sortOrder]));
    expect(byId.get(second.id)).toBe(0);
    expect(byId.get(baseline[0].exercises[0].id)).toBe(1);
  });

  it("marks new (non-uuid) rows for insert", () => {
    const baseline = [day({ exercises: [] })];
    const current = structuredClone(baseline);
    current[0].exercises.push(exercise({ id: "new-abc", sortOrder: 0 }));

    const patch = computeRoutinePatch("routine-1", baseline, current);

    expect(patch.upsertExercises).toHaveLength(1);
    expect(patch.upsertExercises[0].id).toBe("new-abc");
  });

  it("collects removed exercise and day ids", () => {
    const removedDay = day({
      id: "44444444-4444-4444-8444-444444444444",
      exercises: [exercise({ id: "55555555-5555-4555-8555-555555555555" })],
    });
    const baseline = [day(), removedDay];
    const current = structuredClone([day()]);
    current[0].exercises = [];

    const patch = computeRoutinePatch("routine-1", baseline, current);

    expect(patch.deleteDayIds).toContain(removedDay.id);
    expect(patch.deleteExerciseIds).toContain(baseline[0].exercises[0].id);
    expect(patch.deleteExerciseIds).toContain(removedDay.exercises[0].id);
  });
});
