/**
 * Presentation helpers for the workout rest timer.
 * Keep UI labels/status mapping here so dashboards and cards stay thin.
 */

import type { Exercise } from "@/lib/mock-data";

export type ExerciseRestTimerStatus = {
  activeExerciseId: string | null;
  isPaused: boolean;
  countdownLabel: string;
};

export type RestTimerViewModel = {
  active: boolean;
  exerciseId: string | null;
  isPaused: boolean;
  countdownLabel: string;
  pause: () => void;
  resume: () => void;
  clear: () => void;
};

const REST_TIMER_PAGE_BASE = "flex-1 lg:px-0 lg:py-0";

/** Map hook state → props consumed by ExerciseCard. */
export function toExerciseRestTimerStatus(
  timer: Pick<RestTimerViewModel, "exerciseId" | "isPaused" | "countdownLabel">
): ExerciseRestTimerStatus {
  return {
    activeExerciseId: timer.exerciseId,
    isPaused: timer.isPaused,
    countdownLabel: timer.countdownLabel,
  };
}

/**
 * ExerciseCard rest-timer props for live + demo dashboards.
 * Read-only sessions omit start + status so the button stays hidden.
 */
export function exerciseCardRestProps(
  timer: Pick<
    RestTimerViewModel,
    "exerciseId" | "isPaused" | "countdownLabel"
  > & {
    start: (exercise: Exercise) => void;
  },
  isReadOnly: boolean
): {
  onStartRest?: (exercise: Exercise) => void;
  restTimerStatus?: ExerciseRestTimerStatus;
} {
  if (isReadOnly) return {};
  return {
    onStartRest: timer.start,
    restTimerStatus: toExerciseRestTimerStatus(timer),
  };
}

/** Extra bottom padding so the fixed rest bar does not cover content. */
export function restTimerPageClassName(active: boolean): string {
  return active ? `${REST_TIMER_PAGE_BASE} pb-28` : REST_TIMER_PAGE_BASE;
}

export type RestStartButtonState = {
  label: string;
  disabled: boolean;
  isForThisExercise: boolean;
  isPaused: boolean;
};

export function getRestStartButtonState(input: {
  exerciseId: string;
  restTime: string;
  status?: ExerciseRestTimerStatus | null;
}): RestStartButtonState {
  const restIsActive = Boolean(input.status?.activeExerciseId);
  const isForThisExercise =
    input.status?.activeExerciseId === input.exerciseId;
  const isPaused = Boolean(isForThisExercise && input.status?.isPaused);
  const label = isForThisExercise
    ? isPaused
      ? `Rest paused · ${input.status?.countdownLabel ?? ""}`
      : `Rest · ${input.status?.countdownLabel ?? ""}`
    : `Start rest · ${input.restTime}`;

  return {
    label,
    disabled: restIsActive,
    isForThisExercise,
    isPaused,
  };
}
