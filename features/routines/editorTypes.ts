import type { RoutineWithDays } from "./types";
import {
  hasSetRows,
  legacyExercisePlan,
  mergeNotes,
  exercisePlannedSets,
} from "./exercisePlan";
import { toMuscleGroup } from "./muscleGroups";
import type { SetType } from "./sets";
import { plannedToEditorSets } from "./editorSetRows";

/** Prefix for ids created client-side; not a UUID so the server treats them as inserts. */
export const NEW_ID_PREFIX = "new-";

export function createNewId(): string {
  return `${NEW_ID_PREFIX}${crypto.randomUUID()}`;
}

/** One planned set as typed in the editor (raw strings so partial input like `7,` survives). */
export interface EditorSetInput {
  setType: SetType;
  /** `12` or a range like `8-10`. */
  reps: string;
  /** Kilograms; accepts `7,5` or `7.5`. Empty = no load. */
  weightKg: string;
}

export interface EditorExercise {
  id: string;
  name: string;
  /** Primary muscle slug. */
  muscleGroup: string | null;
  secondaryMuscles: string[];
  sets: EditorSetInput[];
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
        .map((ex) => {
          const extraNotes = hasSetRows(ex)
            ? []
            : legacyExercisePlan(ex).extraNotes;
          return {
            id: ex.id,
            name: ex.name,
            muscleGroup: toMuscleGroup(ex.muscle_group),
            secondaryMuscles: (ex.muscle_groups_secondary ?? []).flatMap(
              (value) => {
                const slug = toMuscleGroup(value);
                return slug ? [slug] : [];
              }
            ),
            sets: plannedToEditorSets(exercisePlannedSets(ex)),
            restTime: ex.rest_time,
            notes: mergeNotes(ex.notes, extraNotes),
            sortOrder: ex.sort_order,
          };
        }),
    }));

  return { id: routine.id, name: routine.name, days };
}
