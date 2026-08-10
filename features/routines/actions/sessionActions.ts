"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { resolvePrescriptionForSave } from "../editorPrescription";
import {
  buildSetLogRowsForExercise,
  buildSetLogRowsForExercises,
  planSetLogReconciliation,
  type ExerciseForSetLogs,
} from "../materializeSetLogs";
import { buildTrainingDayFromSession } from "../routineMapper";
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
    .select("*")
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
    .select("id, name, prescription, planned_sets, target_reps, weight")
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

  const missingExercises = (exercises ?? []).filter(
    (exercise) => !loggedExerciseIds.has(exercise.id as string)
  ) as ExerciseForSetLogs[];

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
      .select("id, name, prescription, planned_sets, target_reps, weight")
      .eq("user_id", user.id)
      .eq("routine_day_id", routineDayId)
      .order("sort_order");

    if (exercises && exercises.length > 0) {
      const setLogs = buildSetLogRowsForExercises(
        user.id,
        sessionId,
        exercises as ExerciseForSetLogs[]
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
  plannedSets: number;
  targetReps: string;
  weight?: string | null;
  muscleGroup?: string | null;
  prescription?: string | null;
};

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

  if (!Number.isInteger(input.plannedSets) || input.plannedSets < 1) {
    return { ok: false, error: "Sets must be at least 1." };
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

  const resolved = resolvePrescriptionForSave({
    id: "new-exercise",
    dayId: routineDayId,
    name: trimmedName,
    muscleGroup: input.muscleGroup ?? null,
    prescription: input.prescription ?? null,
    plannedSets: input.plannedSets,
    targetReps: input.targetReps.trim() || null,
    weight: input.weight ?? null,
    restTime: null,
    notes: null,
    sortOrder,
  });

  const { data: inserted, error: insertError } = await supabase
    .from("routine_exercises")
    .insert({
      user_id: user.id,
      routine_day_id: routineDayId,
      name: trimmedName,
      prescription: resolved.prescription,
      planned_sets: resolved.plannedSets,
      target_reps: resolved.targetReps,
      weight: input.weight ?? null,
      rest_time: null,
      notes: null,
      muscle_group: input.muscleGroup ?? null,
      sort_order: sortOrder,
    })
    .select("*")
    .single();

  if (insertError || !inserted) {
    return { ok: false, error: "Failed to add exercise to routine." };
  }

  const exercise = inserted as RoutineExercise;
  const newRows = buildSetLogRowsForExercise(user.id, sessionId, {
    id: exercise.id,
    name: exercise.name,
    prescription: exercise.prescription,
    planned_sets: exercise.planned_sets,
    target_reps: exercise.target_reps,
    weight: exercise.weight,
  });

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
  prescription: string | null;
  plannedSets: number | null;
  targetReps: string | null;
  weight: string | null;
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

  const resolved = resolvePrescriptionForSave({
    id: exerciseId,
    dayId: routineDayId,
    name: trimmedName,
    muscleGroup: input.muscleGroup,
    prescription: input.prescription,
    plannedSets: input.plannedSets,
    targetReps: input.targetReps,
    weight: input.weight,
    restTime: input.restTime,
    notes: input.notes,
    sortOrder:
      typeof existing.sort_order === "number" ? existing.sort_order : 0,
  });

  const { data: updated, error: updateError } = await supabase
    .from("routine_exercises")
    .update({
      name: trimmedName,
      prescription: resolved.prescription,
      planned_sets: resolved.plannedSets,
      target_reps: resolved.targetReps,
      weight: input.weight,
      rest_time: input.restTime,
      notes: input.notes,
      muscle_group: input.muscleGroup,
    })
    .eq("id", exerciseId)
    .eq("user_id", user.id)
    .select("*")
    .single();

  if (updateError || !updated) {
    return { ok: false, error: "Failed to update exercise." };
  }

  const exercise = updated as RoutineExercise;

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
    {
      id: exercise.id,
      name: exercise.name,
      prescription: exercise.prescription,
      planned_sets: exercise.planned_sets,
      target_reps: exercise.target_reps,
      weight: exercise.weight,
    },
    (existingLogs ?? []).map((log) => ({
      id: log.id as string,
      set_number: log.set_number as number,
    }))
  );

  for (const patch of plan.updates) {
    const { error } = await supabase
      .from("workout_set_logs")
      .update({
        target_reps: patch.target_reps,
        target_weight: patch.target_weight,
        exercise_name: patch.exercise_name,
      })
      .eq("id", patch.id)
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
};

export type UpdateSetLogProgressResult =
  | { ok: true }
  | { ok: false; error: string };

/** Single write for set completion and/or actual reps (one POST / DB update). */
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

  const update: { completed?: boolean; actual_reps?: number | null } = {};
  if (patch.completed !== undefined) {
    update.completed = patch.completed;
  }
  if ("actualReps" in patch) {
    update.actual_reps = patch.actualReps ?? null;
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
    .update({ completed: false, actual_reps: null })
    .eq("workout_session_id", sessionId)
    .eq("routine_exercise_id", exerciseId)
    .eq("user_id", user.id);

  if (error) {
    return { ok: false, error: error.message };
  }

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
    .update({ completed: false, actual_reps: null })
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

  return { ok: true };
}
