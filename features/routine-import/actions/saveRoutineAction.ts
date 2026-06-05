"use server";

import { createClient } from "@/lib/supabase/server";
import type { ParsedRoutine } from "@/features/routine-import/types";

export type SaveRoutineResult =
  | { ok: true; routineId: string; dayCount: number; exerciseCount: number }
  | { ok: false; error: string };

export async function saveRoutine(
  routine: ParsedRoutine
): Promise<SaveRoutineResult> {
  const supabase = await createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return { ok: false, error: "You must be signed in to save a routine." };
  }

  const userId = user.id;

  const { error: deleteExistingError } = await supabase
    .from("routines")
    .delete()
    .eq("user_id", userId)
    .eq("name", routine.name);

  if (deleteExistingError) {
    return { ok: false, error: "Failed to replace existing routine." };
  }

  const { error: deactivateError } = await supabase
    .from("routines")
    .update({ is_active: false })
    .eq("user_id", userId)
    .eq("is_active", true);

  if (deactivateError) {
    return { ok: false, error: "Failed to update existing routines." };
  }

  const { data: routineRow, error: routineError } = await supabase
    .from("routines")
    .insert({
      user_id: userId,
      name: routine.name,
      source: routine.source,
      is_active: true,
    })
    .select("id")
    .single();

  if (routineError || !routineRow) {
    return { ok: false, error: "Failed to save routine." };
  }

  const routineId = routineRow.id as string;
  let totalExerciseCount = 0;

  for (const day of routine.days) {
    const { data: dayRow, error: dayError } = await supabase
      .from("routine_days")
      .insert({
        user_id: userId,
        routine_id: routineId,
        name: day.name,
        focus: day.focus,
        original_name: day.originalName,
        sort_order: day.sortOrder,
      })
      .select("id")
      .single();

    if (dayError || !dayRow) {
      return { ok: false, error: `Failed to save day "${day.name}".` };
    }

    const dayId = dayRow.id as string;

    if (day.exercises.length > 0) {
      const exerciseRows = day.exercises.map((exercise) => ({
        user_id: userId,
        routine_day_id: dayId,
        name: exercise.name,
        prescription: exercise.prescription,
        planned_sets: exercise.plannedSets,
        target_reps: exercise.targetReps,
        weight: exercise.weight,
        notes: exercise.notes,
        sort_order: exercise.sortOrder,
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
    dayCount: routine.days.length,
    exerciseCount: totalExerciseCount,
  };
}
