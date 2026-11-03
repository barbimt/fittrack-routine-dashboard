"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { ParsedRoutine } from "@/features/routine-import/types";
import { importedRoutineSchema } from "@/features/routine-import/schema";
import { insertActiveRoutineTree } from "@/features/routines/insertActiveRoutineTree.server";
import { sanitizeMuscles } from "@/features/routines/setSchema";

export type SaveRoutineResult =
  | { ok: true; routineId: string; dayCount: number; exerciseCount: number }
  | { ok: false; error: string };

export async function saveRoutine(
  routine: ParsedRoutine
): Promise<SaveRoutineResult> {
  const parsed = importedRoutineSchema.safeParse(routine);
  if (!parsed.success) {
    const issue = parsed.error.issues[0];
    return {
      ok: false,
      error: `The routine has invalid data${issue ? ` (${issue.message})` : ""}. Fix the file and upload it again.`,
    };
  }
  const input = parsed.data;

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
    .eq("name", input.name);

  if (deleteExistingError) {
    return { ok: false, error: "Failed to replace existing routine." };
  }

  const result = await insertActiveRoutineTree(supabase, {
    name: input.name,
    source: input.source,
    days: input.days.map((day) => ({
      name: day.name,
      focus: day.focus,
      originalName: day.originalName,
      sortOrder: day.sortOrder,
      exercises: day.exercises.map((exercise) => {
        const muscles = sanitizeMuscles(
          exercise.muscleGroup,
          exercise.secondaryMuscles
        );
        return {
          name: exercise.name,
          sets: exercise.sets,
          restTime: exercise.restTime,
          notes: exercise.notes,
          muscleGroup: muscles.muscleGroup,
          secondaryMuscles: muscles.secondaryMuscles,
          sortOrder: exercise.sortOrder,
        };
      }),
    })),
  });

  if (!result.ok) {
    return result;
  }

  revalidatePath("/", "layout");
  redirect("/");
}
