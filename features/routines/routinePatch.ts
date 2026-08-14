import { isUuid } from "@/lib/uuid";
import type { EditorDay } from "./editorTypes";

export interface RoutineDayUpsert {
  id: string;
  name: string;
  focus: string | null;
  originalName: string | null;
  sortOrder: number;
}

export interface RoutineExerciseUpsert {
  id: string;
  dayId: string;
  name: string;
  muscleGroup: string | null;
  prescription: string | null;
  plannedSets: number | null;
  targetReps: string | null;
  weight: string | null;
  restTime: string | null;
  notes: string | null;
  sortOrder: number;
}

export interface RoutineEditPatch {
  routineId: string;
  upsertDays: RoutineDayUpsert[];
  deleteDayIds: string[];
  upsertExercises: RoutineExerciseUpsert[];
  deleteExerciseIds: string[];
}

export function isEmptyPatch(patch: RoutineEditPatch): boolean {
  return (
    patch.upsertDays.length === 0 &&
    patch.deleteDayIds.length === 0 &&
    patch.upsertExercises.length === 0 &&
    patch.deleteExerciseIds.length === 0
  );
}

/**
 * Diff the current editor state against the last-saved baseline and return only
 * the rows that need to be written. Position in the array is the effective
 * `sortOrder`, so reordering is detected without relying on the stored field.
 */
export function computeRoutinePatch(
  routineId: string,
  baseline: EditorDay[],
  current: EditorDay[]
): RoutineEditPatch {
  const baseDayById = new Map<string, { day: EditorDay; index: number }>();
  baseline.forEach((day, index) => {
    baseDayById.set(day.id, { day, index });
  });

  const baseExerciseById = new Map<
    string,
    { exercise: EditorDay["exercises"][number]; dayId: string; index: number }
  >();
  baseline.forEach((day) => {
    day.exercises.forEach((exercise, index) => {
      baseExerciseById.set(exercise.id, { exercise, dayId: day.id, index });
    });
  });

  const upsertDays: RoutineDayUpsert[] = [];
  const upsertExercises: RoutineExerciseUpsert[] = [];

  current.forEach((day, dayIndex) => {
    const base = isUuid(day.id) ? baseDayById.get(day.id) : undefined;
    const dayChanged =
      !base ||
      base.index !== dayIndex ||
      base.day.name !== day.name ||
      base.day.focus !== day.focus ||
      base.day.originalName !== day.originalName;

    if (dayChanged) {
      upsertDays.push({
        id: day.id,
        name: day.name,
        focus: day.focus,
        originalName: day.originalName,
        sortOrder: dayIndex,
      });
    }

    day.exercises.forEach((exercise, exerciseIndex) => {
      const baseExercise = isUuid(exercise.id)
        ? baseExerciseById.get(exercise.id)
        : undefined;

      const exerciseChanged =
        !baseExercise ||
        baseExercise.dayId !== day.id ||
        baseExercise.index !== exerciseIndex ||
        baseExercise.exercise.name !== exercise.name ||
        baseExercise.exercise.muscleGroup !== exercise.muscleGroup ||
        baseExercise.exercise.prescription !== exercise.prescription ||
        baseExercise.exercise.plannedSets !== exercise.plannedSets ||
        baseExercise.exercise.targetReps !== exercise.targetReps ||
        baseExercise.exercise.weight !== exercise.weight ||
        baseExercise.exercise.restTime !== exercise.restTime ||
        baseExercise.exercise.notes !== exercise.notes;

      if (exerciseChanged) {
        upsertExercises.push({
          id: exercise.id,
          dayId: day.id,
          name: exercise.name,
          muscleGroup: exercise.muscleGroup,
          prescription: exercise.prescription,
          plannedSets: exercise.plannedSets,
          targetReps: exercise.targetReps,
          weight: exercise.weight,
          restTime: exercise.restTime,
          notes: exercise.notes,
          sortOrder: exerciseIndex,
        });
      }
    });
  });

  const currentDayIds = new Set(
    current.flatMap((d) => (isUuid(d.id) ? [d.id] : []))
  );
  const currentExerciseIds = new Set(
    current.flatMap((d) =>
      d.exercises.flatMap((e) => (isUuid(e.id) ? [e.id] : []))
    )
  );

  const deleteDayIds = baseline.flatMap((d) =>
    isUuid(d.id) && !currentDayIds.has(d.id) ? [d.id] : []
  );

  const deleteExerciseIds = baseline.flatMap((d) =>
    d.exercises.flatMap((e) =>
      isUuid(e.id) && !currentExerciseIds.has(e.id) ? [e.id] : []
    )
  );

  return {
    routineId,
    upsertDays,
    deleteDayIds,
    upsertExercises,
    deleteExerciseIds,
  };
}
