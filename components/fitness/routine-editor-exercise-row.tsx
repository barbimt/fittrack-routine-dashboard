"use client";

import { Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { EditorExercise } from "@/features/routines/editorTypes";
import { useEditorSetRows } from "@/hooks/use-editor-set-rows";
import { Button } from "./button";
import { EditorSetRowsField } from "./editor-set-rows-field";
import { DragHandle, useSortableRow } from "./sortable-row";
import {
  EditorField,
  EditorPlainTextField,
  EditorTextField,
  MuscleSelect,
  RestDurationField,
} from "./routine-editor-fields";

interface RoutineEditorExerciseRowProps {
  exercise: EditorExercise;
  onChange: (patch: Partial<EditorExercise>) => void;
  onDelete: () => void;
}

export function RoutineEditorExerciseRow({
  exercise,
  onChange,
  onDelete,
}: RoutineEditorExerciseRowProps) {
  const { setNodeRef, setActivatorNodeRef, style, isDragging, handleProps } =
    useSortableRow(exercise.id);

  const { setRows, updateSetRow, addSet, removeSet } = useEditorSetRows(
    exercise,
    onChange
  );

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "border-border bg-surface-muted/30 flex items-start gap-2 rounded-xl border p-3 sm:gap-3",
        isDragging && "shadow-lg"
      )}
    >
      <DragHandle
        ref={setActivatorNodeRef}
        label={`Reorder ${exercise.name}`}
        className="mt-6 shrink-0"
        {...handleProps}
      />

      <div className="grid min-w-0 flex-1 grid-cols-1 gap-2 sm:gap-3 md:grid-cols-6">
        <div className="flex min-w-0 items-start gap-1 md:col-span-2">
          <EditorPlainTextField
            id={`${exercise.id}-name`}
            label="Exercise"
            value={exercise.name}
            onValueChange={(name) => onChange({ name })}
            className="min-w-0 flex-1"
          />
          <Button
            variant="ghost"
            size="icon"
            type="button"
            onClick={onDelete}
            className="text-muted-foreground hover:text-destructive mt-5 h-10 w-10 shrink-0 md:hidden"
            aria-label={`Remove ${exercise.name}`}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>

        <div className="grid grid-cols-2 gap-2 md:contents">
          <EditorField
            id={`${exercise.id}-muscle`}
            label="Muscle"
            className="md:col-span-2"
          >
            <MuscleSelect
              id={`${exercise.id}-muscle`}
              value={exercise.muscleGroup}
              onValueChange={(muscleGroup) => onChange({ muscleGroup })}
            />
          </EditorField>
          <RestDurationField
            id={`${exercise.id}-rest`}
            value={exercise.restTime}
            onValueChange={(restTime) => onChange({ restTime })}
            className="md:col-span-2"
          />
        </div>

        <div className="md:col-span-6">
          <EditorSetRowsField
            idPrefix={exercise.id}
            rows={setRows}
            onUpdateRow={updateSetRow}
            onAddRow={addSet}
            onRemoveRow={removeSet}
          />
        </div>

        <EditorTextField
          id={`${exercise.id}-notes`}
          label="Notes"
          value={exercise.notes}
          onValueChange={(notes) => onChange({ notes })}
          className="md:col-span-6"
        />
      </div>

      <Button
        variant="ghost"
        size="icon"
        type="button"
        onClick={onDelete}
        className="text-muted-foreground hover:text-destructive mt-5 hidden h-11 w-11 shrink-0 md:inline-flex"
        aria-label={`Remove ${exercise.name}`}
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  );
}
