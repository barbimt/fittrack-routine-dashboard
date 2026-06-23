"use client";

import { Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { EditorExercise } from "@/features/routines/editorTypes";
import { Button } from "./button";
import { DragHandle, useSortableRow } from "./sortable-row";
import {
  EditorField,
  EditorNumberField,
  EditorPlainTextField,
  EditorTextField,
  MuscleSelect,
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

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "border-border bg-surface-muted/30 flex items-start gap-3 rounded-xl border p-3",
        isDragging && "shadow-lg"
      )}
    >
      <DragHandle
        ref={setActivatorNodeRef}
        label={`Reorder ${exercise.name}`}
        className="mt-7"
        {...handleProps}
      />

      <div className="grid flex-1 grid-cols-1 gap-3 md:grid-cols-6">
        <EditorPlainTextField
          id={`${exercise.id}-name`}
          label="Exercise"
          value={exercise.name}
          onValueChange={(name) => onChange({ name })}
          className="md:col-span-2"
        />
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
        <EditorNumberField
          id={`${exercise.id}-sets`}
          label="Sets"
          value={exercise.plannedSets}
          onValueChange={(plannedSets) => onChange({ plannedSets })}
        />
        <EditorTextField
          id={`${exercise.id}-reps`}
          label="Reps"
          value={exercise.targetReps}
          onValueChange={(targetReps) => onChange({ targetReps })}
        />
        <EditorTextField
          id={`${exercise.id}-weight`}
          label="Weight"
          value={exercise.weight}
          onValueChange={(weight) => onChange({ weight })}
        />
        <EditorTextField
          id={`${exercise.id}-rest`}
          label="Rest"
          value={exercise.restTime}
          onValueChange={(restTime) => onChange({ restTime })}
        />
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
        className="text-muted-foreground hover:text-destructive mt-5 h-11 w-11"
        aria-label={`Remove ${exercise.name}`}
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  );
}
