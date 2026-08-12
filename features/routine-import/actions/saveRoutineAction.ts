"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { ParsedRoutine } from "@/features/routine-import/types";
import { insertActiveRoutineTree } from "@/features/routines/insertActiveRoutineTree.server";

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

  const result = await insertActiveRoutineTree(supabase, {
    name: routine.name,
    source: routine.source,
    days: routine.days.map((day) => ({
      name: day.name,
      focus: day.focus,
      originalName: day.originalName,
      sortOrder: day.sortOrder,
      exercises: day.exercises.map((exercise) => ({
        name: exercise.name,
        prescription: exercise.prescription,
        plannedSets: exercise.plannedSets,
        targetReps: exercise.targetReps,
        weight: exercise.weight,
        notes: exercise.notes,
        sortOrder: exercise.sortOrder,
      })),
    })),
  });

  if (!result.ok) {
    return result;
  }

  revalidatePath("/", "layout");
  redirect("/");
}
