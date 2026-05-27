// Database row types for the routines domain.
// These mirror the columns in supabase/schema.sql exactly.
// Not generated — maintained manually until Supabase CLI type generation is set up.

export interface Profile {
  id: string;
  email: string | null;
  created_at: string;
  updated_at: string;
}

// source values are constrained by a CHECK in the DB.
export type RoutineSource = "manual" | "excel";

export interface Routine {
  id: string;
  user_id: string;
  name: string;
  source: RoutineSource;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface RoutineDay {
  id: string;
  user_id: string;
  routine_id: string;
  name: string;
  focus: string | null;
  original_name: string | null;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface RoutineExercise {
  id: string;
  user_id: string;
  routine_day_id: string;
  name: string;
  prescription: string;
  planned_sets: number | null;
  target_reps: string | null;
  weight: string | null;
  rest_time: string | null;
  notes: string | null;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

// status values are constrained by a CHECK in the DB.
export type WorkoutSessionStatus = "in_progress" | "completed" | "cancelled";

export interface WorkoutSession {
  id: string;
  user_id: string;
  routine_id: string;
  routine_day_id: string;
  session_date: string; // ISO date string, e.g. "2026-05-27"
  status: WorkoutSessionStatus;
  created_at: string;
  updated_at: string;
}

export interface WorkoutSetLog {
  id: string;
  user_id: string;
  workout_session_id: string;
  routine_exercise_id: string;
  set_number: number;
  target_reps: string | null;
  actual_reps: number | null;
  completed: boolean;
  created_at: string;
  updated_at: string;
}

// ---------------------------------------------------------------------------
// Joined / composed types — used when fetching nested data in one query.
// ---------------------------------------------------------------------------

export interface RoutineDayWithExercises extends RoutineDay {
  routine_exercises: RoutineExercise[];
}

export interface RoutineWithDays extends Routine {
  routine_days: RoutineDayWithExercises[];
}
