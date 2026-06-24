"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import type { Exercise } from "@/lib/mock-data";
import { getExerciseProgress } from "@/lib/mock-data";
import { getPrescriptionBlockSummaries } from "@/features/routine-import/utils/parsePrescription";
import { SetRow } from "./set-row";
import { Badge } from "./badge";
import { Button } from "./button";
import { PrescriptionBlockLine, WeightLabel } from "./weight-label";
import { ChevronDown, Clock, Info, RotateCcw } from "lucide-react";

interface ExerciseCardProps {
  exercise: Exercise;
  onSetToggle?: (setId: string) => void;
  onRepsChange?: (setId: string, reps: number) => void;
  onRepsSave?: (setId: string, reps: number) => void;
  onResetExercise?: (exerciseId: string) => void;
  resetDisabled?: boolean;
  setRowRevision?: number;
  readOnly?: boolean;
}

export function ExerciseCard({
  exercise,
  onSetToggle,
  onRepsChange,
  onRepsSave,
  onResetExercise,
  resetDisabled = false,
  setRowRevision = 0,
  readOnly = false,
}: ExerciseCardProps) {
  const [expanded, setExpanded] = useState(true);
  const progress = getExerciseProgress(exercise);
  const progressPercentage = (progress.completed / progress.total) * 100;
  const hasRestTime = exercise.restTime && exercise.restTime !== "—";
  const fallbackWeight = exercise.weight !== "—" ? exercise.weight : null;
  const prescriptionBlocks = exercise.prescription
    ? getPrescriptionBlockSummaries(exercise.prescription, fallbackWeight)
    : [];
  const showBlockLines = prescriptionBlocks.length > 0;

  return (
    <div className="bg-card border-border overflow-hidden rounded-2xl border shadow-sm">
      <button
        onClick={() => setExpanded(!expanded)}
        className="hover:bg-muted/30 flex w-full items-start justify-between p-4 text-left transition-colors"
        aria-expanded={expanded}
        aria-controls={`exercise-${exercise.id}-content`}
      >
        <div className="min-w-0 flex-1">
          <div className="mb-1 flex flex-wrap items-center gap-2">
            <h3 className="text-card-foreground text-base font-semibold">
              {exercise.name}
            </h3>
            <Badge variant="muscle" className="text-xs">
              {exercise.muscleGroup}
            </Badge>
          </div>

          <div className="text-muted-foreground mt-2 flex flex-col gap-1 text-sm">
            {showBlockLines ? (
              prescriptionBlocks.map((block) => (
                <PrescriptionBlockLine
                  key={`${block.sets}-${block.reps}-${block.weight ?? ""}`}
                  sets={block.sets}
                  reps={block.reps}
                  weight={block.weight}
                />
              ))
            ) : (
              <span className="flex items-center gap-4">
                <span className="flex items-center gap-1">
                  <span className="text-foreground font-medium">
                    {exercise.targetSets}
                  </span>{" "}
                  x {exercise.targetReps}
                </span>
                {exercise.weight !== "—" && (
                  <WeightLabel weight={exercise.weight} />
                )}
              </span>
            )}
            {hasRestTime && (
              <span
                className="flex items-center gap-1"
                title="Rest between sets"
              >
                <Clock className="h-3.5 w-3.5" aria-hidden />
                <span>{exercise.restTime} rest</span>
              </span>
            )}
          </div>
        </div>

        <div className="ml-4 flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="relative h-10 w-10">
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
          </div>

          <ChevronDown
            className={cn(
              "text-muted-foreground h-5 w-5 transition-transform",
              expanded && "rotate-180"
            )}
          />
        </div>
      </button>

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
    </div>
  );
}
