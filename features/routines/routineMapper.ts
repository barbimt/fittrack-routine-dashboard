import type { RoutineWithDays, WorkoutSetLog } from "./types";
import type { TrainingDay, Exercise, ExerciseSet } from "@/lib/mock-data";
import {
  expandPrescriptionToSets,
  parsePrescription,
} from "@/features/routine-import/utils/parsePrescription";
import type { RoutineExercise } from "./types";

function parseRepsToNumber(reps: string | null): number {
  if (!reps) return 0;
  const n = parseInt(reps, 10);
  return Number.isFinite(n) && n > 0 ? n : 0;
}

function generateSets(
  exerciseId: string,
  prescription: string,
  plannedSets: number | null,
  targetReps: string | null,
  fallbackWeight: string | null
): ExerciseSet[] {
  const expanded = expandPrescriptionToSets(prescription, fallbackWeight);

  if (expanded.length > 0) {
    return expanded.map((target) => ({
      id: `${exerciseId}-set-${target.setNumber}`,
      setNumber: target.setNumber,
      targetReps: target.targetReps,
      targetWeight: target.targetWeight,
      actualReps: null,
      completed: false,
    }));
  }

  const count = plannedSets && plannedSets > 0 ? plannedSets : 3;
  const repsNum = parseRepsToNumber(targetReps);
  const weight =
    fallbackWeight && fallbackWeight !== "—" ? fallbackWeight : null;

  return Array.from({ length: count }, (_, i) => ({
    id: `${exerciseId}-set-${i + 1}`,
    setNumber: i + 1,
    targetReps: repsNum,
    targetWeight: weight,
    actualReps: null,
    completed: false,
  }));
}

export function mergeSetLogsIntoDay(
  day: TrainingDay,
  setLogs: WorkoutSetLog[]
): TrainingDay {
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

        // Planned targets always come from the current routine prescription.
        // Logs only carry session progress (completed / actual reps) so editor
        // weight changes show up immediately on Today.
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

export function mapRoutineExerciseToTrainingExercise(
  ex: RoutineExercise,
  dayFocus: string
): Exercise {
  const weight = ex.weight ?? "—";
  const parsed = parsePrescription(ex.prescription, weight);

  return {
    id: ex.id,
    name: ex.name,
    muscleGroup: ex.muscle_group ?? dayFocus,
    targetSets: parsed.plannedSets ?? ex.planned_sets ?? 0,
    targetReps: parsed.targetReps ?? ex.target_reps ?? ex.prescription,
    prescription: ex.prescription,
    weight,
    restTime: ex.rest_time ?? "—",
    notes: ex.notes ?? undefined,
    sets: generateSets(
      ex.id,
      ex.prescription,
      parsed.plannedSets ?? ex.planned_sets,
      parsed.targetReps ?? ex.target_reps,
      weight !== "—" ? weight : null
    ),
  };
}

export function buildTrainingDayFromSession(
  day: Pick<TrainingDay, "id" | "dayName" | "focus">,
  exercises: RoutineExercise[],
  setLogs: WorkoutSetLog[]
): TrainingDay {
  const mappedDay: TrainingDay = {
    ...day,
    exercises: [...exercises]
      .sort((a, b) => a.sort_order - b.sort_order)
      .map((exercise) =>
        mapRoutineExerciseToTrainingExercise(exercise, day.focus)
      ),
  };

  return mergeSetLogsIntoDay(mappedDay, setLogs);
}

export function appendExerciseToDay(
  day: TrainingDay,
  exercise: RoutineExercise,
  setLogs: WorkoutSetLog[]
): TrainingDay {
  const nextExercise = mapRoutineExerciseToTrainingExercise(
    exercise,
    day.focus
  );
  const mergedExercise = mergeSetLogsIntoDay(
    { ...day, exercises: [nextExercise] },
    setLogs
  ).exercises[0];

  return {
    ...day,
    exercises: [...day.exercises, mergedExercise],
  };
}

export function replaceExerciseInDay(
  day: TrainingDay,
  exercise: RoutineExercise,
  setLogs: WorkoutSetLog[]
): TrainingDay {
  const nextExercise = mapRoutineExerciseToTrainingExercise(
    exercise,
    day.focus
  );
  const mergedExercise = mergeSetLogsIntoDay(
    { ...day, exercises: [nextExercise] },
    setLogs
  ).exercises[0];

  return {
    ...day,
    exercises: day.exercises.map((ex) =>
      ex.id === exercise.id ? mergedExercise : ex
    ),
  };
}

export function mapRoutineToTrainingDays(
  routine: RoutineWithDays
): TrainingDay[] {
  return [...routine.routine_days]
    .sort((a, b) => a.sort_order - b.sort_order)
    .map((day) => {
      const exercises: Exercise[] = [...day.routine_exercises]
        .sort((a, b) => a.sort_order - b.sort_order)
        .map((ex) => {
          const weight = ex.weight ?? "—";
          const parsed = parsePrescription(ex.prescription, weight);

          return {
            id: ex.id,
            name: ex.name,
            muscleGroup: ex.muscle_group ?? day.focus ?? day.name,
            targetSets: parsed.plannedSets ?? ex.planned_sets ?? 0,
            targetReps: parsed.targetReps ?? ex.target_reps ?? ex.prescription,
            prescription: ex.prescription,
            weight,
            restTime: ex.rest_time ?? "—",
            notes: ex.notes ?? undefined,
            sets: generateSets(
              ex.id,
              ex.prescription,
              parsed.plannedSets ?? ex.planned_sets,
              parsed.targetReps ?? ex.target_reps,
              weight !== "—" ? weight : null
            ),
          };
        });

      return {
        id: day.id,
        dayName: day.original_name ?? day.name,
        focus: day.focus ?? day.name,
        exercises,
      };
    });
}
