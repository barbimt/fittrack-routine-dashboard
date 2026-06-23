"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { isUuid } from "@/lib/uuid";
import { buildPrescription } from "../prescription";
import type { RoutineEditPatch, RoutineExerciseUpsert } from "../routinePatch";

export type UpdateRoutineResult = { ok: true } | { ok: false; error: string };

function exerciseFields(exercise: RoutineExerciseUpsert) {
  return {
    name: exercise.name,
    prescription: buildPrescription(exercise.plannedSets, exercise.targetReps),
    planned_sets:
      exercise.plannedSets && exercise.plannedSets > 0
        ? exercise.plannedSets
        : null,
    target_reps: exercise.targetReps,
    weight: exercise.weight,
    rest_time: exercise.restTime,
    notes: exercise.notes,
    muscle_group: exercise.muscleGroup,
    sort_order: exercise.sortOrder,
  };
}

/**
 * Persist a minimal set of routine edits. Only changed/added rows are upserted
 * and only removed rows are deleted, so a single-field edit results in a single
 * UPDATE rather than rewriting the whole routine. UUIDs are preserved so
 * dependent workout_set_logs are not cascade-deleted.
 */
export async function updateRoutine(
  patch: RoutineEditPatch
): Promise<UpdateRoutineResult> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { ok: false, error: "Not authenticated." };
  }

  const userId = user.id;
  const { routineId } = patch;

  const { data: routineRow, error: routineLookupError } = await supabase
    .from("routines")
    .select("id")
    .eq("id", routineId)
    .eq("user_id", userId)
    .maybeSingle();

  if (routineLookupError || !routineRow) {
    return { ok: false, error: "Routine not found." };
  }

  // Deletions first: removed exercises, then removed days (day delete cascades
  // any of its remaining exercises).
  if (patch.deleteExerciseIds.length > 0) {
    const { error } = await supabase
      .from("routine_exercises")
      .delete()
      .eq("user_id", userId)
      .in("id", patch.deleteExerciseIds);

    if (error) {
      return { ok: false, error: "Failed to delete removed exercises." };
    }
  }

  if (patch.deleteDayIds.length > 0) {
    const { error } = await supabase
      .from("routine_days")
      .delete()
      .eq("user_id", userId)
      .in("id", patch.deleteDayIds);

    if (error) {
      return { ok: false, error: "Failed to delete removed days." };
    }
  }

  // New days must exist before exercises can reference them.
  const newDayIdMap = new Map<string, string>();

  for (const day of patch.upsertDays) {
    const fields = {
      name: day.name,
      focus: day.focus,
      original_name: day.originalName,
      sort_order: day.sortOrder,
    };

    if (isUuid(day.id)) {
      const { error } = await supabase
        .from("routine_days")
        .update(fields)
        .eq("id", day.id)
        .eq("user_id", userId);

      if (error) {
        return {
          ok: false,
          error: `Failed to update day "${day.name}". ${error.message}`,
        };
      }
    } else {
      const { data: inserted, error } = await supabase
        .from("routine_days")
        .insert({ user_id: userId, routine_id: routineId, ...fields })
        .select("id")
        .single();

      if (error || !inserted) {
        return {
          ok: false,
          error: `Failed to create day "${day.name}".${error ? ` ${error.message}` : ""}`,
        };
      }

      newDayIdMap.set(day.id, inserted.id as string);
    }
  }

  for (const exercise of patch.upsertExercises) {
    const dayId = isUuid(exercise.dayId)
      ? exercise.dayId
      : newDayIdMap.get(exercise.dayId);

    if (!dayId) {
      return {
        ok: false,
        error: `Missing target day for exercise "${exercise.name}".`,
      };
    }

    const fields = exerciseFields(exercise);

    if (isUuid(exercise.id)) {
      const { error } = await supabase
        .from("routine_exercises")
        .update({ ...fields, routine_day_id: dayId })
        .eq("id", exercise.id)
        .eq("user_id", userId);

      if (error) {
        return {
          ok: false,
          error: `Failed to update exercise "${exercise.name}". ${error.message}`,
        };
      }
    } else {
      const { error } = await supabase
        .from("routine_exercises")
        .insert({ user_id: userId, routine_day_id: dayId, ...fields });

      if (error) {
        return {
          ok: false,
          error: `Failed to create exercise "${exercise.name}". ${error.message}`,
        };
      }
    }
  }

  revalidatePath("/");
  revalidatePath("/editor");

  return { ok: true };
}
