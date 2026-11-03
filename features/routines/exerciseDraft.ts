import type { Exercise } from "@/lib/mock-data";
import { plannedToEditorSets } from "./editorSetRows";
import type { EditorExercise } from "./editorTypes";
import { toMuscleGroup } from "./muscleGroups";
import type { PlannedSet } from "./sets";
import { parseKg } from "./weight";

export function exercisePlannedSetsFromView(exercise: Exercise): PlannedSet[] {
  const fallbackKg = parseKg(exercise.weight);
  return exercise.sets.map((set) => ({
    setType: set.setType ?? "working",
    repsMin: set.targetReps > 0 ? set.targetReps : null,
    repsMax: set.targetRepsMax ?? (set.targetReps > 0 ? set.targetReps : null),
    weightKg:
      set.targetWeightKg !== undefined ? set.targetWeightKg : fallbackKg,
  }));
}

export function exerciseToEditorDraft(exercise: Exercise): EditorExercise {
  const restTime =
    exercise.restTime && exercise.restTime !== "—" ? exercise.restTime : null;

  return {
    id: exercise.id,
    name: exercise.name,
    muscleGroup: exercise.muscleSlug ?? toMuscleGroup(exercise.muscleGroup),
    secondaryMuscles: exercise.secondaryMuscles ?? [],
    sets: plannedToEditorSets(exercisePlannedSetsFromView(exercise)),
    restTime,
    notes: exercise.notes ?? null,
    sortOrder: 0,
  };
}
