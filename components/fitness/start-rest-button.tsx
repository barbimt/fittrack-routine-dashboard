"use client";

import { Clock, Pause } from "lucide-react";
import type { Exercise } from "@/lib/mock-data";
import {
  getRestStartButtonState,
  type ExerciseRestTimerStatus,
} from "@/features/routines/restTimerUi";
import { Button } from "./button";

interface StartRestButtonProps {
  exercise: Exercise;
  status?: ExerciseRestTimerStatus;
  onStart: (exercise: Exercise) => void;
}

/** Manual rest start control for an exercise card. */
export function StartRestButton({
  exercise,
  status,
  onStart,
}: StartRestButtonProps) {
  const restTime = exercise.restTime;
  if (!restTime || restTime === "—") return null;

  const state = getRestStartButtonState({
    exerciseId: exercise.id,
    restTime,
    status,
  });

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      className="h-9 gap-1.5"
      disabled={state.disabled}
      aria-pressed={state.isForThisExercise}
      onClick={() => onStart(exercise)}
    >
      {state.isPaused ? (
        <Pause className="h-3.5 w-3.5" aria-hidden />
      ) : (
        <Clock className="h-3.5 w-3.5" aria-hidden />
      )}
      {state.label}
    </Button>
  );
}
