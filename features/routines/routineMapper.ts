import type { RoutineWithDays } from "./types";
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
