"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import type { ExerciseSet } from "@/lib/mock-data";
import { Checkbox } from "@/components/ui/checkbox";
import { SetTargetLabel } from "./weight-label";
import { Input } from "./input";

interface SetRowProps {
  set: ExerciseSet;
  fallbackWeight?: string | null;
  onToggle?: (setId: string) => void;
  onRepsChange?: (setId: string, reps: number | null) => void;
  onRepsSave?: (setId: string, reps: number | null) => void;
  readOnly?: boolean;
}

function stopRowToggle(e: React.MouseEvent | React.PointerEvent) {
  e.stopPropagation();
}

export function SetRow({
  set,
  fallbackWeight,
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

  // Don't overwrite the input while the user is typing.
  // react-doctor-disable-next-line react-doctor/no-reset-all-state-on-prop-change
  useEffect(() => {
    if (isFocused.current) return;
    setLocalValue(set.actualReps != null ? String(set.actualReps) : "");
  }, [set.actualReps, set.completed]);

  const scheduleRepsSave = (reps: number | null) => {
    clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => onRepsSave?.(set.id, reps), 400);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    setLocalValue(raw);

    if (raw.trim() === "") {
      onRepsChange?.(set.id, null);
      scheduleRepsSave(null);
      return;
    }

    const val = parseInt(raw, 10);
    if (!Number.isNaN(val) && val >= 0) {
      onRepsChange?.(set.id, val);
      scheduleRepsSave(val);
    }
  };

  const handleBlur = () => {
    isFocused.current = false;
    clearTimeout(saveTimer.current);
    if (localValue.trim() === "") {
      onRepsSave?.(set.id, null);
      return;
    }
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

  const handleRowActivate = () => {
    if (!canToggle) return;
    onToggle?.(set.id);
  };

  return (
    <div
      role={canToggle ? "button" : undefined}
      tabIndex={canToggle ? 0 : undefined}
      onClick={canToggle ? handleRowActivate : undefined}
      onKeyDown={
        canToggle
          ? (event) => {
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                handleRowActivate();
              }
            }
          : undefined
      }
      className={cn(
        "flex items-center gap-2.5 rounded-lg px-3 py-2.5 transition-colors",
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
        className="h-5 w-5 shrink-0 rounded-md border-2"
        aria-label={`Mark set ${set.setNumber} as ${set.completed ? "incomplete" : "complete"}`}
      />

      <span
        className={cn(
          "w-5 shrink-0 text-center text-sm font-medium tabular-nums",
          set.completed ? "text-muted-foreground" : "text-foreground"
        )}
        aria-label={`Set ${set.setNumber}`}
      >
        {set.setNumber}
      </span>

      <SetTargetLabel
        targetReps={set.targetReps}
        targetWeight={set.targetWeight ?? fallbackWeight}
        className="text-muted-foreground min-w-0 flex-1"
      />

      <div
        className="flex shrink-0 items-center"
        onClick={stopRowToggle}
        onPointerDown={stopRowToggle}
      >
        <Input
          type="number"
          min={0}
          value={localValue}
          readOnly={!editable}
          onChange={handleChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          className={cn(
            "h-9 w-14 min-w-0 shrink-0 text-center text-base tabular-nums md:text-sm",
            set.completed && "border-success/30 bg-success/10",
            !editable && "cursor-default opacity-90"
          )}
          aria-label={`Actual reps for set ${set.setNumber}`}
        />
      </div>
    </div>
  );
}
