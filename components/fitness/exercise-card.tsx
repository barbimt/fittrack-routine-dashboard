"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import type { Exercise } from "@/lib/mock-data";
import { getExerciseProgress } from "@/lib/mock-data";
import { SetRow } from "./set-row";
import { Badge } from "./badge";
import { ChevronDown, Clock, Weight, Info } from "lucide-react";

interface ExerciseCardProps {
  exercise: Exercise;
  onSetToggle?: (setId: string) => void;
  onRepsChange?: (setId: string, reps: number) => void;
  onRepsSave?: (setId: string, reps: number) => void;
}

export function ExerciseCard({ exercise, onSetToggle, onRepsChange, onRepsSave }: ExerciseCardProps) {
  const [expanded, setExpanded] = useState(true);
  const progress = getExerciseProgress(exercise);
  const progressPercentage = (progress.completed / progress.total) * 100;

  return (
    <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
      {/* Header */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-start justify-between p-4 text-left hover:bg-muted/30 transition-colors"
        aria-expanded={expanded}
        aria-controls={`exercise-${exercise.id}-content`}
      >
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <h3 className="text-base font-semibold text-card-foreground">{exercise.name}</h3>
            <Badge variant="muscle" className="text-xs">
              {exercise.muscleGroup}
            </Badge>
          </div>

          <div className="flex items-center gap-4 text-sm text-muted-foreground mt-2">
            <span className="flex items-center gap-1">
              <span className="font-medium text-foreground">{exercise.targetSets}</span> x{" "}
              {exercise.targetReps}
            </span>
            <span className="flex items-center gap-1">
              <Weight className="h-3.5 w-3.5" />
              {exercise.weight}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" />
              {exercise.restTime}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3 ml-4">
          {/* Progress indicator */}
          <div className="flex items-center gap-2">
            <div className="relative w-10 h-10">
              <svg className="w-10 h-10 -rotate-90">
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
              "h-5 w-5 text-muted-foreground transition-transform",
              expanded && "rotate-180"
            )}
          />
        </div>
      </button>

      {/* Notes */}
      {exercise.notes && expanded && (
        <div className="px-4 pb-2">
          <div className="flex items-start gap-2 p-2.5 rounded-lg bg-accent/50 text-accent-foreground">
            <Info className="h-4 w-4 mt-0.5 shrink-0" />
            <p className="text-sm">{exercise.notes}</p>
          </div>
        </div>
      )}

      {/* Sets */}
      {expanded && (
        <div id={`exercise-${exercise.id}-content`} className="px-4 pb-4 space-y-2">
          {exercise.sets.map((set) => (
            <SetRow
              key={set.id}
              set={set}
              onToggle={onSetToggle}
              onRepsChange={onRepsChange}
              onRepsSave={onRepsSave}
            />
          ))}
        </div>
      )}
    </div>
  );
}
