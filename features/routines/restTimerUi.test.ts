import { describe, expect, it, vi } from "vitest";
import {
  exerciseCardRestProps,
  getRestStartButtonState,
  restTimerPageClassName,
  toExerciseRestTimerStatus,
} from "./restTimerUi";

describe("toExerciseRestTimerStatus", () => {
  it("maps hook fields onto card status props", () => {
    expect(
      toExerciseRestTimerStatus({
        exerciseId: "ex-1",
        isPaused: true,
        countdownLabel: "0:45",
      })
    ).toEqual({
      activeExerciseId: "ex-1",
      isPaused: true,
      countdownLabel: "0:45",
    });
  });
});

describe("exerciseCardRestProps", () => {
  const start = vi.fn();
  const timer = {
    exerciseId: "ex-1",
    isPaused: false,
    countdownLabel: "1:00",
    start,
  };

  it("omits props when read-only", () => {
    expect(exerciseCardRestProps(timer, true)).toEqual({});
  });

  it("wires start + status when editable", () => {
    expect(exerciseCardRestProps(timer, false)).toEqual({
      onStartRest: start,
      restTimerStatus: {
        activeExerciseId: "ex-1",
        isPaused: false,
        countdownLabel: "1:00",
      },
    });
  });
});

describe("restTimerPageClassName", () => {
  it("uses tight mobile padding and extra bottom space while the timer is active", () => {
    expect(restTimerPageClassName(false)).toBe(
      "flex-1 px-2 pt-3 pb-6 lg:px-0 lg:py-0"
    );
    expect(restTimerPageClassName(true)).toContain("pb-28");
    expect(restTimerPageClassName(true)).toContain("px-2");
  });
});

describe("getRestStartButtonState", () => {
  it("shows start label when idle", () => {
    expect(
      getRestStartButtonState({
        exerciseId: "ex-1",
        restTime: "90s",
      })
    ).toEqual({
      label: "Start rest · 90s",
      disabled: false,
      isForThisExercise: false,
      isPaused: false,
    });
  });

  it("disables other exercises while a timer is active", () => {
    const state = getRestStartButtonState({
      exerciseId: "ex-2",
      restTime: "60s",
      status: {
        activeExerciseId: "ex-1",
        isPaused: false,
        countdownLabel: "1:00",
      },
    });
    expect(state.disabled).toBe(true);
    expect(state.label).toBe("Start rest · 60s");
  });

  it("shows running and paused labels for the owning exercise", () => {
    expect(
      getRestStartButtonState({
        exerciseId: "ex-1",
        restTime: "90s",
        status: {
          activeExerciseId: "ex-1",
          isPaused: false,
          countdownLabel: "1:10",
        },
      }).label
    ).toBe("Rest · 1:10");

    expect(
      getRestStartButtonState({
        exerciseId: "ex-1",
        restTime: "90s",
        status: {
          activeExerciseId: "ex-1",
          isPaused: true,
          countdownLabel: "0:40",
        },
      }).label
    ).toBe("Rest paused · 0:40");
  });
});
