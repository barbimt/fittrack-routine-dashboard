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

const REST_TIMER_PAGE_BASE = "flex-1 px-2 pt-3 pb-6 lg:px-0 lg:py-0";

export function toExerciseRestTimerStatus(
  timer: Pick<RestTimerViewModel, "exerciseId" | "isPaused" | "countdownLabel">
): ExerciseRestTimerStatus {
  return {
    activeExerciseId: timer.exerciseId,
    isPaused: timer.isPaused,
    countdownLabel: timer.countdownLabel,
  };
}

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
  const isForThisExercise = input.status?.activeExerciseId === input.exerciseId;
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
