import type { SupabaseClient } from "@supabase/supabase-js";
import { restTimeToSeconds } from "./restTime";
import { legacyColumnsFromSets, type PlannedSet } from "./sets";

export type ExerciseSetInsertRow = {
  routine_exercise_id: string;
  set_number: number;
  set_type: PlannedSet["setType"];
  reps_min: number | null;
  reps_max: number | null;
  target_weight_kg: number | null;
};

export function buildExerciseSetRows(
  exerciseId: string,
  sets: PlannedSet[]
): ExerciseSetInsertRow[] {
  return sets.map((set, index) => ({
    routine_exercise_id: exerciseId,
    set_number: index + 1,
    set_type: set.setType,
    reps_min: set.repsMin,
    reps_max: set.repsMax,
    target_weight_kg: set.weightKg,
  }));
}

/** Columns written on `routine_exercises` for a given plan (legacy fields derived). */
export function exercisePlanColumns(input: {
  sets: PlannedSet[];
  restTime: string | null;
  muscleGroup: string | null;
  secondaryMuscles: string[];
}) {
  const restSeconds = restTimeToSeconds(input.restTime);
  return {
    ...legacyColumnsFromSets(input.sets),
    rest_time: input.restTime,
    rest_seconds: restSeconds > 0 ? restSeconds : null,
    muscle_group: input.muscleGroup,
    muscle_groups_secondary: input.secondaryMuscles,
  };
}

/** Replaces every planned set of one exercise. RLS scopes rows to the caller. */
export async function replaceExerciseSets(
  supabase: SupabaseClient,
  userId: string,
  exerciseId: string,
  sets: PlannedSet[]
): Promise<{ ok: true } | { ok: false; error: string }> {
  const { error: deleteError } = await supabase
    .from("routine_exercise_sets")
    .delete()
    .eq("user_id", userId)
    .eq("routine_exercise_id", exerciseId);

  if (deleteError) {
    return { ok: false, error: "Failed to update planned sets." };
  }

  if (sets.length === 0) return { ok: true };

  const { error: insertError } = await supabase
    .from("routine_exercise_sets")
    .insert(
      buildExerciseSetRows(exerciseId, sets).map((row) => ({
        ...row,
        user_id: userId,
      }))
    );

  if (insertError) {
    return { ok: false, error: "Failed to save planned sets." };
  }

  return { ok: true };
}
