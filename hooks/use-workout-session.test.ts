import { describe, expect, it, vi, beforeEach } from "vitest";
import { act, renderHook } from "@testing-library/react";
import type { TrainingDay } from "@/lib/mock-data";
import { useWorkoutSession } from "./use-workout-session";

vi.mock("@/features/routines/actions/sessionActions", () => ({
  toggleSetLog: vi.fn().mockResolvedValue({ ok: true }),
  updateSetReps: vi.fn().mockResolvedValue({ ok: true }),
  getOrCreateDaySession: vi.fn(),
  resetExerciseSets: vi.fn(),
  resetDaySession: vi.fn(),
  completeDaySession: vi.fn(),
  reopenDaySession: vi.fn(),
}));

vi.mock("@/hooks/use-toast", () => ({
  toast: vi.fn(),
}));

import {
  toggleSetLog,
  updateSetReps,
} from "@/features/routines/actions/sessionActions";

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
