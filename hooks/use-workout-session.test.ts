import { describe, expect, it, vi, beforeEach } from "vitest";
import { act, renderHook } from "@testing-library/react";
import type { TrainingDay } from "@/lib/mock-data";
import { useWorkoutSession } from "./use-workout-session";

vi.mock("@/features/routines/actions/sessionActions", () => ({
  updateSetLogProgress: vi.fn().mockResolvedValue({ ok: true }),
  toggleSetLog: vi.fn().mockResolvedValue({ ok: true }),
  updateSetReps: vi.fn().mockResolvedValue({ ok: true }),
  updateExerciseInDay: vi.fn(),
  getOrCreateDaySession: vi.fn().mockResolvedValue({
    ok: true,
    sessionId: "session-1111-2222-3333-444444444444",
    sessionStatus: "in_progress",
    setLogs: [],
    mergedDay: {
      id: "day-1",
      dayName: "Monday",
      focus: "Legs",
      exercises: [],
    },
  }),
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
  updateExerciseInDay,
  updateSetLogProgress,
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

function mockActiveDaySession(mergedDay: TrainingDay = initialDays[0]) {
  vi.mocked(getOrCreateDaySession).mockResolvedValue({
    ok: true,
    sessionId: SESSION_ID,
    sessionStatus: "in_progress",
    setLogs: [],
    mergedDay,
  });
}

describe("useWorkoutSession handleSetToggle", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockActiveDaySession();
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
    expect(updateSetLogProgress).toHaveBeenCalledTimes(1);
    expect(updateSetLogProgress).toHaveBeenCalledWith(SET_ID, {
      completed: true,
      actualReps: 12,
    });
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
    expect(updateSetLogProgress).toHaveBeenCalledTimes(1);
    expect(updateSetLogProgress).toHaveBeenCalledWith(SET_ID, {
      completed: true,
    });
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
    expect(updateSetLogProgress).toHaveBeenCalledTimes(1);
    expect(updateSetLogProgress).toHaveBeenCalledWith(SET_ID, {
      completed: false,
      actualReps: null,
    });
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
    mockActiveDaySession();
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
    mockActiveDaySession();
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

describe("useWorkoutSession handleRepsSave", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockActiveDaySession();
  });

  it("persists reps and completion in one updateSetLogProgress call", () => {
    const { result } = renderHook(() =>
      useWorkoutSession({
        initialDays,
        routineId: ROUTINE_ID,
        initialDayId: DAY_ID,
        initialSessionId: SESSION_ID,
      })
    );

    act(() => {
      result.current.handleRepsChange(SET_ID, 12);
      result.current.handleRepsSave(SET_ID, 12);
    });

    expect(result.current.daysData[0].exercises[0].sets[0]).toMatchObject({
      actualReps: 12,
      completed: true,
    });
    expect(updateSetLogProgress).toHaveBeenCalledTimes(1);
    expect(updateSetLogProgress).toHaveBeenCalledWith(SET_ID, {
      actualReps: 12,
      completed: true,
    });
  });

  it("clears completion when reps are cleared", () => {
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
      result.current.handleRepsChange(SET_ID, null);
      result.current.handleRepsSave(SET_ID, null);
    });

    expect(result.current.daysData[0].exercises[0].sets[0]).toMatchObject({
      actualReps: null,
      completed: false,
    });
    expect(updateSetLogProgress).toHaveBeenCalledWith(SET_ID, {
      actualReps: null,
      completed: false,
    });
  });
});

describe("useWorkoutSession handleEditExercise", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockActiveDaySession();
  });

  it("replaces the exercise with updated targets when update succeeds", async () => {
    const updatedExercise: RoutineExercise = {
      id: "ex-1",
      user_id: "user-1",
      routine_day_id: DAY_ID,
      name: "Squat heavy",
      prescription: "1x12 40kg-1x12 35kg",
      planned_sets: 2,
      target_reps: "12",
      weight: null,
      rest_time: "90s",
      notes: "slow ecc",
      muscle_group: "Legs",
      sort_order: 0,
      created_at: "2026-01-01T00:00:00Z",
      updated_at: "2026-01-01T00:00:00Z",
    };

    vi.mocked(updateExerciseInDay).mockResolvedValue({
      ok: true,
      exercise: updatedExercise,
      setLogs: [
        {
          id: SET_ID,
          user_id: "user-1",
          workout_session_id: SESSION_ID,
          routine_exercise_id: "ex-1",
          set_number: 1,
          target_reps: "12",
          target_weight: "40kg",
          exercise_name: "Squat heavy",
          actual_reps: null,
          completed: false,
          created_at: "2026-01-01T00:00:00Z",
          updated_at: "2026-01-01T00:00:00Z",
        },
        {
          id: "bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb",
          user_id: "user-1",
          workout_session_id: SESSION_ID,
          routine_exercise_id: "ex-1",
          set_number: 2,
          target_reps: "12",
          target_weight: "35kg",
          exercise_name: "Squat heavy",
          actual_reps: null,
          completed: false,
          created_at: "2026-01-01T00:00:00Z",
          updated_at: "2026-01-01T00:00:00Z",
        },
      ],
    });

    const input = {
      name: "Squat heavy",
      muscleGroup: "Legs",
      prescription: "1x12 40kg-1x12 35kg",
      plannedSets: 2,
      targetReps: "12",
      weight: null,
      restTime: "90s",
      notes: "slow ecc",
    };

    const { result } = renderHook(() =>
      useWorkoutSession({
        initialDays,
        routineId: ROUTINE_ID,
        initialDayId: DAY_ID,
        initialSessionId: SESSION_ID,
      })
    );

    await act(async () => {
      await result.current.handleEditExercise("ex-1", input);
    });

    expect(updateExerciseInDay).toHaveBeenCalledWith(
      DAY_ID,
      SESSION_ID,
      "ex-1",
      input
    );
    expect(result.current.daysData[0].exercises[0].name).toBe("Squat heavy");
    expect(result.current.daysData[0].exercises[0].sets).toHaveLength(2);
    expect(result.current.daysData[0].exercises[0].sets[0].targetWeight).toBe(
      "40kg"
    );
    expect(result.current.daysData[0].exercises[0].sets[1].targetWeight).toBe(
      "35kg"
    );
    expect(result.current.setRowRevision["ex-1"]).toBe(1);
  });

  it("leaves day unchanged when update fails", async () => {
    vi.mocked(updateExerciseInDay).mockResolvedValue({
      ok: false,
      error: "Failed to update exercise.",
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
      await result.current.handleEditExercise("ex-1", {
        name: "Nope",
        muscleGroup: "Legs",
        prescription: "3x10",
        plannedSets: 3,
        targetReps: "10",
        weight: "60kg",
        restTime: null,
        notes: null,
      });
    });

    expect(result.current.daysData[0].exercises[0].name).toBe("Squat");
    expect(result.current.daysData[0].exercises[0].sets).toHaveLength(1);
  });
});

describe("useWorkoutSession mount hydrate", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("reloads session progress from the server on mount", async () => {
    const hydratedDay: TrainingDay = {
      ...initialDays[0],
      exercises: [
        {
          ...initialDays[0].exercises[0],
          sets: [
            {
              ...initialDays[0].exercises[0].sets[0],
              completed: true,
              actualReps: 12,
            },
          ],
        },
      ],
    };

    vi.mocked(getOrCreateDaySession).mockResolvedValue({
      ok: true,
      sessionId: SESSION_ID,
      sessionStatus: "in_progress",
      setLogs: [],
      mergedDay: hydratedDay,
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
      await Promise.resolve();
    });

    expect(getOrCreateDaySession).toHaveBeenCalledWith(ROUTINE_ID, DAY_ID);
    expect(result.current.daysData[0].exercises[0].sets[0]).toMatchObject({
      completed: true,
      actualReps: 12,
    });
  });
});
