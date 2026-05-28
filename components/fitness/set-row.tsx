"use client";

import { cn } from "@/lib/utils";
import type { ExerciseSet } from "@/lib/mock-data";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "./input";

interface SetRowProps {
  set: ExerciseSet;
  onToggle?: (setId: string) => void;
  onRepsChange?: (setId: string, reps: number) => void;
  onRepsSave?: (setId: string, reps: number) => void;
}

export function SetRow({ set, onToggle, onRepsChange, onRepsSave }: SetRowProps) {
  return (
    <div
      className={cn(
        "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors",
        set.completed ? "bg-success/10" : "bg-muted/50"
      )}
    >
      <Checkbox
        id={`set-${set.id}`}
        checked={set.completed}
        onCheckedChange={() => onToggle?.(set.id)}
        className="h-5 w-5 rounded-md border-2"
        aria-label={`Mark set ${set.setNumber} as ${set.completed ? "incomplete" : "complete"}`}
      />

      <label
        htmlFor={`set-${set.id}`}
        className={cn(
          "text-sm font-medium min-w-[50px]",
          set.completed ? "text-muted-foreground" : "text-foreground"
        )}
      >
        Set {set.setNumber}
      </label>

      <div className="flex items-center gap-2 flex-1">
        <span className="text-sm text-muted-foreground">Target: {set.targetReps}</span>
      </div>

      <div className="flex items-center gap-2">
        <span className="text-xs text-muted-foreground">Actual:</span>
        <Input
          type="number"
          min={0}
          defaultValue={set.actualReps ?? ""}
          readOnly={!onRepsChange && !onRepsSave}
          onChange={(e) => {
            const val = parseInt(e.target.value, 10);
            if (!Number.isNaN(val)) onRepsChange?.(set.id, val);
          }}
          onBlur={(e) => {
            const val = parseInt(e.target.value, 10);
            if (!Number.isNaN(val)) onRepsSave?.(set.id, val);
          }}
          className={cn(
            "h-10 w-[4.5rem] text-center text-sm",
            set.completed && "border-success/30 bg-success/10",
            !onRepsChange && !onRepsSave && "cursor-default opacity-90"
          )}
          placeholder="—"
          aria-label={`Actual reps for set ${set.setNumber}`}
        />
      </div>
    </div>
  );
}
