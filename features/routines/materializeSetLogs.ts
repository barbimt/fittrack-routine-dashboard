import { exercisePlannedSets } from "./exercisePlan";
import { formatReps, type PlannedSet, type SetType } from "./sets";
import type { RoutineExercise } from "./types";
import { formatKgNumber } from "./weight";

export type ExerciseForSetLogs = {
  id: string;
  name: string;
  muscle_group: string | null;
  muscle_groups_secondary: string[];
  sets: PlannedSet[];
};

/** Columns needed from `routine_exercises` (with nested sets) to build logs. */
export const EXERCISE_FOR_SET_LOGS_SELECT =
  "id, name, prescription, planned_sets, target_reps, weight, muscle_group, muscle_groups_secondary, routine_exercise_sets(*)";

export function toExerciseForSetLogs(
  exercise: Pick<
    RoutineExercise,
    | "id"
    | "name"
    | "prescription"
    | "planned_sets"
    | "target_reps"
    | "weight"
    | "muscle_group"
    | "muscle_groups_secondary"
    | "routine_exercise_sets"
  >
): ExerciseForSetLogs {
  return {
    id: exercise.id,
    name: exercise.name,
    muscle_group: exercise.muscle_group,
    muscle_groups_secondary: exercise.muscle_groups_secondary ?? [],
    sets: exercisePlannedSets(exercise),
  };
}

export type SetLogTargets = {
  set_type: SetType;
  target_reps: string | null;
  target_reps_min: number | null;
  target_reps_max: number | null;
  target_weight: string | null;
  target_weight_kg: number | null;
  exercise_name: string;
  muscle_group: string | null;
  muscle_groups_secondary: string[];
};

export type SetLogInsertRow = SetLogTargets & {
  user_id: string;
  workout_session_id: string;
  routine_exercise_id: string;
  set_number: number;
  actual_reps: null;
  actual_weight_kg: null;
  completed: false;
};

function targetsForSet(
  exercise: ExerciseForSetLogs,
  set: PlannedSet
): SetLogTargets {
  return {
    set_type: set.setType,
    target_reps: formatReps(set.repsMin, set.repsMax),
    target_reps_min: set.repsMin,
    target_reps_max: set.repsMax,
    target_weight:
      set.weightKg !== null ? `${formatKgNumber(set.weightKg)}kg` : null,
    target_weight_kg: set.weightKg,
    exercise_name: exercise.name,
    muscle_group: exercise.muscle_group,
    muscle_groups_secondary: exercise.muscle_groups_secondary,
  };
}

export function buildSetLogRowsForExercise(
  userId: string,
  sessionId: string,
  exercise: ExerciseForSetLogs
): SetLogInsertRow[] {
  return exercise.sets.map((set, index) => ({
    user_id: userId,
    workout_session_id: sessionId,
    routine_exercise_id: exercise.id,
    set_number: index + 1,
    ...targetsForSet(exercise, set),
    actual_reps: null,
    actual_weight_kg: null,
    completed: false,
  }));
}

export function buildSetLogRowsForExercises(
  userId: string,
  sessionId: string,
  exercises: ExerciseForSetLogs[]
): SetLogInsertRow[] {
  return exercises.flatMap((exercise) =>
    buildSetLogRowsForExercise(userId, sessionId, exercise)
  );
}

export type ExistingSetLogRef = {
  id: string;
  set_number: number;
};

export type SetLogTargetUpdate = SetLogTargets & { id: string };

/**
 * Align session set logs with the current exercise plan.
 * Preserves log ids (and thus completed / actual values) for matching set numbers.
 */
export function planSetLogReconciliation(
  userId: string,
  sessionId: string,
  exercise: ExerciseForSetLogs,
  existingLogs: ExistingSetLogRef[]
): {
  updates: SetLogTargetUpdate[];
  inserts: SetLogInsertRow[];
  deleteIds: string[];
} {
  const desired = buildSetLogRowsForExercise(userId, sessionId, exercise);
  const byNumber = new Map(
    existingLogs.map((log) => [log.set_number, log] as const)
  );
  const desiredNumbers = new Set(desired.map((row) => row.set_number));

  const updates: SetLogTargetUpdate[] = [];
  const inserts: SetLogInsertRow[] = [];

  desired.forEach((row, index) => {
    const existing = byNumber.get(row.set_number);
    if (existing) {
      updates.push({
        id: existing.id,
        ...targetsForSet(exercise, exercise.sets[index]),
      });
    } else {
      inserts.push(row);
    }
  });

  const deleteIds = existingLogs.flatMap((log) =>
    !desiredNumbers.has(log.set_number) ? [log.id] : []
  );

  return { updates, inserts, deleteIds };
}
