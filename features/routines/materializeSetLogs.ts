import { expandPrescriptionToSets } from "@/features/routine-import/utils/parsePrescription";

export type ExerciseForSetLogs = {
  id: string;
  name: string;
  prescription: string;
  planned_sets: number | null;
  target_reps: string | null;
  weight: string | null;
};

export type SetLogInsertRow = {
  user_id: string;
  workout_session_id: string;
  routine_exercise_id: string;
  set_number: number;
  target_reps: string | null;
  target_weight: string | null;
  exercise_name: string;
  actual_reps: null;
  completed: false;
};

export function buildSetLogRowsForExercise(
  userId: string,
  sessionId: string,
  exercise: ExerciseForSetLogs
): SetLogInsertRow[] {
  const fallbackWeight = exercise.weight ?? null;
  const expanded = expandPrescriptionToSets(
    exercise.prescription,
    fallbackWeight
  );

  if (expanded.length > 0) {
    return expanded.map((target) => ({
      user_id: userId,
      workout_session_id: sessionId,
      routine_exercise_id: exercise.id,
      set_number: target.setNumber,
      target_reps: String(target.targetReps),
      target_weight: target.targetWeight,
      exercise_name: exercise.name,
      actual_reps: null,
      completed: false,
    }));
  }

  const count =
    typeof exercise.planned_sets === "number" && exercise.planned_sets > 0
      ? exercise.planned_sets
      : 3;

  return Array.from({ length: count }, (_, i) => ({
    user_id: userId,
    workout_session_id: sessionId,
    routine_exercise_id: exercise.id,
    set_number: i + 1,
    target_reps: exercise.target_reps,
    target_weight: fallbackWeight,
    exercise_name: exercise.name,
    actual_reps: null,
    completed: false,
  }));
}

export function buildSetLogRowsForExercises(
  userId: string,
  sessionId: string,
  exercises: ExerciseForSetLogs[]
): SetLogInsertRow[] {
  return exercises.flatMap((exercise) =>
    buildSetLogRowsForExercise(userId, sessionId, exercise)
  );
}
