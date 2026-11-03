"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import type { ExerciseSet } from "@/lib/mock-data";
import { kgToInput, parseKg } from "@/features/routines/weight";
import { Checkbox } from "@/components/ui/checkbox";
import { SetTargetLabel } from "./weight-label";
import { Input } from "./input";

interface SetRowProps {
  set: ExerciseSet;
  /** Used when the set has no per-set target (demo data). */
  fallbackWeight?: string | null;
  onToggle?: (setId: string) => void;
  onRepsChange?: (setId: string, reps: number | null) => void;
  onRepsSave?: (setId: string, reps: number | null) => void;
  onWeightChange?: (setId: string, kg: number | null) => void;
  onWeightSave?: (setId: string, kg: number | null) => void;
  readOnly?: boolean;
}

function stopRowToggle(e: React.MouseEvent | React.PointerEvent) {
  e.stopPropagation();
}

function parseRepsValue(raw: string): number | null | "invalid" {
  if (raw.trim() === "") return null;
  const val = Number.parseInt(raw, 10);
  return Number.isNaN(val) || val < 0 ? "invalid" : val;
}

function parseWeightValue(raw: string): number | null | "invalid" {
  if (raw.trim() === "") return null;
  if (!/^\d+(?:[.,]\d*)?$/.test(raw.trim())) return "invalid";
  return parseKg(raw) ?? "invalid";
}

interface LoggedValueInputProps {
  value: number | null | undefined;
  format: (value: number | null | undefined) => string;
  parse: (raw: string) => number | null | "invalid";
  onChange?: (value: number | null) => void;
  onSave?: (value: number | null) => void;
  editable: boolean;
  inputMode: "numeric" | "decimal";
  placeholder?: string;
  ariaLabel: string;
  completed: boolean;
  resetKey: unknown;
}

/** Text input that reports parsed values immediately and saves after a short pause. */
function LoggedValueInput({
  value,
  format,
  parse,
  onChange,
  onSave,
  editable,
  inputMode,
  placeholder,
  ariaLabel,
  completed,
  resetKey,
}: LoggedValueInputProps) {
  const [localValue, setLocalValue] = useState(() => format(value));
  const saveTimer = useRef<ReturnType<typeof setTimeout> | undefined>(
    undefined
  );
  const isFocused = useRef(false);

  useEffect(() => () => clearTimeout(saveTimer.current), []);

  // Don't overwrite the input while the user is typing.
  // react-doctor-disable-next-line react-doctor/no-reset-all-state-on-prop-change
  useEffect(() => {
    if (isFocused.current) return;
    setLocalValue(format(value));
  }, [value, resetKey, format]);

  const scheduleSave = (next: number | null) => {
    clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => onSave?.(next), 400);
  };

  return (
    <Input
      type="text"
      inputMode={inputMode}
      autoComplete="off"
      value={localValue}
      placeholder={placeholder}
      readOnly={!editable}
      onChange={(e) => {
        const raw = e.target.value;
        setLocalValue(raw);
        const parsed = parse(raw);
        if (parsed === "invalid") return;
        onChange?.(parsed);
        scheduleSave(parsed);
      }}
      onFocus={() => {
        isFocused.current = true;
      }}
      onBlur={() => {
        isFocused.current = false;
        clearTimeout(saveTimer.current);
        const parsed = parse(localValue);
        if (parsed !== "invalid") onSave?.(parsed);
      }}
      className={cn(
        "h-9 w-14 min-w-0 shrink-0 px-1 text-center text-base tabular-nums md:text-sm",
        completed && "border-success/30 bg-success/10",
        !editable && "cursor-default opacity-90"
      )}
      aria-label={ariaLabel}
    />
  );
}

const formatReps = (value: number | null | undefined) =>
  value != null ? String(value) : "";

export function SetRow({
  set,
  fallbackWeight,
  onToggle,
  onRepsChange,
  onRepsSave,
  onWeightChange,
  onWeightSave,
  readOnly = false,
}: SetRowProps) {
  const targetWeightKg =
    set.targetWeightKg !== undefined
      ? set.targetWeightKg
      : parseKg(fallbackWeight ?? null);
  const repsEditable = !readOnly && Boolean(onRepsChange ?? onRepsSave);
  const weightEditable = !readOnly && Boolean(onWeightChange ?? onWeightSave);
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
        "flex items-center gap-2 rounded-lg px-3 py-2.5 transition-colors",
        set.completed ? "bg-success/10" : "bg-muted/50",
        set.setType === "warmup" && !set.completed && "bg-muted/30",
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
        targetRepsMax={set.targetRepsMax}
        targetWeightKg={targetWeightKg}
        setType={set.setType}
        className="text-muted-foreground min-w-0 flex-1"
      />

      <div
        className="flex shrink-0 items-center gap-1.5"
        onClick={stopRowToggle}
        onPointerDown={stopRowToggle}
      >
        <LoggedValueInput
          value={set.actualWeightKg}
          format={kgToInput}
          parse={parseWeightValue}
          onChange={(kg) => onWeightChange?.(set.id, kg)}
          onSave={(kg) => onWeightSave?.(set.id, kg)}
          editable={weightEditable}
          inputMode="decimal"
          placeholder="—"
          ariaLabel={`Kg lifted in set ${set.setNumber}`}
          completed={set.completed}
          resetKey={set.completed}
        />
        <LoggedValueInput
          value={set.actualReps}
          format={formatReps}
          parse={parseRepsValue}
          onChange={(reps) => onRepsChange?.(set.id, reps)}
          onSave={(reps) => onRepsSave?.(set.id, reps)}
          editable={repsEditable}
          inputMode="numeric"
          placeholder="—"
          ariaLabel={`Actual reps for set ${set.setNumber}`}
          completed={set.completed}
          resetKey={set.completed}
        />
      </div>
    </div>
  );
}

export function SetRowHeader() {
  return (
    <div
      className="text-muted-foreground flex items-center gap-2 px-3 text-[11px] font-medium tracking-wide uppercase"
      aria-hidden
    >
      <span className="w-5 shrink-0" />
      <span className="w-5 shrink-0 text-center">Set</span>
      <span className="min-w-0 flex-1">Target</span>
      <span className="w-14 shrink-0 text-center">Kg</span>
      <span className="w-14 shrink-0 text-center">Reps</span>
    </div>
  );
}
