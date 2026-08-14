import type { RoutineWithDays } from "./types";

/** Prefix for ids created client-side; not a UUID so the server treats them as inserts. */
export const NEW_ID_PREFIX = "new-";

export function createNewId(): string {
  return `${NEW_ID_PREFIX}${crypto.randomUUID()}`;
}

export interface EditorExercise {
  id: string;
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

export interface EditorDay {
  id: string;
  name: string;
  focus: string | null;
  originalName: string | null;
  sortOrder: number;
  exercises: EditorExercise[];
}

export interface EditorRoutine {
  id: string;
  name: string;
  days: EditorDay[];
}

export function mapRoutineToEditor(routine: RoutineWithDays): EditorRoutine {
  const days: EditorDay[] = [...routine.routine_days]
    .sort((a, b) => a.sort_order - b.sort_order)
    .map((day) => ({
      id: day.id,
      name: day.original_name ?? day.name,
      focus: day.focus,
      originalName: day.original_name,
      sortOrder: day.sort_order,
      exercises: [...day.routine_exercises]
        .sort((a, b) => a.sort_order - b.sort_order)
        .map((ex) => ({
          id: ex.id,
          name: ex.name,
          muscleGroup: ex.muscle_group,
          prescription: ex.prescription,
          plannedSets: ex.planned_sets,
          targetReps: ex.target_reps,
          weight: ex.weight,
          restTime: ex.rest_time,
          notes: ex.notes,
          sortOrder: ex.sort_order,
        })),
    }));

  return { id: routine.id, name: routine.name, days };
}
