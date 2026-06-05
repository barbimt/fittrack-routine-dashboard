"use client";

import { useEffect, useRef, useState } from "react";
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

export function SetRow({
  set,
  onToggle,
  onRepsChange,
  onRepsSave,
}: SetRowProps) {
  // Controlled input: initialised from DB value on mount.
  // Because the parent uses key={set.id}, this component remounts whenever
  // the set identity changes (e.g. day switch), which re-runs useState.
  const [localValue, setLocalValue] = useState(
    set.actualReps != null ? String(set.actualReps) : ""
  );

  // Auto-save timer — fires 400ms after last keystroke as a safety net
  // (catches F5 / quick reloads before blur).
  const saveTimer = useRef<ReturnType<typeof setTimeout> | undefined>(
    undefined
  );

  useEffect(() => () => clearTimeout(saveTimer.current), []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    setLocalValue(raw);
    // If the field is cleared, unmark the set.
    if (raw === "" && set.completed) {
      onToggle?.(set.id);
    }
    const val = parseInt(raw, 10);
    if (!Number.isNaN(val) && val >= 0) {
      onRepsChange?.(set.id, val);
      // Auto-complete when a positive rep count is entered.
      if (val >= 1 && !set.completed) {
        onToggle?.(set.id);
      }
      // Auto-uncomplete when reps are cleared (set to 0).
      if (val === 0 && set.completed) {
        onToggle?.(set.id);
      }
      // Debounced save — covers the case where blur never fires.
      clearTimeout(saveTimer.current);
      saveTimer.current = setTimeout(() => onRepsSave?.(set.id, val), 400);
    }
  };

  const handleBlur = () => {
    // Immediate save on blur — cancel the debounce to avoid a double write.
    clearTimeout(saveTimer.current);
    const val = parseInt(localValue, 10);
    if (!Number.isNaN(val) && val >= 0) {
      onRepsSave?.(set.id, val);
    }
  };

  const editable = Boolean(onRepsChange ?? onRepsSave);

  return (
    <div
      className={cn(
        "flex items-center gap-3 rounded-lg px-3 py-2.5 transition-colors",
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
          "min-w-[50px] text-sm font-medium",
          set.completed ? "text-muted-foreground" : "text-foreground"
        )}
      >
        Set {set.setNumber}
      </label>

      <div className="flex flex-1 items-center gap-2">
        <span className="text-muted-foreground text-sm">
          Target: {set.targetReps}
        </span>
      </div>

      <div className="flex items-center gap-2">
        <span className="text-muted-foreground text-xs">Actual:</span>
        <Input
          type="number"
          min={0}
          value={localValue}
          readOnly={!editable}
          onChange={handleChange}
          onBlur={handleBlur}
          className={cn(
            "h-10 w-[4.5rem] text-center text-sm",
            set.completed && "border-success/30 bg-success/10",
            !editable && "cursor-default opacity-90"
          )}
          placeholder="—"
          aria-label={`Actual reps for set ${set.setNumber}`}
        />
      </div>
    </div>
  );
}
