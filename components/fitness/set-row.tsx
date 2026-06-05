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
  readOnly?: boolean;
}

export function SetRow({
  set,
  onToggle,
  onRepsChange,
  onRepsSave,
  readOnly = false,
}: SetRowProps) {
  const [localValue, setLocalValue] = useState(
    set.actualReps != null ? String(set.actualReps) : ""
  );

  const saveTimer = useRef<ReturnType<typeof setTimeout> | undefined>(
    undefined
  );
  const isFocused = useRef(false);

  useEffect(() => () => clearTimeout(saveTimer.current), []);

  useEffect(() => {
    if (isFocused.current) return;
    setLocalValue(set.actualReps != null ? String(set.actualReps) : "");
  }, [set.actualReps, set.completed]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    setLocalValue(raw);
    if (raw === "" && set.completed) {
      onToggle?.(set.id);
    }
    const val = parseInt(raw, 10);
    if (!Number.isNaN(val) && val >= 0) {
      onRepsChange?.(set.id, val);
      if (val >= 1 && !set.completed) {
        onToggle?.(set.id);
      }
      if (val === 0 && set.completed) {
        onToggle?.(set.id);
      }
      clearTimeout(saveTimer.current);
      saveTimer.current = setTimeout(() => onRepsSave?.(set.id, val), 400);
    }
  };

  const handleBlur = () => {
    isFocused.current = false;
    clearTimeout(saveTimer.current);
    const val = parseInt(localValue, 10);
    if (!Number.isNaN(val) && val >= 0) {
      onRepsSave?.(set.id, val);
    }
  };

  const handleFocus = () => {
    isFocused.current = true;
  };

  const editable = !readOnly && Boolean(onRepsChange ?? onRepsSave);

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
        disabled={readOnly}
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
          onFocus={handleFocus}
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
