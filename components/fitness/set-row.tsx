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
  const [focused, setFocused] = useState(false);

  const saveTimer = useRef<ReturnType<typeof setTimeout> | undefined>(
    undefined
  );
  const isFocused = useRef(false);
  const inputId = `set-${set.id}-reps`;

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
    setFocused(false);
    clearTimeout(saveTimer.current);
    const val = parseInt(localValue, 10);
    if (!Number.isNaN(val) && val >= 0) {
      onRepsSave?.(set.id, val);
    }
  };

  const handleFocus = () => {
    isFocused.current = true;
    setFocused(true);
  };

  const editable = !readOnly && Boolean(onRepsChange ?? onRepsSave);
  const canToggle = !readOnly && Boolean(onToggle);

  const handleRowClick = () => {
    if (!canToggle) return;
    onToggle?.(set.id);
  };

  const stopRowToggle = (e: React.MouseEvent | React.PointerEvent) => {
    e.stopPropagation();
  };

  return (
    <div
      onClick={handleRowClick}
      className={cn(
        "flex flex-col gap-2.5 rounded-lg px-3 py-3 transition-colors sm:flex-row sm:items-center sm:gap-3 sm:py-2.5",
        set.completed ? "bg-success/10" : "bg-muted/50",
        focused && "ring-primary/40 ring-offset-background ring-2 ring-offset-1",
        canToggle && "cursor-pointer"
      )}
    >
      <div className="flex min-w-0 flex-1 items-center gap-3">
        <Checkbox
          id={`set-${set.id}`}
          checked={set.completed}
          disabled={readOnly}
          onCheckedChange={() => onToggle?.(set.id)}
          onClick={stopRowToggle}
          className="h-5 w-5 rounded-md border-2"
          aria-label={`Mark set ${set.setNumber} as ${set.completed ? "incomplete" : "complete"}`}
        />

        <span
          className={cn(
            "min-w-[3.25rem] text-sm font-medium",
            set.completed ? "text-muted-foreground" : "text-foreground"
          )}
        >
          Set {set.setNumber}
        </span>

        <span className="text-muted-foreground text-sm">
          Target: {set.targetReps}
        </span>
      </div>

      <div
        className="flex items-center gap-2.5 pl-8 sm:pl-0"
        onClick={stopRowToggle}
        onPointerDown={stopRowToggle}
      >
        <label
          htmlFor={inputId}
          className="text-foreground shrink-0 text-sm font-medium sm:sr-only"
        >
          Set {set.setNumber} reps · target {set.targetReps}
        </label>
        <span className="text-muted-foreground hidden text-xs sm:inline">
          Actual:
        </span>
        <Input
          id={inputId}
          type="number"
          inputMode="numeric"
          min={0}
          value={localValue}
          readOnly={!editable}
          onChange={handleChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          className={cn(
            "h-12 w-[5.5rem] shrink-0 text-center text-lg font-semibold tabular-nums md:text-base sm:h-10 sm:w-[4.5rem]",
            set.completed && "border-success/30 bg-success/10",
            !editable && "cursor-default opacity-90"
          )}
          placeholder="—"
          aria-label={`Actual reps for set ${set.setNumber}, target ${set.targetReps}`}
        />
      </div>
    </div>
  );
}
