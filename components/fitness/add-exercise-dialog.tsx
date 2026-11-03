"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "./button";
import {
  EditorNumberField,
  EditorPlainTextField,
  EditorTextField,
  MuscleSelect,
} from "./routine-editor-fields";
import { MUSCLE_GROUP_NONE } from "@/features/routines/muscleGroups";
import {
  editorSetsToPlanned,
  validateEditorSets,
} from "@/features/routines/editorSetRows";
import type { AddExerciseToDayInput } from "@/features/routines/actions/sessionActions";

export interface AddExerciseDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  dayName: string;
  isSubmitting: boolean;
  onSubmit: (input: AddExerciseToDayInput) => void;
}

export function AddExerciseDialog({
  open,
  onOpenChange,
  dayName,
  isSubmitting,
  onSubmit,
}: AddExerciseDialogProps) {
  const [name, setName] = useState("");
  const [plannedSets, setPlannedSets] = useState<number | null>(3);
  const [targetReps, setTargetReps] = useState("12");
  const [weight, setWeight] = useState<string | null>(null);
  const [muscleGroup, setMuscleGroup] = useState<string | null>(null);

  const resetForm = () => {
    setName("");
    setPlannedSets(3);
    setTargetReps("12");
    setWeight(null);
    setMuscleGroup(null);
  };

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) {
      resetForm();
    }
    onOpenChange(nextOpen);
  };

  const setInputs = Array.from({ length: plannedSets ?? 0 }, () => ({
    setType: "working" as const,
    reps: targetReps,
    weightKg: weight ?? "",
  }));
  const setIssue = validateEditorSets(setInputs.slice(0, 1))[0];
  const canSubmit = Boolean(name.trim()) && Boolean(plannedSets) && !setIssue;

  const handleSubmit = () => {
    if (!canSubmit) return;

    onSubmit({
      name: name.trim(),
      sets: editorSetsToPlanned(setInputs),
      muscleGroup:
        muscleGroup && muscleGroup !== MUSCLE_GROUP_NONE ? muscleGroup : null,
    });
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Add exercise</DialogTitle>
          <DialogDescription>
            Adds the exercise to {dayName} and today&apos;s active session.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-3">
          <EditorPlainTextField
            id="add-exercise-name"
            label="Exercise name"
            value={name}
            onValueChange={setName}
          />
          <div className="grid grid-cols-2 gap-3">
            <EditorNumberField
              id="add-exercise-sets"
              label="Sets"
              value={plannedSets}
              onValueChange={setPlannedSets}
              min={1}
            />
            <EditorPlainTextField
              id="add-exercise-reps"
              label="Reps (12 or 8-10)"
              value={targetReps}
              onValueChange={setTargetReps}
            />
          </div>
          <EditorTextField
            id="add-exercise-weight"
            label="Weight (kg)"
            value={weight}
            onValueChange={setWeight}
            placeholder="e.g. 10"
            hint="Same weight for every set. You can change single sets later."
          />
          {setIssue ? (
            <p className="text-destructive text-xs" role="alert">
              {setIssue.message.replace(/^Set 1: /, "")}
            </p>
          ) : null}
          <MuscleSelect
            id="add-exercise-muscle"
            value={muscleGroup}
            onValueChange={setMuscleGroup}
          />
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            disabled={isSubmitting}
            onClick={() => handleOpenChange(false)}
          >
            Cancel
          </Button>
          <Button
            type="button"
            disabled={isSubmitting || !canSubmit}
            onClick={handleSubmit}
          >
            {isSubmitting ? "Adding…" : "Add exercise"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export interface AddExerciseButtonProps {
  disabled?: boolean;
  onClick: () => void;
}

export function AddExerciseButton({
  disabled,
  onClick,
}: AddExerciseButtonProps) {
  return (
    <Button
      type="button"
      variant="outline"
      className="w-full"
      disabled={disabled}
      onClick={onClick}
    >
      <Plus className="mr-2 h-4 w-4" aria-hidden />
      Add exercise
    </Button>
  );
}
