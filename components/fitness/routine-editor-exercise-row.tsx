"use client";

import { Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { EditorExercise } from "@/features/routines/editorTypes";
import {
  editorPatchFromPrescription,
  editorPatchFromSimpleFields,
  getPrescriptionEditorUiState,
} from "@/features/routines/editorPrescription";
import { getPrescriptionBlockSummaries } from "@/features/routine-import/utils/parsePrescription";
import { PrescriptionBlockLine } from "./weight-label";
import { Button } from "./button";
import { DragHandle, useSortableRow } from "./sortable-row";
import {
  EditorField,
  EditorNumberField,
  EditorPlainTextField,
  EditorReadOnlyField,
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

  const prescriptionPreview = exercise.prescription
    ? getPrescriptionBlockSummaries(exercise.prescription, exercise.weight)
    : [];
  const prescriptionUi = getPrescriptionEditorUiState(exercise.prescription);

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

        <EditorTextField
          id={`${exercise.id}-prescription`}
          label="Prescription (SETS x REPS)"
          value={exercise.prescription}
          placeholder="1x12 15kg-3x12 20kg"
          hint="Same format as Excel import. Use for variable reps or weight per set."
          onValueChange={(prescription) =>
            onChange(
              editorPatchFromPrescription(prescription ?? "", exercise.weight)
            )
          }
          className="md:col-span-6"
        />

        {prescriptionPreview.length > 0 ? (
          <div className="border-border/60 bg-background/60 flex flex-col gap-1 rounded-lg border px-3 py-2 md:col-span-6">
            <p className="text-muted-foreground text-xs font-medium">Preview</p>
            {prescriptionPreview.map((block) => (
              <PrescriptionBlockLine
                key={`${block.sets}-${block.reps}-${block.weight ?? ""}`}
                sets={block.sets}
                reps={block.reps}
                weight={block.weight}
              />
            ))}
          </div>
        ) : null}

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:col-span-6 lg:grid-cols-4">
          <EditorNumberField
            id={`${exercise.id}-sets`}
            label="Sets"
            value={exercise.plannedSets}
            disabled={!prescriptionUi.setsRepsEditable}
            hint={prescriptionUi.setsRepsNote}
            onValueChange={(plannedSets) =>
              onChange(
                editorPatchFromSimpleFields(
                  plannedSets,
                  exercise.targetReps,
                  exercise.weight
                )
              )
            }
          />
          <EditorTextField
            id={`${exercise.id}-reps`}
            label="Reps"
            value={exercise.targetReps}
            disabled={!prescriptionUi.setsRepsEditable}
            onValueChange={(targetReps) =>
              onChange(
                editorPatchFromSimpleFields(
                  exercise.plannedSets,
                  targetReps,
                  exercise.weight
                )
              )
            }
          />
          {prescriptionUi.weightMode === "in-prescription" ? (
            <EditorReadOnlyField
              id={`${exercise.id}-weight`}
              label="Weight"
              value={prescriptionUi.weightNote}
              hint="No need to fill — loads are in Prescription above."
            />
          ) : (
            <EditorTextField
              id={`${exercise.id}-weight`}
              label="Weight"
              value={exercise.weight}
              hint={prescriptionUi.weightNote}
              onValueChange={(weight) => onChange({ weight })}
            />
          )}
          <EditorTextField
            id={`${exercise.id}-rest`}
            label="Rest"
            value={exercise.restTime}
            onValueChange={(restTime) => onChange({ restTime })}
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
        className="text-muted-foreground hover:text-destructive mt-5 h-11 w-11"
        aria-label={`Remove ${exercise.name}`}
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  );
}
