import type { RoutineWithDays, WorkoutSetLog } from "./types";
import type { TrainingDay, Exercise, ExerciseSet } from "@/lib/mock-data";

function parseRepsToNumber(reps: string | null): number {
  if (!reps) return 0;
  const n = parseInt(reps, 10);
  return Number.isFinite(n) && n > 0 ? n : 0;
}

function generateSets(
  exerciseId: string,
  plannedSets: number | null,
  targetReps: string | null
): ExerciseSet[] {
  const count = plannedSets && plannedSets > 0 ? plannedSets : 3;
  const repsNum = parseRepsToNumber(targetReps);

  return Array.from({ length: count }, (_, i) => ({
    id: `${exerciseId}-set-${i + 1}`,
    setNumber: i + 1,
    targetReps: repsNum,
    actualReps: null,
    completed: false,
  }));
}

/**
 * Overlays workout_set_logs from a DB session onto a TrainingDay's sets.
 * - Updates ExerciseSet.id to the log's UUID (used for toggle in A2).
 * - Updates completed and actualReps from the log.
 * - Sets without a matching log are left unchanged (completed: false).
 */
export function mergeSetLogsIntoDay(
  day: TrainingDay,
  setLogs: WorkoutSetLog[]
): TrainingDay {
  // Key: routineExerciseId-setNumber → log
  const logMap = new Map(
    setLogs.map((log) => [`${log.routine_exercise_id}-${log.set_number}`, log])
  );

  return {
    ...day,
    exercises: day.exercises.map((exercise) => ({
      ...exercise,
      sets: exercise.sets.map((set) => {
        const log = logMap.get(`${exercise.id}-${set.setNumber}`);
        if (!log) return set;
        return {
          ...set,
          id: log.id,
          completed: log.completed,
          actualReps: log.actual_reps,
        };
      }),
    })),
  };
}

export function mapRoutineToTrainingDays(routine: RoutineWithDays): TrainingDay[] {
  return [...routine.routine_days]
    .sort((a, b) => a.sort_order - b.sort_order)
    .map((day) => {
      const exercises: Exercise[] = [...day.routine_exercises]
        .sort((a, b) => a.sort_order - b.sort_order)
        .map((ex) => ({
          id: ex.id,
          name: ex.name,
          muscleGroup: day.focus ?? day.name,
          targetSets: ex.planned_sets ?? 0,
          targetReps: ex.target_reps ?? ex.prescription,
          weight: ex.weight ?? "—",
          restTime: ex.rest_time ?? "—",
          notes: ex.notes ?? undefined,
          sets: generateSets(ex.id, ex.planned_sets, ex.target_reps),
        }));

      return {
        id: day.id,
        dayName: day.original_name ?? day.name,
        focus: day.focus ?? day.name,
        exercises,
      };
    });
}
