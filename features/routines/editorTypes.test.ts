import { describe, expect, it } from "vitest";
import { createNewId, mapRoutineToEditor, NEW_ID_PREFIX } from "./editorTypes";
import type { RoutineWithDays } from "./types";
import { isUuid } from "@/lib/uuid";

const routine: RoutineWithDays = {
  id: "routine-1",
  user_id: "user-1",
  name: "Push Pull",
  source: "excel",
  is_active: true,
  created_at: "2026-01-01T00:00:00Z",
  updated_at: "2026-01-01T00:00:00Z",
  routine_days: [
    {
      id: "day-2",
      user_id: "user-1",
      routine_id: "routine-1",
      name: "Day 2",
      focus: "Pull",
      original_name: "Day 2 - Pull",
      sort_order: 1,
      created_at: "2026-01-01T00:00:00Z",
      updated_at: "2026-01-01T00:00:00Z",
      routine_exercises: [
        {
          id: "ex-b",
          user_id: "user-1",
          routine_day_id: "day-2",
          name: "Row",
          prescription: "3x10",
          planned_sets: 3,
          target_reps: "10",
          weight: "40kg",
          rest_time: "60s",
          notes: null,
          muscle_group: "Back",
          sort_order: 1,
          created_at: "2026-01-01T00:00:00Z",
          updated_at: "2026-01-01T00:00:00Z",
        },
        {
          id: "ex-a",
          user_id: "user-1",
          routine_day_id: "day-2",
          name: "Pulldown",
          prescription: "3x12",
          planned_sets: 3,
          target_reps: "12",
          weight: "30kg",
          rest_time: null,
          notes: null,
          muscle_group: null,
          sort_order: 0,
          created_at: "2026-01-01T00:00:00Z",
          updated_at: "2026-01-01T00:00:00Z",
        },
      ],
    },
    {
      id: "day-1",
      user_id: "user-1",
      routine_id: "routine-1",
      name: "Day 1",
      focus: "Push",
      original_name: null,
      sort_order: 0,
      created_at: "2026-01-01T00:00:00Z",
      updated_at: "2026-01-01T00:00:00Z",
      routine_exercises: [],
    },
  ],
};

describe("mapRoutineToEditor", () => {
  it("sorts days and exercises by sort_order", () => {
    const editor = mapRoutineToEditor(routine);
    expect(editor.days.map((d) => d.id)).toEqual(["day-1", "day-2"]);
    expect(editor.days[1].exercises.map((e) => e.id)).toEqual(["ex-a", "ex-b"]);
  });

  it("maps DB fields onto the editor shape", () => {
    const editor = mapRoutineToEditor(routine);
    const pulldown = editor.days[1].exercises[0];
    expect(pulldown).toMatchObject({
      name: "Pulldown",
      muscleGroup: null,
      prescription: "3x12",
      plannedSets: 3,
      targetReps: "12",
      weight: "30kg",
      restTime: null,
    });
    expect(editor.days[1].exercises[1].muscleGroup).toBe("Back");
  });

  it("maps variable prescriptions from the database", () => {
    const variable: RoutineWithDays = {
      ...routine,
      routine_days: [
        {
          ...routine.routine_days[1],
          routine_exercises: [
            {
              ...routine.routine_days[1].routine_exercises[0],
              prescription: "1x12 15kg-3x12 20kg",
              planned_sets: 4,
              target_reps: "12",
              weight: null,
            },
          ],
        },
      ],
    };

    const exercise = mapRoutineToEditor(variable).days[0].exercises[0];
    expect(exercise).toMatchObject({
      prescription: "1x12 15kg-3x12 20kg",
      plannedSets: 4,
      targetReps: "12",
      weight: null,
    });
  });

  it("uses original_name as the editable day name, falling back to name", () => {
    const editor = mapRoutineToEditor(routine);
    expect(editor.days[0].name).toBe("Day 1"); // original_name null → name
    expect(editor.days[1].name).toBe("Day 2 - Pull"); // original_name wins
  });
});

describe("createNewId", () => {
  it("produces a non-UUID id with the new prefix", () => {
    const id = createNewId();
    expect(id.startsWith(NEW_ID_PREFIX)).toBe(true);
    expect(isUuid(id)).toBe(false);
  });

  it("produces unique ids", () => {
    expect(createNewId()).not.toBe(createNewId());
  });
});
