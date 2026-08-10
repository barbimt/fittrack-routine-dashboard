import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { act, renderHook } from "@testing-library/react";
import type { Exercise } from "@/lib/mock-data";

vi.mock("@/lib/notify", () => ({
  notify: {
    restComplete: vi.fn(),
  },
}));

import { notify } from "@/lib/notify";
import { useRestTimer } from "./use-rest-timer";

const exercise: Exercise = {
  id: "ex-1",
  name: "Squat",
  muscleGroup: "Legs",
  targetSets: 3,
  targetReps: 10,
  weight: "60kg",
  restTime: "3s",
  sets: [],
};

describe("useRestTimer", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("starts a countdown from the exercise rest time", () => {
    const { result } = renderHook(() => useRestTimer());

    act(() => {
      result.current.start(exercise);
    });

    expect(result.current.active).toBe(true);
    expect(result.current.exerciseId).toBe("ex-1");
    expect(result.current.exerciseName).toBe("Squat");
    expect(result.current.countdownLabel).toBe("0:03");
  });

  it("notifies when the countdown finishes", () => {
    const { result } = renderHook(() => useRestTimer());

    act(() => {
      result.current.start(exercise);
    });

    act(() => {
      vi.advanceTimersByTime(3500);
    });

    expect(result.current.active).toBe(false);
    expect(notify.restComplete).toHaveBeenCalledWith("Squat");
  });

  it("can pause and resume", () => {
    const { result } = renderHook(() => useRestTimer());

    act(() => {
      result.current.start(exercise);
    });

    act(() => {
      vi.advanceTimersByTime(1000);
      result.current.pause();
    });

    expect(result.current.isPaused).toBe(true);
    const pausedLabel = result.current.countdownLabel;

    act(() => {
      vi.advanceTimersByTime(2000);
    });

    expect(result.current.countdownLabel).toBe(pausedLabel);

    act(() => {
      result.current.resume();
    });

    expect(result.current.isPaused).toBe(false);
  });
});
