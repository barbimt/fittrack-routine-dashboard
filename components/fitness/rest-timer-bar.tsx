"use client";

import { Clock, Pause, Play, X } from "lucide-react";
import { cn } from "@/lib/utils";
import type { RestTimerViewModel } from "@/features/routines/restTimerUi";
import { Button } from "./button";

interface RestTimerBarProps {
  countdownLabel: string;
  isPaused: boolean;
  onPause: () => void;
  onResume: () => void;
  onDismiss: () => void;
}

function RestTimerBar({
  countdownLabel,
  isPaused,
  onPause,
  onResume,
  onDismiss,
}: RestTimerBarProps) {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-label={`Rest ${countdownLabel}${isPaused ? ", paused" : ""}`}
      className={cn(
        "border-border bg-card/95 fixed inset-x-0 bottom-0 z-50 border-t shadow-[0_-8px_24px_rgba(0,0,0,0.06)] backdrop-blur-md",
        "pb-[max(0.75rem,env(safe-area-inset-bottom))]"
      )}
    >
      <div className="mx-auto flex max-w-4xl items-center gap-3 px-4 py-3">
        <div className="bg-primary/10 text-primary flex h-10 w-10 shrink-0 items-center justify-center rounded-full">
          <Clock className="h-4 w-4" aria-hidden />
        </div>

        <div className="min-w-0 flex-1">
          <p className="text-foreground text-base font-semibold tabular-nums">
            Rest · {countdownLabel}
            {isPaused ? (
              <span className="text-muted-foreground ml-2 text-xs font-normal">
                paused
              </span>
            ) : null}
          </p>
        </div>

        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-10 w-10 shrink-0"
          aria-label={isPaused ? "Resume rest" : "Pause rest"}
          onClick={isPaused ? onResume : onPause}
        >
          {isPaused ? (
            <Play className="h-4 w-4" aria-hidden />
          ) : (
            <Pause className="h-4 w-4" aria-hidden />
          )}
        </Button>

        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-10 w-10 shrink-0"
          aria-label="Dismiss rest timer"
          onClick={onDismiss}
        >
          <X className="h-4 w-4" aria-hidden />
        </Button>
      </div>
    </div>
  );
}

export function WorkoutRestTimerBar({ timer }: { timer: RestTimerViewModel }) {
  if (!timer.active) return null;

  return (
    <RestTimerBar
      countdownLabel={timer.countdownLabel}
      isPaused={timer.isPaused}
      onPause={timer.pause}
      onResume={timer.resume}
      onDismiss={timer.clear}
    />
  );
}
