"use client";

import type {
  EditorExercise,
  EditorSetInput,
} from "@/features/routines/editorTypes";
import {
  addEditorSetRow,
  exerciseToSetRows,
  removeEditorSetRow,
  setRowsToExercisePatch,
  updateEditorSetRow,
  type EditorSetRow,
} from "@/features/routines/editorSetRows";

type SetRowsPatch = ReturnType<typeof setRowsToExercisePatch>;

export function useEditorSetRows(
  exercise: Pick<EditorExercise, "id" | "sets">,
  onPatch: (patch: SetRowsPatch) => void
) {
  const setRows = exerciseToSetRows(exercise);

  const commit = (rows: EditorSetRow[]) => {
    onPatch(setRowsToExercisePatch(rows));
  };

  return {
    setRows,
    updateSetRow: (index: number, patch: Partial<EditorSetInput>) => {
      commit(updateEditorSetRow(setRows, index, patch));
    },
    addSet: () => {
      commit(addEditorSetRow(setRows));
    },
    removeSet: (index: number) => {
      commit(removeEditorSetRow(setRows, index));
    },
  };
}
