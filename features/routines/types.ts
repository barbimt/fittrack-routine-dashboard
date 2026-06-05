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
  target_reps: string | null;
  actual_reps: number | null;
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
