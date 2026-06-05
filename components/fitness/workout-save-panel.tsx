import { cn } from "@/lib/utils";
import type { SessionSavedNotice } from "@/features/routines/types";
import { Button } from "./button";
import { CheckCircle2, Info, RotateCcw } from "lucide-react";

export type { SessionSavedNotice };

export interface WorkoutSavePanelCopy {
  title: string;
  description: string;
  variant: "success" | "info";
}

export function getWorkoutSavePanelCopy({
  isSessionSaved,
  sessionSavedNotice,
  isDayComplete,
  completedSets,
  totalSets,
}: {
  isSessionSaved: boolean;
  sessionSavedNotice: SessionSavedNotice;
  isDayComplete: boolean;
  completedSets: number;
  totalSets: number;
}): WorkoutSavePanelCopy {
  if (isSessionSaved) {
    if (sessionSavedNotice === "updated") {
      return {
        variant: "success",
        title: "Workout updated",
        description:
          "Your changes are stored. Edit again if needed, or reset to start fresh.",
      };
    }
    return {
      variant: "success",
      title: "Workout saved for today",
      description:
        "Your progress is stored. Edit to adjust entries, or reset to start fresh.",
    };
  }

  if (isDayComplete) {
    return {
      variant: "success",
      title: "All sets complete",
      description:
        "Save today’s session so your data is ready for progress dashboards.",
    };
  }

  if (completedSets === 0) {
    return {
      variant: "info",
      title: "Routine not fully complete",
      description: "Complete at least one set to save today’s session.",
    };
  }

  return {
    variant: "info",
    title: "Routine not fully complete",
    description: `You’ve completed ${completedSets} of ${totalSets} sets. You can save partial progress.`,
  };
}

export interface WorkoutSavePanelProps {
  isSessionSaved: boolean;
  sessionSavedNotice: SessionSavedNotice;
  isDayComplete: boolean;
  completedSets: number;
  totalSets: number;
  canSaveWorkout: boolean;
  isPending: boolean;
  isSaving: boolean;
  isReopening: boolean;
  isResetting: boolean;
  onSave: () => void;
  onEdit: () => void;
  onResetDay: () => void;
}

export function WorkoutSavePanel({
  isSessionSaved,
  sessionSavedNotice,
  isDayComplete,
  completedSets,
  totalSets,
  canSaveWorkout,
  isPending,
  isSaving,
  isReopening,
  isResetting,
  onSave,
  onEdit,
  onResetDay,
}: WorkoutSavePanelProps) {
  const { title, description, variant } = getWorkoutSavePanelCopy({
    isSessionSaved,
    sessionSavedNotice,
    isDayComplete,
    completedSets,
    totalSets,
  });

  const showSuccessStyle = isSessionSaved || isDayComplete;

  return (
    <section
      className={cn(
        "mt-6 flex flex-col gap-3 rounded-2xl border p-4 sm:flex-row sm:items-center sm:justify-between",
        showSuccessStyle
          ? "bg-success/10 border-success/20"
          : "bg-accent/40 border-border"
      )}
      aria-label="Save workout"
    >
      <div className="flex items-start gap-3">
        {variant === "success" || showSuccessStyle ? (
          <CheckCircle2
            className="text-success mt-0.5 h-5 w-5 shrink-0"
            aria-hidden
          />
        ) : (
          <Info
            className="text-muted-foreground mt-0.5 h-5 w-5 shrink-0"
            aria-hidden
          />
        )}
        <div>
          <p className="text-foreground font-medium">{title}</p>
          <p className="text-muted-foreground text-sm">{description}</p>
        </div>
      </div>
      {!isSessionSaved ? (
        <Button
          type="button"
          size="sm"
          className="shrink-0"
          disabled={isSaving || isPending || !canSaveWorkout}
          onClick={onSave}
        >
          {isSaving ? "Saving…" : "Save workout"}
        </Button>
      ) : (
        <div className="flex w-full shrink-0 flex-col gap-2 sm:w-auto sm:flex-row">
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="shrink-0"
            disabled={isReopening || isResetting || isPending}
            onClick={onEdit}
          >
            {isReopening ? "Opening…" : "Edit workout"}
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="text-destructive hover:text-destructive shrink-0"
            disabled={isReopening || isResetting || isPending}
            onMouseDown={(e) => e.preventDefault()}
            onClick={onResetDay}
          >
            <RotateCcw className="mr-2 h-4 w-4" aria-hidden />
            {isResetting ? "Resetting…" : "Reset day"}
          </Button>
        </div>
      )}
    </section>
  );
}
