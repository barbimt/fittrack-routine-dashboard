import type { ExerciseSet } from "@/lib/mock-data";
import type { SetFieldPatch } from "@/features/routines/dashboardDayState";

/**
 * Optimistic + API patch when the user toggles set completion.
 * Completing with no logged reps auto-fills target; uncompleting clears reps.
 */
export function buildSetTogglePatch(currentSet: ExerciseSet): SetFieldPatch {
  const nextCompleted = !currentSet.completed;
  const shouldAutoFillReps = nextCompleted && currentSet.actualReps == null;
  const shouldClearReps = !nextCompleted;

  if (shouldAutoFillReps) {
    return { completed: nextCompleted, actualReps: currentSet.targetReps };
  }
  if (shouldClearReps) {
    return { completed: nextCompleted, actualReps: null };
  }
  return { completed: nextCompleted };
}

/**
 * Patch when the user edits actual reps.
 * 0 / null → incomplete; ≥1 → complete; other values leave completed unchanged.
 */
export function buildRepsChangePatch(reps: number | null): SetFieldPatch {
  return {
    actualReps: reps,
    ...(reps === null || reps === 0
      ? { completed: false }
      : reps >= 1
        ? { completed: true }
        : {}),
  };
}

/** Map of exerciseId → remount key after reset / prescription edits. */
export function bumpRevisionMap(
  prev: Record<string, number>,
  ids: string[]
): Record<string, number> {
  const next = { ...prev };
  for (const id of ids) {
    next[id] = (next[id] ?? 0) + 1;
  }
  return next;
}
