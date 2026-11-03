import { describe, expect, it } from "vitest";
import {
  buildSetLogRowsForExercise,
  buildSetLogRowsForExercises,
  planSetLogReconciliation,
  toExerciseForSetLogs,
  type ExerciseForSetLogs,
} from "./materializeSetLogs";
import type { PlannedSet } from "./sets";

const working = (reps: number, kg: number | null): PlannedSet => ({
  setType: "working",
  repsMin: reps,
  repsMax: reps,
  weightKg: kg,
});

function exercise(
  overrides: Partial<ExerciseForSetLogs> = {}
): ExerciseForSetLogs {
  return {
    id: "ex-1",
    name: "Squat",
    muscle_group: "quads",
    muscle_groups_secondary: ["glutes"],
    sets: [working(10, 60), working(10, 60)],
    ...overrides,
  };
}

describe("buildSetLogRowsForExercise", () => {
  it("snapshots name, numeric targets and muscles per set", () => {
    const rows = buildSetLogRowsForExercise(
      "user-1",
      "session-1",
      exercise({
        name: "Press hombro",
        sets: [
          { setType: "warmup", repsMin: 15, repsMax: 15, weightKg: 4 },
          { setType: "working", repsMin: 8, repsMax: 10, weightKg: 7.5 },
        ],
      })
    );

    expect(rows).toHaveLength(2);
    expect(rows[0]).toMatchObject({
      routine_exercise_id: "ex-1",
      set_number: 1,
      set_type: "warmup",
      target_reps: "15",
      target_weight: "4kg",
      target_weight_kg: 4,
      exercise_name: "Press hombro",
      muscle_group: "quads",
      muscle_groups_secondary: ["glutes"],
      actual_weight_kg: null,
      completed: false,
    });
    expect(rows[1]).toMatchObject({
      target_reps: "8-10",
      target_reps_min: 8,
      target_reps_max: 10,
      target_weight_kg: 7.5,
    });
  });

  it("builds rows for multiple exercises", () => {
    const rows = buildSetLogRowsForExercises("user-1", "session-1", [
      exercise(),
      exercise({
        id: "ex-2",
        name: "Lunge",
        sets: [working(12, 10), working(12, 10), working(12, 10)],
      }),
    ]);

    expect(rows).toHaveLength(5);
    expect(
      rows.filter((row) => row.routine_exercise_id === "ex-2")
    ).toHaveLength(3);
  });
});

describe("toExerciseForSetLogs", () => {
  it("prefers stored set rows", () => {
    const result = toExerciseForSetLogs({
      id: "ex-1",
      name: "Row",
      prescription: "3x12",
      planned_sets: 3,
      target_reps: "12",
      weight: null,
      muscle_group: "back",
      muscle_groups_secondary: [],
      routine_exercise_sets: [
        {
          id: "s2",
          user_id: "u",
          routine_exercise_id: "ex-1",
          set_number: 2,
          set_type: "working",
          reps_min: 10,
          reps_max: 10,
          target_weight_kg: 22.5,
          created_at: "",
          updated_at: "",
        },
        {
          id: "s1",
          user_id: "u",
          routine_exercise_id: "ex-1",
          set_number: 1,
          set_type: "warmup",
          reps_min: 12,
          reps_max: 12,
          target_weight_kg: 10,
          created_at: "",
          updated_at: "",
        },
      ],
    });

    expect(result.sets).toEqual([
      { setType: "warmup", repsMin: 12, repsMax: 12, weightKg: 10 },
      working(10, 22.5),
    ]);
  });

  it("falls back to the legacy text when there are no rows", () => {
    const result = toExerciseForSetLogs({
      id: "ex-1",
      name: "Row",
      prescription: "1x12 15kg-2x12 20kg",
      planned_sets: 3,
      target_reps: "12",
      weight: null,
      muscle_group: null,
      muscle_groups_secondary: [],
      routine_exercise_sets: [],
    });
    expect(result.sets.map((set) => set.weightKg)).toEqual([15, 20, 20]);
  });
});

describe("planSetLogReconciliation", () => {
  it("updates matching sets, inserts new ones, deletes extras", () => {
    const plan = planSetLogReconciliation(
      "user-1",
      "session-1",
      exercise({ sets: [working(12, 40), working(12, 35), working(12, 40)] }),
      [
        { id: "log-1", set_number: 1 },
        { id: "log-2", set_number: 2 },
        { id: "log-extra", set_number: 4 },
      ]
    );

    expect(
      plan.updates.map((update) => [update.id, update.target_weight_kg])
    ).toEqual([
      ["log-1", 40],
      ["log-2", 35],
    ]);
    expect(plan.inserts).toHaveLength(1);
    expect(plan.inserts[0]).toMatchObject({
      set_number: 3,
      target_weight_kg: 40,
    });
    expect(plan.deleteIds).toEqual(["log-extra"]);
  });
});
