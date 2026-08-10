"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { Exercise } from "@/lib/mock-data";
import type { EditorExercise } from "@/features/routines/editorTypes";
import {
  defaultSetRow,
  exerciseToSetRows,
  setRowsToExercisePatch,
  type EditorSetRow,
} from "@/features/routines/editorSetRows";
import type { UpdateExerciseInDayInput } from "@/features/routines/actions/sessionActions";
import { Button } from "./button";
import { EditorSetRowsField } from "./editor-set-rows-field";
import {
  EditorField,
  EditorPlainTextField,
  EditorTextField,
  MuscleSelect,
  RestDurationField,
} from "./routine-editor-fields";

function exerciseToEditorDraft(exercise: Exercise): EditorExercise {
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

export interface EditExerciseDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  exercise: Exercise;
  isSubmitting: boolean;
  onSubmit: (input: UpdateExerciseInDayInput) => void;
}

export function EditExerciseDialog({
  open,
  onOpenChange,
  exercise,
  isSubmitting,
  onSubmit,
}: EditExerciseDialogProps) {
  const [draft, setDraft] = useState<EditorExercise>(() =>
    exerciseToEditorDraft(exercise)
  );

  const setRows = exerciseToSetRows(draft);

  const patchDraft = (patch: Partial<EditorExercise>) => {
    setDraft((prev) => ({ ...prev, ...patch }));
  };

  const commitSetRows = (rows: EditorSetRow[]) => {
    patchDraft(setRowsToExercisePatch(rows));
  };

  const updateSetRow = (index: number, patch: Partial<EditorSetRow>) => {
    commitSetRows(
      setRows.map((row, i) => (i === index ? { ...row, ...patch } : row))
    );
  };

  const addSet = () => {
    commitSetRows([...setRows, defaultSetRow(setRows[setRows.length - 1])]);
  };

  const removeSet = (index: number) => {
    if (setRows.length <= 1) {
      commitSetRows([{ reps: "", weightKg: "" }]);
      return;
    }
    commitSetRows(setRows.filter((_, i) => i !== index));
  };

  const handleSubmit = () => {
    if (!draft.name.trim()) return;

    onSubmit({
      name: draft.name.trim(),
      muscleGroup: draft.muscleGroup,
      prescription: draft.prescription,
      plannedSets: draft.plannedSets,
      targetReps: draft.targetReps,
      weight: draft.weight,
      restTime: draft.restTime,
      notes: draft.notes,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[90vh] max-w-md flex-col gap-0 overflow-hidden p-0">
        <DialogHeader className="border-border shrink-0 border-b px-5 py-3">
          <DialogTitle>Edit exercise</DialogTitle>
          <DialogDescription>
            Updates this exercise in your routine and today&apos;s targets.
          </DialogDescription>
        </DialogHeader>

        <div className="min-h-0 flex-1 space-y-2.5 overflow-y-auto px-5 py-3">
          <EditorPlainTextField
            id={`${exercise.id}-edit-name`}
            label="Exercise"
            value={draft.name}
            onValueChange={(name) => patchDraft({ name })}
          />
          <div className="grid grid-cols-2 gap-2">
            <EditorField id={`${exercise.id}-edit-muscle`} label="Muscle">
              <MuscleSelect
                id={`${exercise.id}-edit-muscle`}
                value={draft.muscleGroup}
                onValueChange={(muscleGroup) => patchDraft({ muscleGroup })}
              />
            </EditorField>
            <RestDurationField
              id={`${exercise.id}-edit-rest`}
              value={draft.restTime}
              onValueChange={(restTime) => patchDraft({ restTime })}
            />
          </div>

          <EditorSetRowsField
            idPrefix={`${exercise.id}-edit`}
            rows={setRows}
            onUpdateRow={updateSetRow}
            onAddRow={addSet}
            onRemoveRow={removeSet}
          />

          <EditorTextField
            id={`${exercise.id}-edit-notes`}
            label="Notes"
            value={draft.notes}
            onValueChange={(notes) => patchDraft({ notes })}
          />
        </div>

        <DialogFooter className="border-border shrink-0 border-t px-5 py-3">
          <Button
            type="button"
            variant="outline"
            disabled={isSubmitting}
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button
            type="button"
            disabled={isSubmitting || !draft.name.trim()}
            onClick={handleSubmit}
          >
            {isSubmitting ? "Saving…" : "Save"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
