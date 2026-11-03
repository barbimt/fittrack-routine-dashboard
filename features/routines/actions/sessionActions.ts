"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import {
  exercisePlanColumns,
  replaceExerciseSets,
} from "../exerciseSets.server";
import {
  buildSetLogRowsForExercise,
  buildSetLogRowsForExercises,
  EXERCISE_FOR_SET_LOGS_SELECT,
  planSetLogReconciliation,
  toExerciseForSetLogs,
} from "../materializeSetLogs";
import { buildTrainingDayFromSession } from "../routineMapper";
import { parsePlannedSets, sanitizeMuscles } from "../setSchema";
import type { PlannedSet } from "../sets";
import { MAX_WEIGHT_KG, roundKg } from "../weight";
import type {
  RoutineExercise,
  WorkoutSetLog,
  WorkoutSessionStatus,
} from "../types";
import type { TrainingDay } from "@/lib/mock-data";

export type DaySessionResult =
  | {
      ok: true;
      sessionId: string;
      sessionStatus: WorkoutSessionStatus;
      setLogs: WorkoutSetLog[];
      mergedDay: TrainingDay;
    }
  | { ok: false; error: string };

async function fetchSetLogsForSession(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
  sessionId: string
): Promise<WorkoutSetLog[]> {
  const { data, error } = await supabase
    .from("workout_set_logs")
    .select("*")
    .eq("user_id", userId)
    .eq("workout_session_id", sessionId)
    .order("set_number");

  if (error) {
    return [];
  }

  return (data ?? []) as WorkoutSetLog[];
}

async function fetchDaySessionPayload(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
  routineDayId: string,
  sessionId: string,
  sessionStatus: WorkoutSessionStatus
): Promise<DaySessionResult> {
  const { data: dayRow, error: dayError } = await supabase
    .from("routine_days")
    .select("id, name, focus, original_name")
    .eq("id", routineDayId)
    .eq("user_id", userId)
    .maybeSingle();

  if (dayError || !dayRow) {
    return { ok: false, error: "Training day not found." };
  }

  const { data: exercises, error: exercisesError } = await supabase
    .from("routine_exercises")
    .select("*, routine_exercise_sets(*)")
    .eq("user_id", userId)
    .eq("routine_day_id", routineDayId)
    .order("sort_order");

  if (exercisesError) {
    return { ok: false, error: "Failed to load routine exercises." };
  }

  const setLogs = await fetchSetLogsForSession(supabase, userId, sessionId);
  const mergedDay = buildTrainingDayFromSession(
    {
      id: dayRow.id as string,
      dayName:
        (dayRow.original_name as string | null) ?? (dayRow.name as string),
      focus: (dayRow.focus as string | null) ?? (dayRow.name as string),
    },
    (exercises ?? []) as RoutineExercise[],
    setLogs
  );

  return {
    ok: true,
    sessionId,
    sessionStatus,
    setLogs,
    mergedDay,
  };
}

/**
 * Create set logs for routine exercises that do not yet have logs in this session.
 * Only runs for in_progress sessions — completed history is never rewritten.
 */
export async function syncDaySessionWithRoutine(
  sessionId: string
): Promise<DaySessionResult> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { ok: false, error: "Not authenticated." };
  }

  const { data: session, error: sessionError } = await supabase
    .from("workout_sessions")
    .select("id, status, routine_day_id")
    .eq("id", sessionId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (sessionError || !session) {
    return { ok: false, error: "Workout session not found." };
  }

  if (session.status !== "in_progress") {
    return fetchDaySessionPayload(
      supabase,
      user.id,
      session.routine_day_id as string,
      sessionId,
      session.status as WorkoutSessionStatus
    );
  }

  const { data: exercises, error: exercisesError } = await supabase
    .from("routine_exercises")
    .select(EXERCISE_FOR_SET_LOGS_SELECT)
    .eq("user_id", user.id)
    .eq("routine_day_id", session.routine_day_id as string)
    .order("sort_order");

  if (exercisesError) {
    return { ok: false, error: "Failed to load routine exercises." };
  }

  const { data: existingLogs, error: logsError } = await supabase
    .from("workout_set_logs")
    .select("routine_exercise_id")
    .eq("user_id", user.id)
    .eq("workout_session_id", sessionId);

  if (logsError) {
    return { ok: false, error: "Failed to load set logs." };
  }

  const loggedExerciseIds = new Set(
    (existingLogs ?? []).map((row) => row.routine_exercise_id as string)
  );

  const missingExercises = ((exercises ?? []) as unknown as RoutineExercise[])
    .filter((exercise) => !loggedExerciseIds.has(exercise.id))
    .map(toExerciseForSetLogs);

  if (missingExercises.length > 0) {
    const newRows = buildSetLogRowsForExercises(
      user.id,
      sessionId,
      missingExercises
    );

    const { error: insertError } = await supabase
      .from("workout_set_logs")
      .insert(newRows);

    if (insertError) {
      return { ok: false, error: "Failed to sync new exercises into session." };
    }
  }

  return fetchDaySessionPayload(
    supabase,
    user.id,
    session.routine_day_id as string,
    sessionId,
    session.status as WorkoutSessionStatus
  );
}

export async function getOrCreateDaySession(
  routineId: string,
  routineDayId: string
): Promise<DaySessionResult> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { ok: false, error: "Not authenticated." };
  }

  const today = new Date().toISOString().split("T")[0];

  const { data: existing } = await supabase
    .from("workout_sessions")
    .select("id, status")
    .eq("user_id", user.id)
    .eq("routine_day_id", routineDayId)
    .eq("session_date", today)
    .maybeSingle();

  let sessionId: string;
  let sessionStatus: WorkoutSessionStatus;

  if (existing) {
    sessionId = existing.id as string;
    sessionStatus = existing.status as WorkoutSessionStatus;

    if (sessionStatus === "in_progress") {
      return syncDaySessionWithRoutine(sessionId);
    }
  } else {
    const { data: newSession, error: sessionError } = await supabase
      .from("workout_sessions")
      .insert({
        user_id: user.id,
        routine_id: routineId,
        routine_day_id: routineDayId,
        session_date: today,
        status: "in_progress",
      })
      .select("id")
      .single();

    if (sessionError || !newSession) {
      return { ok: false, error: "Failed to create workout session." };
    }

    sessionId = newSession.id as string;
    sessionStatus = "in_progress";

    const { data: exercises } = await supabase
      .from("routine_exercises")
      .select(EXERCISE_FOR_SET_LOGS_SELECT)
      .eq("user_id", user.id)
      .eq("routine_day_id", routineDayId)
      .order("sort_order");

    if (exercises && exercises.length > 0) {
      const setLogs = buildSetLogRowsForExercises(
        user.id,
        sessionId,
        (exercises as unknown as RoutineExercise[]).map(toExerciseForSetLogs)
      );

      const { error: logsError } = await supabase
        .from("workout_set_logs")
        .insert(setLogs);

      if (logsError) {
        return { ok: false, error: "Failed to create set logs." };
      }
    }
  }

  return fetchDaySessionPayload(
    supabase,
    user.id,
    routineDayId,
    sessionId,
    sessionStatus
  );
}

export type AddExerciseToDayInput = {
  name: string;
  sets: PlannedSet[];
  muscleGroup?: string | null;
  secondaryMuscles?: string[];
};

async function fetchExerciseWithSets(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
  exerciseId: string
): Promise<RoutineExercise | null> {
  const { data } = await supabase
    .from("routine_exercises")
    .select("*, routine_exercise_sets(*)")
    .eq("id", exerciseId)
    .eq("user_id", userId)
    .maybeSingle();
  return (data as RoutineExercise | null) ?? null;
}

export type AddExerciseToDayResult =
  | { ok: true; exercise: RoutineExercise; setLogs: WorkoutSetLog[] }
  | { ok: false; error: string };

export async function addExerciseToDay(
  routineDayId: string,
  sessionId: string,
  input: AddExerciseToDayInput
): Promise<AddExerciseToDayResult> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { ok: false, error: "Not authenticated." };
  }

  const trimmedName = input.name.trim();
  if (!trimmedName) {
    return { ok: false, error: "Exercise name is required." };
  }

  const plannedSets = parsePlannedSets(input.sets);
  if (!plannedSets.ok) {
    return { ok: false, error: plannedSets.error };
  }

  const { data: session, error: sessionError } = await supabase
    .from("workout_sessions")
    .select("id, status, routine_day_id")
    .eq("id", sessionId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (sessionError || !session) {
    return { ok: false, error: "Workout session not found." };
  }

  if (session.routine_day_id !== routineDayId) {
    return { ok: false, error: "Session does not match this training day." };
  }

  if (session.status !== "in_progress") {
    return {
      ok: false,
      error: "Edit the workout before adding exercises to a saved session.",
    };
  }

  const { data: lastExercise } = await supabase
    .from("routine_exercises")
    .select("sort_order")
    .eq("user_id", user.id)
    .eq("routine_day_id", routineDayId)
    .order("sort_order", { ascending: false })
    .limit(1)
    .maybeSingle();

  const sortOrder =
    typeof lastExercise?.sort_order === "number"
      ? lastExercise.sort_order + 1
      : 0;

  const { data: inserted, error: insertError } = await supabase
    .from("routine_exercises")
    .insert({
      user_id: user.id,
      routine_day_id: routineDayId,
      name: trimmedName,
      notes: null,
      sort_order: sortOrder,
      ...exercisePlanColumns({
        sets: plannedSets.sets,
        restTime: null,
        ...sanitizeMuscles(input.muscleGroup, input.secondaryMuscles),
      }),
    })
    .select("id")
    .single();

  if (insertError || !inserted) {
    return { ok: false, error: "Failed to add exercise to routine." };
  }

  const setsResult = await replaceExerciseSets(
    supabase,
    user.id,
    inserted.id as string,
    plannedSets.sets
  );
  const exercise = setsResult.ok
    ? await fetchExerciseWithSets(supabase, user.id, inserted.id as string)
    : null;
  if (!exercise) {
    return { ok: false, error: "Failed to add exercise to routine." };
  }

  const newRows = buildSetLogRowsForExercise(
    user.id,
    sessionId,
    toExerciseForSetLogs(exercise)
  );

  const { error: logsError } = await supabase
    .from("workout_set_logs")
    .insert(newRows);

  if (logsError) {
    return { ok: false, error: "Exercise saved but session logs failed." };
  }

  const setLogs = (
    await fetchSetLogsForSession(supabase, user.id, sessionId)
  ).filter((log) => log.routine_exercise_id === exercise.id);

  revalidatePath("/");
  revalidatePath("/editor");

  return { ok: true, exercise, setLogs };
}

export type UpdateExerciseInDayInput = {
  name: string;
  muscleGroup: string | null;
  secondaryMuscles: string[];
  sets: PlannedSet[];
  restTime: string | null;
  notes: string | null;
};

export type UpdateExerciseInDayResult =
  | { ok: true; exercise: RoutineExercise; setLogs: WorkoutSetLog[] }
  | { ok: false; error: string };

export async function updateExerciseInDay(
  routineDayId: string,
  sessionId: string,
  exerciseId: string,
  input: UpdateExerciseInDayInput
): Promise<UpdateExerciseInDayResult> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { ok: false, error: "Not authenticated." };
  }

  const trimmedName = input.name.trim();
  if (!trimmedName) {
    return { ok: false, error: "Exercise name is required." };
  }

  const { data: session, error: sessionError } = await supabase
    .from("workout_sessions")
    .select("id, status, routine_day_id")
    .eq("id", sessionId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (sessionError || !session) {
    return { ok: false, error: "Workout session not found." };
  }

  if (session.routine_day_id !== routineDayId) {
    return { ok: false, error: "Session does not match this training day." };
  }

  if (session.status !== "in_progress") {
    return {
      ok: false,
      error: "Edit the workout before changing exercises in a saved session.",
    };
  }

  const { data: existing, error: existingError } = await supabase
    .from("routine_exercises")
    .select("id, sort_order, routine_day_id")
    .eq("id", exerciseId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (existingError || !existing) {
    return { ok: false, error: "Exercise not found." };
  }

  if (existing.routine_day_id !== routineDayId) {
    return { ok: false, error: "Exercise does not belong to this day." };
  }

  const plannedSets = parsePlannedSets(input.sets);
  if (!plannedSets.ok) {
    return { ok: false, error: plannedSets.error };
  }

  const { error: updateError } = await supabase
    .from("routine_exercises")
    .update({
      name: trimmedName,
      notes: input.notes,
      ...exercisePlanColumns({
        sets: plannedSets.sets,
        restTime: input.restTime,
        ...sanitizeMuscles(input.muscleGroup, input.secondaryMuscles),
      }),
    })
    .eq("id", exerciseId)
    .eq("user_id", user.id);

  if (updateError) {
    return { ok: false, error: "Failed to update exercise." };
  }

  const setsResult = await replaceExerciseSets(
    supabase,
    user.id,
    exerciseId,
    plannedSets.sets
  );
  const exercise = setsResult.ok
    ? await fetchExerciseWithSets(supabase, user.id, exerciseId)
    : null;
  if (!exercise) {
    return { ok: false, error: "Failed to update exercise." };
  }

  const { data: existingLogs, error: logsFetchError } = await supabase
    .from("workout_set_logs")
    .select("id, set_number")
    .eq("user_id", user.id)
    .eq("workout_session_id", sessionId)
    .eq("routine_exercise_id", exerciseId);

  if (logsFetchError) {
    return { ok: false, error: "Failed to load set logs for sync." };
  }

  const plan = planSetLogReconciliation(
    user.id,
    sessionId,
    toExerciseForSetLogs(exercise),
    (existingLogs ?? []).map((log) => ({
      id: log.id as string,
      set_number: log.set_number as number,
    }))
  );

  for (const { id, ...targets } of plan.updates) {
    const { error } = await supabase
      .from("workout_set_logs")
      .update(targets)
      .eq("id", id)
      .eq("user_id", user.id);

    if (error) {
      return { ok: false, error: "Failed to sync set targets." };
    }
  }

  if (plan.inserts.length > 0) {
    const { error } = await supabase
      .from("workout_set_logs")
      .insert(plan.inserts);
    if (error) {
      return { ok: false, error: "Failed to add new set logs." };
    }
  }

  if (plan.deleteIds.length > 0) {
    const { error } = await supabase
      .from("workout_set_logs")
      .delete()
      .eq("user_id", user.id)
      .in("id", plan.deleteIds);
    if (error) {
      return { ok: false, error: "Failed to remove extra set logs." };
    }
  }

  const setLogs = (
    await fetchSetLogsForSession(supabase, user.id, sessionId)
  ).filter((log) => log.routine_exercise_id === exercise.id);

  revalidatePath("/");
  revalidatePath("/editor");

  return { ok: true, exercise, setLogs };
}

export type UpdateSetLogProgressInput = {
  completed?: boolean;
  /** Pass `null` to clear; omit to leave unchanged. */
  actualReps?: number | null;
  /** Kilograms lifted. Pass `null` to clear; omit to leave unchanged. */
  actualWeightKg?: number | null;
};

export type UpdateSetLogProgressResult =
  | { ok: true }
  | { ok: false; error: string };

export async function updateSetLogProgress(
  setLogId: string,
  patch: UpdateSetLogProgressInput
): Promise<UpdateSetLogProgressResult> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { ok: false, error: "Not authenticated." };
  }

  const update: {
    completed?: boolean;
    actual_reps?: number | null;
    actual_weight_kg?: number | null;
  } = {};
  if (patch.completed !== undefined) {
    update.completed = patch.completed;
  }
  if ("actualReps" in patch) {
    const reps = patch.actualReps ?? null;
    if (reps !== null && (!Number.isInteger(reps) || reps < 0 || reps > 1000)) {
      return { ok: false, error: "Reps must be a whole number." };
    }
    update.actual_reps = reps;
  }
  if ("actualWeightKg" in patch) {
    const kg = patch.actualWeightKg ?? null;
    if (kg !== null && (!Number.isFinite(kg) || kg < 0 || kg > MAX_WEIGHT_KG)) {
      return { ok: false, error: `Weight must be between 0 and ${MAX_WEIGHT_KG} kg.` };
    }
    update.actual_weight_kg = kg === null ? null : roundKg(kg);
  }

  if (Object.keys(update).length === 0) {
    return { ok: true };
  }

  const { error } = await supabase
    .from("workout_set_logs")
    .update(update)
    .eq("id", setLogId)
    .eq("user_id", user.id);

  if (error) {
    return { ok: false, error: error.message };
  }

  // Keep Today fresh when navigating away and back (client router cache).
  revalidatePath("/");
  return { ok: true };
}

export type UpdateRepsResult = UpdateSetLogProgressResult;

export async function updateSetReps(
  setLogId: string,
  actualReps: number | null
): Promise<UpdateRepsResult> {
  return updateSetLogProgress(setLogId, { actualReps });
}

export type ToggleResult = UpdateSetLogProgressResult;

export async function toggleSetLog(
  setLogId: string,
  completed: boolean
): Promise<ToggleResult> {
  return updateSetLogProgress(setLogId, { completed });
}

export type ResetResult = { ok: true } | { ok: false; error: string };

export async function resetExerciseSets(
  sessionId: string,
  exerciseId: string
): Promise<ResetResult> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { ok: false, error: "Not authenticated." };
  }

  const { error } = await supabase
    .from("workout_set_logs")
    .update({ completed: false, actual_reps: null, actual_weight_kg: null })
    .eq("workout_session_id", sessionId)
    .eq("routine_exercise_id", exerciseId)
    .eq("user_id", user.id);

  if (error) {
    return { ok: false, error: error.message };
  }

  revalidatePath("/");
  return { ok: true };
}

export async function resetDaySession(sessionId: string): Promise<ResetResult> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { ok: false, error: "Not authenticated." };
  }

  const { error: logsError } = await supabase
    .from("workout_set_logs")
    .update({ completed: false, actual_reps: null, actual_weight_kg: null })
    .eq("workout_session_id", sessionId)
    .eq("user_id", user.id);

  if (logsError) {
    return { ok: false, error: logsError.message };
  }

  const { error: sessionError } = await supabase
    .from("workout_sessions")
    .update({ status: "in_progress" })
    .eq("id", sessionId)
    .eq("user_id", user.id);

  if (sessionError) {
    return { ok: false, error: sessionError.message };
  }

  revalidatePath("/");
  return { ok: true };
}

export type CompleteSessionResult = { ok: true } | { ok: false; error: string };

export async function completeDaySession(
  sessionId: string
): Promise<CompleteSessionResult> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { ok: false, error: "Not authenticated." };
  }

  const { error } = await supabase
    .from("workout_sessions")
    .update({ status: "completed" })
    .eq("id", sessionId)
    .eq("user_id", user.id);

  if (error) {
    return { ok: false, error: error.message };
  }

  revalidatePath("/");
  return { ok: true };
}

export async function reopenDaySession(
  sessionId: string
): Promise<CompleteSessionResult> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { ok: false, error: "Not authenticated." };
  }

  const { error } = await supabase
    .from("workout_sessions")
    .update({ status: "in_progress" })
    .eq("id", sessionId)
    .eq("user_id", user.id);

  if (error) {
    return { ok: false, error: error.message };
  }

  revalidatePath("/");
  return { ok: true };
}
