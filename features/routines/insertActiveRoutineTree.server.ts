import type { SupabaseClient } from "@supabase/supabase-js";
import type { RoutineSource } from "./types";

export type RoutineTreeExerciseInput = {
  name: string;
  prescription: string;
  plannedSets: number | null;
  targetReps: string | null;
  weight: string | null;
  restTime?: string | null;
  notes: string | null;
  muscleGroup?: string | null;
  sortOrder: number;
};

export type RoutineTreeDayInput = {
  name: string;
  focus: string | null;
  originalName: string | null;
  sortOrder: number;
  exercises: RoutineTreeExerciseInput[];
};

export type InsertActiveRoutineTreeInput = {
  name: string;
  source: RoutineSource;
  days: RoutineTreeDayInput[];
};

export type InsertActiveRoutineTreeResult =
  | { ok: true; routineId: string; dayCount: number; exerciseCount: number }
  | { ok: false; error: string };

/**
 * Deactivate the user's other active routines, then insert a new active routine
 * with its days and exercises. Shared by Excel import and create-from-scratch.
 *
 * Ownership (`user_id`) is always taken from the authenticated session — never
 * from caller-supplied input.
 */
export async function insertActiveRoutineTree(
  supabase: SupabaseClient,
  input: InsertActiveRoutineTreeInput
): Promise<InsertActiveRoutineTreeResult> {
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return { ok: false, error: "Not authenticated." };
  }

  const userId = user.id;
  const { name, source, days } = input;

  const { error: deactivateError } = await supabase
    .from("routines")
    .update({ is_active: false })
    .eq("user_id", userId)
    .eq("is_active", true);

  if (deactivateError) {
    return { ok: false, error: "Failed to update existing routines." };
  }

  // user_id comes from column DEFAULT auth.uid() — never from caller input.
  const { data: routineRow, error: routineError } = await supabase
    .from("routines")
    .insert({
      name,
      source,
      is_active: true,
    })
    .select("id")
    .single();

  if (routineError || !routineRow) {
    return { ok: false, error: "Failed to save routine." };
  }

  const routineId = routineRow.id as string;
  let totalExerciseCount = 0;

  for (const [index, day] of days.entries()) {
    const { data: dayRow, error: dayError } = await supabase
      .from("routine_days")
      .insert({
        routine_id: routineId,
        name: day.name,
        focus: day.focus,
        original_name: day.originalName,
        sort_order: day.sortOrder ?? index,
      })
      .select("id")
      .single();

    if (dayError || !dayRow) {
      return { ok: false, error: `Failed to save day "${day.name}".` };
    }

    const dayId = dayRow.id as string;

    if (day.exercises.length > 0) {
      const exerciseRows = day.exercises.map((exercise, exerciseIndex) => ({
        routine_day_id: dayId,
        name: exercise.name,
        prescription: exercise.prescription,
        planned_sets: exercise.plannedSets,
        target_reps: exercise.targetReps,
        weight: exercise.weight,
        rest_time: exercise.restTime ?? null,
        notes: exercise.notes,
        muscle_group: exercise.muscleGroup ?? null,
        sort_order: exercise.sortOrder ?? exerciseIndex,
      }));

      const { error: exerciseError } = await supabase
        .from("routine_exercises")
        .insert(exerciseRows);

      if (exerciseError) {
        return {
          ok: false,
          error: `Failed to save exercises for "${day.name}".`,
        };
      }

      totalExerciseCount += day.exercises.length;
    }
  }

  return {
    ok: true,
    routineId,
    dayCount: days.length,
    exerciseCount: totalExerciseCount,
  };
}
