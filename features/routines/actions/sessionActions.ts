"use server";

import { createClient } from "@/lib/supabase/server";
import type { WorkoutSetLog } from "../types";

export type DaySessionResult =
  | { ok: true; sessionId: string; setLogs: WorkoutSetLog[] }
  | { ok: false; error: string };

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
    .select("id")
    .eq("user_id", user.id)
    .eq("routine_day_id", routineDayId)
    .eq("session_date", today)
    .maybeSingle();

  let sessionId: string;

  if (existing) {
    sessionId = existing.id as string;
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

    const { data: exercises } = await supabase
      .from("routine_exercises")
      .select("id, planned_sets, target_reps")
      .eq("user_id", user.id)
      .eq("routine_day_id", routineDayId)
      .order("sort_order");

    if (exercises && exercises.length > 0) {
      const setLogs = exercises.flatMap((ex) => {
        const count =
          typeof ex.planned_sets === "number" && ex.planned_sets > 0
            ? ex.planned_sets
            : 3;
        return Array.from({ length: count }, (_, i) => ({
          user_id: user.id,
          workout_session_id: sessionId,
          routine_exercise_id: ex.id as string,
          set_number: i + 1,
          target_reps: ex.target_reps as string | null,
          actual_reps: null,
          completed: false,
        }));
      });

      const { error: logsError } = await supabase
        .from("workout_set_logs")
        .insert(setLogs);

      if (logsError) {
        return { ok: false, error: "Failed to create set logs." };
      }
    }
  }

  const { data: setLogs, error: fetchError } = await supabase
    .from("workout_set_logs")
    .select("*")
    .eq("user_id", user.id)
    .eq("workout_session_id", sessionId)
    .order("set_number");

  if (fetchError) {
    return { ok: false, error: "Failed to fetch set logs." };
  }

  return {
    ok: true,
    sessionId,
    setLogs: (setLogs ?? []) as WorkoutSetLog[],
  };
}

export type UpdateRepsResult = { ok: true } | { ok: false; error: string };

export async function updateSetReps(
  setLogId: string,
  actualReps: number
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
