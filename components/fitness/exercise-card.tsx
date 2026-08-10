"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import type { Exercise } from "@/lib/mock-data";
import { getExerciseProgress } from "@/lib/mock-data";
import type { UpdateExerciseInDayInput } from "@/features/routines/actions/sessionActions";
import type { ExerciseRestTimerStatus } from "@/features/routines/restTimerUi";
import { SetRow } from "./set-row";
import { Badge } from "./badge";
import { Button } from "./button";
import { EditExerciseDialog } from "./edit-exercise-dialog";
import { StartRestButton } from "./start-rest-button";
import { ChevronDown, Clock, Info, Pencil, RotateCcw } from "lucide-react";

export type { ExerciseRestTimerStatus };

interface ExerciseCardProps {
  exercise: Exercise;
  onSetToggle?: (setId: string) => void;
  onRepsChange?: (setId: string, reps: number | null) => void;
  onRepsSave?: (setId: string, reps: number | null) => void;
  onResetExercise?: (exerciseId: string) => void;
  onEditExercise?: (
    exerciseId: string,
    input: UpdateExerciseInDayInput
  ) => void | Promise<void>;
  onStartRest?: (exercise: Exercise) => void;
  restTimerStatus?: ExerciseRestTimerStatus;
  resetDisabled?: boolean;
  editDisabled?: boolean;
  isEditing?: boolean;
  setRowRevision?: number;
  readOnly?: boolean;
}

export function ExerciseCard({
  exercise,
  onSetToggle,
  onRepsChange,
  onRepsSave,
  onResetExercise,
  onEditExercise,
  onStartRest,
  restTimerStatus,
  resetDisabled = false,
  editDisabled = false,
  isEditing = false,
  setRowRevision = 0,
  readOnly = false,
}: ExerciseCardProps) {
  const [expanded, setExpanded] = useState(true);
  const [editOpen, setEditOpen] = useState(false);
  const progress = getExerciseProgress(exercise);
  const progressPercentage = (progress.completed / progress.total) * 100;
  const hasRestTime = Boolean(exercise.restTime && exercise.restTime !== "—");
  const canEdit = !readOnly && Boolean(onEditExercise);
  const canStartRest = !readOnly && hasRestTime && Boolean(onStartRest);

  return (
    <div className="bg-card border-border overflow-hidden rounded-2xl border shadow-sm">
      <div className="flex items-center gap-1 p-4">
        <button
          type="button"
          onClick={() => setExpanded(!expanded)}
          className="hover:bg-muted/30 -m-2 flex min-w-0 flex-1 items-center justify-between rounded-xl p-2 text-left transition-colors"
          aria-expanded={expanded}
          aria-controls={`exercise-${exercise.id}-content`}
        >
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-card-foreground text-base font-semibold">
                {exercise.name}
              </h3>
              <Badge variant="muscle" className="text-xs">
                {exercise.muscleGroup}
              </Badge>
            </div>

            {hasRestTime && !canStartRest ? (
              <div
                className="text-muted-foreground mt-1 flex items-center gap-1 text-sm"
                title="Rest between sets"
              >
                <Clock className="h-3.5 w-3.5" aria-hidden />
                <span>{exercise.restTime} rest</span>
              </div>
            ) : null}
          </div>

          <div className="ml-3 flex items-center gap-2">
            <div className="relative h-10 w-10 shrink-0">
              <svg className="h-10 w-10 -rotate-90">
                <circle
                  cx="20"
                  cy="20"
                  r="16"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
                  className="text-muted"
                />
                <circle
                  cx="20"
                  cy="20"
                  r="16"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
                  strokeDasharray={`${progressPercentage} 100`}
                  strokeLinecap="round"
                  className={cn(
                    "transition-all duration-500",
                    progressPercentage === 100 ? "text-success" : "text-primary"
                  )}
                />
              </svg>
              <span className="absolute inset-0 flex items-center justify-center text-xs font-semibold">
                {progress.completed}/{progress.total}
              </span>
            </div>

            <ChevronDown
              className={cn(
                "text-muted-foreground h-5 w-5 shrink-0 transition-transform",
                expanded && "rotate-180"
              )}
            />
          </div>
        </button>

        {canEdit ? (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            disabled={editDisabled || isEditing}
            className="text-muted-foreground hover:text-foreground h-10 w-10 shrink-0"
            aria-label={`Edit ${exercise.name}`}
            onClick={() => setEditOpen(true)}
          >
            <Pencil className="h-4 w-4" aria-hidden />
          </Button>
        ) : null}
      </div>

      {canStartRest && onStartRest ? (
        <div className="px-4 pb-2">
          <StartRestButton
            exercise={exercise}
            status={restTimerStatus}
            onStart={onStartRest}
          />
        </div>
      ) : null}

      {exercise.notes && expanded && (
        <div className="px-4 pb-2">
          <div className="bg-accent/50 text-accent-foreground flex items-start gap-2 rounded-lg p-2.5">
            <Info className="mt-0.5 h-4 w-4 shrink-0" />
            <p className="text-sm">{exercise.notes}</p>
          </div>
        </div>
      )}

      {expanded && (
        <div
          id={`exercise-${exercise.id}-content`}
          className="space-y-2 px-4 pb-4"
        >
          {exercise.sets.map((set) => (
            <SetRow
              key={`${set.id}-${setRowRevision}`}
              set={set}
              fallbackWeight={exercise.weight}
              onToggle={readOnly ? undefined : onSetToggle}
              onRepsChange={readOnly ? undefined : onRepsChange}
              onRepsSave={readOnly ? undefined : onRepsSave}
              readOnly={readOnly}
            />
          ))}
          {onResetExercise && !readOnly && progress.completed > 0 && (
            <div className="flex justify-end pt-1">
              <Button
                variant="ghost"
                size="sm"
                type="button"
                disabled={resetDisabled}
                className="text-muted-foreground h-8 px-2 text-xs"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => onResetExercise(exercise.id)}
              >
                <RotateCcw className="mr-1.5 h-3.5 w-3.5" aria-hidden />
                Reset exercise
              </Button>
            </div>
          )}
        </div>
      )}

      {canEdit && editOpen ? (
        <EditExerciseDialog
          key={`${exercise.id}-${setRowRevision}`}
          open={editOpen}
          onOpenChange={setEditOpen}
          exercise={exercise}
          isSubmitting={isEditing}
          onSubmit={async (input) => {
            await onEditExercise?.(exercise.id, input);
            setEditOpen(false);
          }}
        />
      ) : null}
    </div>
  );
}
