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

export type WorkoutSavePanelProps =
  | {
      status: "saved";
      sessionSavedNotice: SessionSavedNotice;
      busy: "idle" | "pending" | "reopening" | "resetting";
      onEdit: () => void;
      onResetDay: () => void;
    }
  | {
      status: "unsaved";
      progress: {
        completedSets: number;
        totalSets: number;
        dayComplete: boolean;
        canSave: boolean;
      };
      busy: "idle" | "pending" | "saving";
      onSave: () => void;
    };

export function WorkoutSavePanel(props: WorkoutSavePanelProps) {
  const isSessionSaved = props.status === "saved";
  const { title, description, variant } = getWorkoutSavePanelCopy({
    isSessionSaved,
    sessionSavedNotice:
      props.status === "saved" ? props.sessionSavedNotice : "first",
    isDayComplete:
      props.status === "unsaved" ? props.progress.dayComplete : false,
    completedSets:
      props.status === "unsaved" ? props.progress.completedSets : 0,
    totalSets: props.status === "unsaved" ? props.progress.totalSets : 0,
  });

  const showSuccessStyle =
    isSessionSaved ||
    (props.status === "unsaved" && props.progress.dayComplete);
  const actionsDisabled = props.busy !== "idle";

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
      {props.status === "unsaved" ? (
        <Button
          type="button"
          size="sm"
          className="shrink-0"
          disabled={actionsDisabled || !props.progress.canSave}
          onClick={props.onSave}
        >
          {props.busy === "saving" ? "Saving…" : "Save workout"}
        </Button>
      ) : (
        <div className="flex w-full shrink-0 flex-col gap-2 sm:w-auto sm:flex-row">
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="shrink-0"
            disabled={actionsDisabled}
            onClick={props.onEdit}
          >
            {props.busy === "reopening" ? "Opening…" : "Edit workout"}
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="text-destructive hover:text-destructive shrink-0"
            disabled={actionsDisabled}
            onMouseDown={(e) => e.preventDefault()}
            onClick={props.onResetDay}
          >
            <RotateCcw className="mr-2 h-4 w-4" aria-hidden />
            {props.busy === "resetting" ? "Resetting…" : "Reset day"}
          </Button>
        </div>
      )}
    </section>
  );
}
