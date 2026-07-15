import { describe, expect, it, vi, beforeEach } from "vitest";
import { act, renderHook } from "@testing-library/react";
import type { TrainingDay } from "@/lib/mock-data";
import { useWorkoutSession } from "./use-workout-session";

vi.mock("@/features/routines/actions/sessionActions", () => ({
  toggleSetLog: vi.fn().mockResolvedValue({ ok: true }),
  updateSetReps: vi.fn().mockResolvedValue({ ok: true }),
  getOrCreateDaySession: vi.fn(),
  addExerciseToDay: vi.fn(),
  resetExerciseSets: vi.fn(),
  resetDaySession: vi.fn(),
  completeDaySession: vi.fn(),
  reopenDaySession: vi.fn(),
}));

vi.mock("@/hooks/use-toast", () => ({
  toast: vi.fn(),
}));

import {
  addExerciseToDay,
  getOrCreateDaySession,
  toggleSetLog,
  updateSetReps,
} from "@/features/routines/actions/sessionActions";
import type { RoutineExercise } from "@/features/routines/types";

const SET_ID = "aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee";
const DAY_ID = "day-1";
const SESSION_ID = "session-1111-2222-3333-444444444444";
const ROUTINE_ID = "routine-5555-6666-7777-888888888888";

const initialDays: TrainingDay[] = [
  {
    id: DAY_ID,
    dayName: "Monday",
    focus: "Legs",
    exercises: [
      {
        id: "ex-1",
        name: "Squat",
        muscleGroup: "Legs",
        targetSets: 1,
        targetReps: 12,
        weight: "60kg",
        restTime: "90s",
        sets: [
          {
            id: SET_ID,
            setNumber: 1,
            targetReps: 12,
            actualReps: null,
            completed: false,
          },
        ],
      },
    ],
  },
];

describe("useWorkoutSession handleSetToggle", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("auto-fills target reps when completing a set with no actual reps", () => {
    const { result } = renderHook(() =>
      useWorkoutSession({
        initialDays,
        routineId: ROUTINE_ID,
        initialDayId: DAY_ID,
        initialSessionId: SESSION_ID,
      })
    );

    act(() => {
      result.current.handleSetToggle(SET_ID);
    });

    const set = result.current.daysData[0].exercises[0].sets[0];
    expect(set.completed).toBe(true);
    expect(set.actualReps).toBe(12);
    expect(updateSetReps).toHaveBeenCalledWith(SET_ID, 12);
    expect(toggleSetLog).toHaveBeenCalledWith(SET_ID, true);
  });

  it("keeps existing actual reps when completing a set", () => {
    const daysWithReps: TrainingDay[] = [
      {
        ...initialDays[0],
        exercises: [
          {
            ...initialDays[0].exercises[0],
            sets: [
              {
                ...initialDays[0].exercises[0].sets[0],
                actualReps: 10,
                completed: false,
              },
            ],
          },
        ],
      },
    ];

    const { result } = renderHook(() =>
      useWorkoutSession({
        initialDays: daysWithReps,
        routineId: ROUTINE_ID,
        initialDayId: DAY_ID,
        initialSessionId: SESSION_ID,
      })
    );

    act(() => {
      result.current.handleSetToggle(SET_ID);
    });

    const set = result.current.daysData[0].exercises[0].sets[0];
    expect(set.completed).toBe(true);
    expect(set.actualReps).toBe(10);
    expect(updateSetReps).not.toHaveBeenCalled();
  });

  it("clears actual reps when uncompleting a set", () => {
    const daysWithCompletedSet: TrainingDay[] = [
      {
        ...initialDays[0],
        exercises: [
          {
            ...initialDays[0].exercises[0],
            sets: [
              {
                ...initialDays[0].exercises[0].sets[0],
                actualReps: 12,
                completed: true,
              },
            ],
          },
        ],
      },
    ];

    const { result } = renderHook(() =>
      useWorkoutSession({
        initialDays: daysWithCompletedSet,
        routineId: ROUTINE_ID,
        initialDayId: DAY_ID,
        initialSessionId: SESSION_ID,
      })
    );

    act(() => {
      result.current.handleSetToggle(SET_ID);
    });

    const set = result.current.daysData[0].exercises[0].sets[0];
    expect(set.completed).toBe(false);
    expect(set.actualReps).toBeNull();
    expect(updateSetReps).toHaveBeenCalledWith(SET_ID, null);
    expect(toggleSetLog).toHaveBeenCalledWith(SET_ID, false);
  });
});

const DAY_2_ID = "day-2";

const mergedDayFromServer: TrainingDay = {
  id: DAY_2_ID,
  dayName: "Tuesday",
  focus: "Push",
  exercises: [
    {
      id: "ex-2",
      name: "Bench",
      muscleGroup: "Chest",
      targetSets: 1,
      targetReps: 10,
      weight: "40kg",
      restTime: "90s",
      sets: [
        {
          id: "bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb",
          setNumber: 1,
          targetReps: 10,
          targetWeight: "40kg",
          actualReps: null,
          completed: false,
        },
      ],
    },
  ],
};

const addedExercise: RoutineExercise = {
  id: "ex-added",
  user_id: "user-1",
  routine_day_id: DAY_ID,
  name: "Face pull",
  prescription: "3x12",
  planned_sets: 3,
  target_reps: "12",
  weight: "15kg",
  rest_time: null,
  notes: null,
  muscle_group: "Shoulders",
  sort_order: 2,
  created_at: "2026-01-01T00:00:00Z",
  updated_at: "2026-01-01T00:00:00Z",
};

describe("useWorkoutSession day session sync", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("replaces the selected day with mergedDay from getOrCreateDaySession", async () => {
    vi.mocked(getOrCreateDaySession).mockResolvedValue({
      ok: true,
      sessionId: "session-day-2",
      sessionStatus: "in_progress",
      setLogs: [],
      mergedDay: mergedDayFromServer,
    });

    const daysWithSecondDay: TrainingDay[] = [
      ...initialDays,
      { id: DAY_2_ID, dayName: "Tuesday", focus: "Push", exercises: [] },
    ];

    const { result } = renderHook(() =>
      useWorkoutSession({
        initialDays: daysWithSecondDay,
        routineId: ROUTINE_ID,
        initialDayId: DAY_ID,
        initialSessionId: SESSION_ID,
      })
    );

    await act(async () => {
      result.current.handleSelectDay(DAY_2_ID);
    });

    expect(getOrCreateDaySession).toHaveBeenCalledWith(ROUTINE_ID, DAY_2_ID);
    expect(result.current.selectedDayId).toBe(DAY_2_ID);
    expect(
      result.current.daysData.find((d) => d.id === DAY_2_ID)?.exercises
    ).toHaveLength(1);
    expect(
      result.current.daysData.find((d) => d.id === DAY_2_ID)?.exercises[0]
        .sets[0].targetWeight
    ).toBe("40kg");
  });
});

describe("useWorkoutSession handleAddExercise", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("appends the new exercise when addExerciseToDay succeeds", async () => {
    vi.mocked(addExerciseToDay).mockResolvedValue({
      ok: true,
      exercise: addedExercise,
      setLogs: [
        {
          id: "cccccccc-cccc-cccc-cccc-cccccccccccc",
          user_id: "user-1",
          workout_session_id: SESSION_ID,
          routine_exercise_id: "ex-added",
          set_number: 1,
          target_reps: "12",
          target_weight: "15kg",
          exercise_name: "Face pull",
          actual_reps: null,
          completed: false,
          created_at: "2026-01-01T00:00:00Z",
          updated_at: "2026-01-01T00:00:00Z",
        },
      ],
    });

    const { result } = renderHook(() =>
      useWorkoutSession({
        initialDays,
        routineId: ROUTINE_ID,
        initialDayId: DAY_ID,
        initialSessionId: SESSION_ID,
      })
    );

    await act(async () => {
      await result.current.handleAddExercise({
        name: "Face pull",
        plannedSets: 3,
        targetReps: "12",
        weight: "15kg",
        muscleGroup: "Shoulders",
      });
    });

    expect(addExerciseToDay).toHaveBeenCalledWith(DAY_ID, SESSION_ID, {
      name: "Face pull",
      plannedSets: 3,
      targetReps: "12",
      weight: "15kg",
      muscleGroup: "Shoulders",
    });
    expect(result.current.daysData[0].exercises).toHaveLength(2);
    expect(result.current.daysData[0].exercises[1].name).toBe("Face pull");
    expect(result.current.daysData[0].exercises[1].sets[0].id).toBe(
      "cccccccc-cccc-cccc-cccc-cccccccccccc"
    );
  });

  it("does not append when addExerciseToDay fails", async () => {
    vi.mocked(addExerciseToDay).mockResolvedValue({
      ok: false,
      error: "Session not found.",
    });

    const { result } = renderHook(() =>
      useWorkoutSession({
        initialDays,
        routineId: ROUTINE_ID,
        initialDayId: DAY_ID,
        initialSessionId: SESSION_ID,
      })
    );

    await act(async () => {
      await result.current.handleAddExercise({
        name: "Face pull",
        plannedSets: 3,
        targetReps: "12",
      });
    });

    expect(result.current.daysData[0].exercises).toHaveLength(1);
  });
});
