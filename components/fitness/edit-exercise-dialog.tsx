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
import { exerciseToEditorDraft } from "@/features/routines/exerciseDraft";
import type { UpdateExerciseInDayInput } from "@/features/routines/actions/sessionActions";
import { useEditorSetRows } from "@/hooks/use-editor-set-rows";
import { Button } from "./button";
import { EditorSetRowsField } from "./editor-set-rows-field";
import {
  EditorField,
  EditorPlainTextField,
  EditorTextField,
  MuscleSelect,
  RestDurationField,
} from "./routine-editor-fields";

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

  const patchDraft = (patch: Partial<EditorExercise>) => {
    setDraft((prev) => ({ ...prev, ...patch }));
  };

  const { setRows, updateSetRow, addSet, removeSet } = useEditorSetRows(
    draft,
    patchDraft
  );

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
