import type { ExerciseSet } from "@/lib/mock-data";
import type { SetFieldPatch } from "@/features/routines/dashboardDayState";

/**
 * Optimistic + API patch when the user toggles set completion.
 * Completing fills empty reps / kg with the target; uncompleting clears both.
 */
export function buildSetTogglePatch(currentSet: ExerciseSet): SetFieldPatch {
  const nextCompleted = !currentSet.completed;

  if (!nextCompleted) {
    return { completed: false, actualReps: null, actualWeightKg: null };
  }

  const patch: SetFieldPatch = { completed: true };
  if (currentSet.actualReps == null) {
    patch.actualReps = currentSet.targetReps;
  }
  if (currentSet.actualWeightKg == null && currentSet.targetWeightKg != null) {
    patch.actualWeightKg = currentSet.targetWeightKg;
  }
  return patch;
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

/** Patch when the user edits kg lifted. Weight alone never changes completion. */
export function buildWeightChangePatch(kg: number | null): SetFieldPatch {
  return { actualWeightKg: kg };
}

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
