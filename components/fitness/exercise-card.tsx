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

export function ExerciseCard({
  exercise,
  onSetToggle,
  onRepsChange,
  onRepsSave,
}: ExerciseCardProps) {
  const [expanded, setExpanded] = useState(true);
  const progress = getExerciseProgress(exercise);
  const progressPercentage = (progress.completed / progress.total) * 100;

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

          <div className="text-muted-foreground mt-2 flex items-center gap-4 text-sm">
            <span className="flex items-center gap-1">
              <span className="text-foreground font-medium">
                {exercise.targetSets}
              </span>{" "}
              x {exercise.targetReps}
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
