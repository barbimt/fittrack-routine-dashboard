import { describe, expect, it } from "vitest";
import { buildSetLogRowsForExercise, buildSetLogRowsForExercises } from "./materializeSetLogs";

describe("buildSetLogRowsForExercise", () => {
  it("snapshots exercise name and per-set weight from prescription", () => {
    const rows = buildSetLogRowsForExercise("user-1", "session-1", {
      id: "ex-1",
      name: "Press hombro",
      prescription: "4x10",
      planned_sets: 4,
      target_reps: "10",
      weight: "7kg cada lado",
    });

    expect(rows).toHaveLength(4);
    expect(rows[0]).toMatchObject({
      routine_exercise_id: "ex-1",
      set_number: 1,
      target_reps: "10",
      target_weight: "7kg cada lado",
      exercise_name: "Press hombro",
      completed: false,
    });
  });

  it("falls back to planned_sets when prescription does not expand", () => {
    const rows = buildSetLogRowsForExercise("user-1", "session-1", {
      id: "ex-2",
      name: "Curl",
      prescription: "—",
      planned_sets: 2,
      target_reps: "12",
      weight: null,
    });

    expect(rows).toHaveLength(2);
    expect(rows[1].set_number).toBe(2);
    expect(rows[0].target_weight).toBeNull();
  });

  it("builds rows for multiple exercises", () => {
    const rows = buildSetLogRowsForExercises("user-1", "session-1", [
      {
        id: "ex-1",
        name: "Squat",
        prescription: "2x10",
        planned_sets: 2,
        target_reps: "10",
        weight: "60kg",
      },
      {
        id: "ex-2",
        name: "Lunge",
        prescription: "3x12",
        planned_sets: 3,
        target_reps: "12",
        weight: "10kg",
      },
    ]);

    expect(rows).toHaveLength(5);
    expect(rows.filter((row) => row.routine_exercise_id === "ex-1")).toHaveLength(
      2
    );
    expect(rows.filter((row) => row.routine_exercise_id === "ex-2")).toHaveLength(
      3
    );
    expect(rows.every((row) => row.exercise_name && row.completed === false)).toBe(
      true
    );
  });
});
