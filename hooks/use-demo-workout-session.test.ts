import { describe, expect, it, vi, beforeEach } from "vitest";
import { act, renderHook } from "@testing-library/react";
import type { TrainingDay } from "@/lib/mock-data";
import { useDemoWorkoutSession } from "./use-demo-workout-session";

vi.mock("@/hooks/use-toast", () => ({
  toast: vi.fn(),
}));

import { toast } from "@/hooks/use-toast";

const SET_ID = "s1";
const DAY_ID = "monday";
const DAY_TWO_ID = "tuesday";

const initialDays: TrainingDay[] = [
  {
    id: DAY_ID,
    dayName: "Monday",
    focus: "Glutes",
    exercises: [
      {
        id: "ex-1",
        name: "Hip Thrust",
        muscleGroup: "Glutes",
        targetSets: 1,
        targetReps: 10,
        weight: "60kg",
        restTime: "90s",
        sets: [
          {
            id: SET_ID,
            setNumber: 1,
            targetReps: 10,
            actualReps: null,
            completed: false,
          },
        ],
      },
    ],
  },
  {
    id: DAY_TWO_ID,
    dayName: "Tuesday",
    focus: "Back",
    exercises: [
      {
        id: "ex-2",
        name: "Row",
        muscleGroup: "Back",
        targetSets: 1,
        targetReps: 12,
        weight: "40kg",
        restTime: "60s",
        sets: [
          {
            id: "s2",
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

describe("useDemoWorkoutSession", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("toggles sets without requiring UUID ids", () => {
    const { result } = renderHook(() =>
      useDemoWorkoutSession({
        initialDays,
        initialDayId: DAY_ID,
      })
    );

    act(() => {
      result.current.handleSetToggle(SET_ID);
    });

    const set = result.current.daysData[0].exercises[0].sets[0];
    expect(set.completed).toBe(true);
    expect(set.actualReps).toBe(10);
  });

  it("switches training days locally", () => {
    const { result } = renderHook(() =>
      useDemoWorkoutSession({
        initialDays,
        initialDayId: DAY_ID,
      })
    );

    act(() => {
      result.current.handleSelectDay(DAY_TWO_ID);
    });

    expect(result.current.selectedDayId).toBe(DAY_TWO_ID);
    expect(result.current.selectedDay?.dayName).toBe("Tuesday");
  });

  it("enters read-only mode after saving in demo", () => {
    const { result } = renderHook(() =>
      useDemoWorkoutSession({
        initialDays,
        initialDayId: DAY_ID,
      })
    );

    act(() => {
      result.current.handleSetToggle(SET_ID);
    });

    act(() => {
      result.current.handleSaveWorkout();
    });

    expect(result.current.isSessionSaved).toBe(true);
    expect(result.current.isReadOnly).toBe(true);
    expect(toast).toHaveBeenCalledWith(
      expect.objectContaining({ title: "Workout saved (demo)" })
    );
  });

  it("resets the selected day without calling Supabase", () => {
    const { result } = renderHook(() =>
      useDemoWorkoutSession({
        initialDays,
        initialDayId: DAY_ID,
      })
    );

    act(() => {
      result.current.handleSetToggle(SET_ID);
    });

    act(() => {
      result.current.handleResetDay();
    });

    const set = result.current.daysData[0].exercises[0].sets[0];
    expect(set.completed).toBe(false);
    expect(set.actualReps).toBeNull();
    expect(result.current.isSessionSaved).toBe(false);
  });
});
