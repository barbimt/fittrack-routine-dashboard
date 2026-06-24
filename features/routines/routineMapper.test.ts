import { describe, expect, it } from "vitest";
import type { RoutineWithDays, WorkoutSetLog } from "./types";
import { mapRoutineToTrainingDays, mergeSetLogsIntoDay } from "./routineMapper";
import type { TrainingDay } from "@/lib/mock-data";

const baseDay: TrainingDay = {
  id: "day-1",
  dayName: "Monday",
  focus: "Glutes",
  exercises: [
    {
      id: "ex-1",
      name: "Hip Thrust",
      muscleGroup: "Glutes",
      targetSets: 3,
      targetReps: 10,
      weight: "60kg",
      restTime: "90s",
      sets: [
        {
          id: "ex-1-set-1",
          setNumber: 1,
          targetReps: 10,
          actualReps: null,
          completed: false,
        },
        {
          id: "ex-1-set-2",
          setNumber: 2,
          targetReps: 10,
          actualReps: null,
          completed: false,
        },
      ],
    },
  ],
};

describe("mergeSetLogsIntoDay", () => {
  it("overlays matching set logs by exercise id and set number", () => {
    const logs: WorkoutSetLog[] = [
      {
        id: "log-uuid-1",
        user_id: "user-1",
        workout_session_id: "session-1",
        routine_exercise_id: "ex-1",
        set_number: 1,
        target_reps: "10",
        actual_reps: 12,
        completed: true,
        created_at: "2026-01-01T00:00:00Z",
        updated_at: "2026-01-01T00:00:00Z",
      },
    ];

    const merged = mergeSetLogsIntoDay(baseDay, logs);
    const firstSet = merged.exercises[0].sets[0];
    const secondSet = merged.exercises[0].sets[1];

    expect(firstSet).toMatchObject({
      id: "log-uuid-1",
      completed: true,
      actualReps: 12,
    });
    expect(secondSet.completed).toBe(false);
  });
});

describe("mapRoutineToTrainingDays", () => {
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
        id: "day-1",
        user_id: "user-1",
        routine_id: "routine-1",
        name: "Day 1",
        focus: "Upper",
        original_name: "Day 1 - Upper",
        sort_order: 1,
        created_at: "2026-01-01T00:00:00Z",
        updated_at: "2026-01-01T00:00:00Z",
        routine_exercises: [
          {
            id: "ex-1",
            user_id: "user-1",
            routine_day_id: "day-1",
            name: "Bench Press",
            prescription: "3x10",
            planned_sets: null,
            target_reps: "10",
            weight: "40kg",
            rest_time: "60s",
            notes: null,
            muscle_group: null,
            sort_order: 1,
            created_at: "2026-01-01T00:00:00Z",
            updated_at: "2026-01-01T00:00:00Z",
          },
        ],
      },
    ],
  };

  it("maps routine days and defaults to 3 sets when planned_sets is null", () => {
    const days = mapRoutineToTrainingDays(routine);
    expect(days).toHaveLength(1);
    expect(days[0].dayName).toBe("Day 1 - Upper");
    expect(days[0].exercises[0].sets).toHaveLength(3);
    expect(days[0].exercises[0].sets[0].targetReps).toBe(10);
  });

  it("falls back to the day focus when muscle_group is null", () => {
    const days = mapRoutineToTrainingDays(routine);
    expect(days[0].exercises[0].muscleGroup).toBe("Upper");
  });

  it("prefers the exercise muscle_group when set", () => {
    const withMuscle: RoutineWithDays = {
      ...routine,
      routine_days: [
        {
          ...routine.routine_days[0],
          routine_exercises: [
            {
              ...routine.routine_days[0].routine_exercises[0],
              muscle_group: "Chest",
            },
          ],
        },
      ],
    };
    const days = mapRoutineToTrainingDays(withMuscle);
    expect(days[0].exercises[0].muscleGroup).toBe("Chest");
  });

  it("expands variable prescriptions into per-set targets", () => {
    const variable: RoutineWithDays = {
      ...routine,
      routine_days: [
        {
          ...routine.routine_days[0],
          routine_exercises: [
            {
              ...routine.routine_days[0].routine_exercises[0],
              prescription: "1x12@15kg-3x12@20kg",
              planned_sets: 4,
              target_reps: "12",
              weight: null,
            },
          ],
        },
      ],
    };

    const exercise = mapRoutineToTrainingDays(variable)[0].exercises[0];
    expect(exercise.sets).toHaveLength(4);
    expect(exercise.sets[0]).toMatchObject({
      setNumber: 1,
      targetReps: 12,
      targetWeight: "15kg",
    });
    expect(exercise.sets[3]).toMatchObject({
      setNumber: 4,
      targetReps: 12,
      targetWeight: "20kg",
    });
  });

  it("applies column weight to simple prescriptions", () => {
    const exercise = mapRoutineToTrainingDays(routine)[0].exercises[0];
    expect(exercise.sets).toHaveLength(3);
    expect(exercise.sets.every((set) => set.targetWeight === "40kg")).toBe(
      true
    );
    expect(exercise.prescription).toBe("3x10");
  });

  it("matches column weight when load is embedded in prescription", () => {
    const embedded: RoutineWithDays = {
      ...routine,
      routine_days: [
        {
          ...routine.routine_days[0],
          routine_exercises: [
            {
              ...routine.routine_days[0].routine_exercises[0],
              prescription: "3x10 40kg",
              weight: null,
            },
          ],
        },
      ],
    };

    const fromColumn = mapRoutineToTrainingDays(routine)[0].exercises[0].sets;
    const fromPrescription =
      mapRoutineToTrainingDays(embedded)[0].exercises[0].sets;

    expect(fromPrescription).toEqual(fromColumn);
  });

  it("leaves targetWeight null when no load is provided", () => {
    const noWeight: RoutineWithDays = {
      ...routine,
      routine_days: [
        {
          ...routine.routine_days[0],
          routine_exercises: [
            {
              ...routine.routine_days[0].routine_exercises[0],
              prescription: "3x10",
              weight: null,
            },
          ],
        },
      ],
    };

    const exercise = mapRoutineToTrainingDays(noWeight)[0].exercises[0];
    expect(exercise.sets.every((set) => set.targetWeight === null)).toBe(true);
    expect(exercise.weight).toBe("—");
  });
});
