import type { SupabaseClient } from "@supabase/supabase-js";
import {
  buildExerciseSetRows,
  exercisePlanColumns,
} from "./exerciseSets.server";
import type { PlannedSet } from "./sets";
import type { RoutineSource } from "./types";

export type RoutineTreeExerciseInput = {
  name: string;
  sets: PlannedSet[];
  restTime?: string | null;
  notes: string | null;
  muscleGroup?: string | null;
  secondaryMuscles?: string[];
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
 * with its days, exercises, and planned sets. Shared by Excel import and
 * create-from-scratch.
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
        notes: exercise.notes,
        sort_order: exercise.sortOrder ?? exerciseIndex,
        ...exercisePlanColumns({
          sets: exercise.sets,
          restTime: exercise.restTime ?? null,
          muscleGroup: exercise.muscleGroup ?? null,
          secondaryMuscles: exercise.secondaryMuscles ?? [],
        }),
      }));

      const { data: insertedExercises, error: exerciseError } = await supabase
        .from("routine_exercises")
        .insert(exerciseRows)
        .select("id");

      if (
        exerciseError ||
        !insertedExercises ||
        insertedExercises.length !== day.exercises.length
      ) {
        return {
          ok: false,
          error: `Failed to save exercises for "${day.name}".`,
        };
      }

      const setRows = insertedExercises.flatMap((row, exerciseIndex) =>
        buildExerciseSetRows(
          row.id as string,
          day.exercises[exerciseIndex].sets
        )
      );

      if (setRows.length > 0) {
        const { error: setsError } = await supabase
          .from("routine_exercise_sets")
          .insert(setRows);

        if (setsError) {
          return {
            ok: false,
            error: `Failed to save sets for "${day.name}".`,
          };
        }
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
