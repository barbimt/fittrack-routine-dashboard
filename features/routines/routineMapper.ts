import type { RoutineWithDays, WorkoutSetLog } from "./types";
import type { TrainingDay, Exercise, ExerciseSet } from "@/lib/mock-data";
import { exercisePlannedSets } from "./exercisePlan";
import { muscleGroupLabel, toMuscleGroup } from "./muscleGroups";
import {
  formatReps,
  formatWeightRange,
  setsToPrescription,
  type PlannedSet,
} from "./sets";
import type { RoutineExercise } from "./types";

/** Nested select used wherever a routine tree is loaded. */
export const ROUTINE_TREE_SELECT =
  "*, routine_days(*, routine_exercises(*, routine_exercise_sets(*)))";

function toNumberOrNull(value: unknown): number | null {
  if (value === null || value === undefined) return null;
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

function generateSets(exerciseId: string, planned: PlannedSet[]): ExerciseSet[] {
  return planned.map((set, index) => ({
    id: `${exerciseId}-set-${index + 1}`,
    setNumber: index + 1,
    setType: set.setType,
    targetReps: set.repsMin ?? set.repsMax ?? 0,
    targetRepsMax: set.repsMax,
    targetWeightKg: set.weightKg,
    actualReps: null,
    actualWeightKg: null,
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

        // Planned targets always come from the current routine plan.
        // Logs only carry session progress (completed / actual values) so
        // editor changes show up immediately on Today.
        return {
          ...set,
          id: log.id,
          completed: log.completed,
          actualReps: log.actual_reps,
          actualWeightKg: toNumberOrNull(log.actual_weight_kg),
        };
      }),
    })),
  };
}

export function mapRoutineExerciseToTrainingExercise(
  ex: RoutineExercise,
  dayFocus: string
): Exercise {
  const planned = exercisePlannedSets(ex);
  const repsValues = [
    ...new Set(planned.map((set) => formatReps(set.repsMin, set.repsMax))),
  ];
  const muscleSlug = toMuscleGroup(ex.muscle_group);

  return {
    id: ex.id,
    name: ex.name,
    muscleGroup: muscleGroupLabel(muscleSlug) ?? dayFocus,
    muscleSlug,
    secondaryMuscles: (ex.muscle_groups_secondary ?? []).flatMap((value) => {
      const slug = toMuscleGroup(value);
      return slug ? [slug] : [];
    }),
    targetSets: planned.length,
    targetReps:
      repsValues.length === 1 && repsValues[0]
        ? repsValues[0]
        : (repsValues[repsValues.length - 1] ?? ""),
    prescription: setsToPrescription(planned),
    weight: formatWeightRange(planned) ?? "—",
    restTime: ex.rest_time ?? "—",
    notes: ex.notes ?? undefined,
    sets: generateSets(ex.id, planned),
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
      const focus = day.focus ?? day.name;
      return {
        id: day.id,
        dayName: day.original_name ?? day.name,
        focus,
        exercises: [...day.routine_exercises]
          .sort((a, b) => a.sort_order - b.sort_order)
          .map((ex) => mapRoutineExerciseToTrainingExercise(ex, focus)),
      };
    });
}
