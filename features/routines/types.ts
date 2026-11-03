import type { SetType } from "./sets";

export interface Profile {
  id: string;
  email: string | null;
  created_at: string;
  updated_at: string;
}

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

export interface RoutineExerciseSet {
  id: string;
  user_id: string;
  routine_exercise_id: string;
  set_number: number;
  set_type: SetType;
  reps_min: number | null;
  reps_max: number | null;
  target_weight_kg: number | null;
  created_at: string;
  updated_at: string;
}

export interface RoutineExercise {
  id: string;
  user_id: string;
  routine_day_id: string;
  name: string;
  /** Display string generated from `routine_exercise_sets`. */
  prescription: string;
  /** @deprecated Derived from sets; kept in sync for one release. */
  planned_sets: number | null;
  /** @deprecated Derived from sets; kept in sync for one release. */
  target_reps: string | null;
  /** @deprecated Text load; use `routine_exercise_sets.target_weight_kg`. */
  weight: string | null;
  rest_time: string | null;
  rest_seconds?: number | null;
  notes: string | null;
  /** Primary muscle slug (see `muscleGroups.ts`). */
  muscle_group: string | null;
  muscle_groups_secondary?: string[] | null;
  sort_order: number;
  created_at: string;
  updated_at: string;
  routine_exercise_sets?: RoutineExerciseSet[] | null;
}

export type WorkoutSessionStatus = "in_progress" | "completed" | "cancelled";

export type SessionSavedNotice = "first" | "updated";

export interface WorkoutSession {
  id: string;
  user_id: string;
  routine_id: string;
  routine_day_id: string;
  session_date: string;
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
  set_type?: SetType;
  /** @deprecated Use `target_reps_min` / `target_reps_max`. */
  target_reps: string | null;
  target_reps_min?: number | null;
  target_reps_max?: number | null;
  /** @deprecated Use `target_weight_kg`. */
  target_weight: string | null;
  target_weight_kg?: number | null;
  exercise_name: string | null;
  muscle_group?: string | null;
  muscle_groups_secondary?: string[] | null;
  actual_reps: number | null;
  actual_weight_kg?: number | null;
  completed: boolean;
  created_at: string;
  updated_at: string;
}

export interface RoutineDayWithExercises extends RoutineDay {
  routine_exercises: RoutineExercise[];
}

export interface RoutineWithDays extends Routine {
  routine_days: RoutineDayWithExercises[];
}
