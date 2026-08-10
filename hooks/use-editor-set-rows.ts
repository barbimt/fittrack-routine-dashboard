"use client";

import type { EditorExercise } from "@/features/routines/editorTypes";
import {
  addEditorSetRow,
  exerciseToSetRows,
  removeEditorSetRow,
  setRowsToExercisePatch,
  updateEditorSetRow,
  type EditorSetRow,
} from "@/features/routines/editorSetRows";

type SetRowsPatch = ReturnType<typeof setRowsToExercisePatch>;

/**
 * Shared set-row editing for routine editor rows and the Today edit dialog.
 */
export function useEditorSetRows(
  exercise: EditorExercise,
  onPatch: (patch: SetRowsPatch) => void
) {
  const setRows = exerciseToSetRows(exercise);

  const commit = (rows: EditorSetRow[]) => {
    onPatch(setRowsToExercisePatch(rows));
  };

  return {
    setRows,
    updateSetRow: (index: number, patch: Partial<EditorSetRow>) => {
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
