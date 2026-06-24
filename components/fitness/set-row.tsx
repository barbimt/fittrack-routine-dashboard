"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import type { ExerciseSet } from "@/lib/mock-data";
import { Checkbox } from "@/components/ui/checkbox";
import { SetTargetLabel } from "./weight-label";
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
        "grid grid-cols-[auto_minmax(0,1fr)_auto] grid-rows-[auto_auto] items-center gap-x-2 gap-y-1 rounded-lg px-3 py-2.5 transition-colors",
        set.completed ? "bg-success/10" : "bg-muted/50",
        canToggle && "cursor-pointer"
      )}
    >
      <Checkbox
        id={`set-${set.id}`}
        checked={set.completed}
        disabled={readOnly}
        onCheckedChange={() => onToggle?.(set.id)}
        onClick={stopRowToggle}
        className="row-span-2 h-5 w-5 self-center rounded-md border-2"
        aria-label={`Mark set ${set.setNumber} as ${set.completed ? "incomplete" : "complete"}`}
      />

      <span
        className={cn(
          "self-center text-sm font-medium",
          set.completed ? "text-muted-foreground" : "text-foreground"
        )}
      >
        Set {set.setNumber}
      </span>

      <div
        className="flex shrink-0 items-center justify-end gap-1.5 self-center"
        onClick={stopRowToggle}
        onPointerDown={stopRowToggle}
      >
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
            "h-9 w-14 min-w-0 shrink-0 text-center text-sm",
            set.completed && "border-success/30 bg-success/10",
            !editable && "cursor-default opacity-90"
          )}
          aria-label={`Actual reps for set ${set.setNumber}`}
        />
      </div>

      <SetTargetLabel
        targetReps={set.targetReps}
        targetWeight={set.targetWeight}
        className="text-muted-foreground col-span-2 col-start-2 row-start-2 min-w-0"
      />
    </div>
  );
}
