import type { Exercise } from "@/lib/mock-data";
import type { EditorExercise } from "./editorTypes";

export function exerciseToEditorDraft(exercise: Exercise): EditorExercise {
  const weight =
    exercise.weight && exercise.weight !== "—" ? exercise.weight : null;
  const restTime =
    exercise.restTime && exercise.restTime !== "—" ? exercise.restTime : null;
  const targetReps =
    typeof exercise.targetReps === "number"
      ? String(exercise.targetReps)
      : exercise.targetReps;

  return {
    id: exercise.id,
    name: exercise.name,
    muscleGroup: exercise.muscleGroup || null,
    prescription: exercise.prescription ?? null,
    plannedSets: exercise.targetSets > 0 ? exercise.targetSets : null,
    targetReps: targetReps || null,
    weight,
    restTime,
    notes: exercise.notes ?? null,
    sortOrder: 0,
  };
}
