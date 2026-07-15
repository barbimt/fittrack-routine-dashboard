"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { resolvePrescriptionForSave } from "../editorPrescription";
import {
  buildSetLogRowsForExercise,
  buildSetLogRowsForExercises,
  type ExerciseForSetLogs,
} from "../materializeSetLogs";
import { buildTrainingDayFromSession } from "../routineMapper";
import type { RoutineExercise, WorkoutSetLog, WorkoutSessionStatus } from "../types";
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
      dayName: (dayRow.original_name as string | null) ?? (dayRow.name as string),
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
    typeof lastExercise?.sort_order === "number" ? lastExercise.sort_order + 1 : 0;

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

  const setLogs = (await fetchSetLogsForSession(supabase, user.id, sessionId)).filter(
    (log) => log.routine_exercise_id === exercise.id
  );

  revalidatePath("/");
  revalidatePath("/editor");

  return { ok: true, exercise, setLogs };
}

export type UpdateRepsResult = { ok: true } | { ok: false; error: string };

export async function updateSetReps(
  setLogId: string,
  actualReps: number | null
): Promise<UpdateRepsResult> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { ok: false, error: "Not authenticated." };
  }

  const { error } = await supabase
    .from("workout_set_logs")
    .update({ actual_reps: actualReps })
    .eq("id", setLogId)
    .eq("user_id", user.id);

  if (error) {
    return { ok: false, error: error.message };
  }

  return { ok: true };
}

export type ToggleResult = { ok: true } | { ok: false; error: string };

export async function toggleSetLog(
  setLogId: string,
  completed: boolean
): Promise<ToggleResult> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { ok: false, error: "Not authenticated." };
  }

  const { error } = await supabase
    .from("workout_set_logs")
    .update({ completed })
    .eq("id", setLogId)
    .eq("user_id", user.id);

  if (error) {
    return { ok: false, error: error.message };
  }

  return { ok: true };
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
