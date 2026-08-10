"use client";

import { useState, type ReactNode } from "react";
import { AlertTriangle, CheckCircle2, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  MUSCLE_GROUPS,
} from "@/features/routines/muscleGroups";
import {
  formatRestLabel,
  formatRestTime,
  parseRestTime,
} from "@/features/routines/restTime";
import { Input } from "./input";
import { Button } from "./button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

/** Trim a text value and collapse empty strings to null (DB-friendly). */
export function emptyToNull(value: string): string | null {
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

interface EditorFieldProps {
  id: string;
  label: string;
  className?: string;
  children: ReactNode;
}

/** Label + control wrapper shared by every editor field. */
export function EditorField({
  id,
  label,
  className,
  children,
}: EditorFieldProps) {
  return (
    <div className={cn("min-w-0", className)}>
      <label htmlFor={id} className="text-muted-foreground mb-1 block text-xs">
        {label}
      </label>
      {children}
    </div>
  );
}

interface EditorTextFieldProps {
  id: string;
  label: string;
  value: string | null;
  onValueChange: (value: string | null) => void;
  className?: string;
  placeholder?: string;
  hint?: string;
  disabled?: boolean;
}

/** Nullable single-line text field (empty input → null). */
export function EditorTextField({
  id,
  label,
  value,
  onValueChange,
  className,
  placeholder,
  hint,
  disabled = false,
}: EditorTextFieldProps) {
  return (
    <EditorField id={id} label={label} className={className}>
      <Input
        id={id}
        value={value ?? ""}
        placeholder={placeholder}
        disabled={disabled}
        onChange={(e) => onValueChange(emptyToNull(e.target.value))}
        className="h-9"
      />
      {hint ? (
        <p className="text-muted-foreground mt-1 text-xs">{hint}</p>
      ) : null}
    </EditorField>
  );
}

interface EditorPlainTextFieldProps {
  id: string;
  label: string;
  value: string;
  onValueChange: (value: string) => void;
  className?: string;
}

/** Required single-line text field (keeps raw value, e.g. day/exercise name). */
export function EditorPlainTextField({
  id,
  label,
  value,
  onValueChange,
  className,
}: EditorPlainTextFieldProps) {
  return (
    <EditorField id={id} label={label} className={className}>
      <Input
        id={id}
        value={value}
        onChange={(e) => onValueChange(e.target.value)}
        className="h-9"
      />
    </EditorField>
  );
}

interface EditorNumberFieldProps {
  id: string;
  label: string;
  value: number | null;
  onValueChange: (value: number | null) => void;
  className?: string;
  min?: number;
  disabled?: boolean;
  hint?: string;
}

/** Positive-integer field; non-positive or empty values become null. */
export function EditorNumberField({
  id,
  label,
  value,
  onValueChange,
  className,
  min = 1,
  disabled = false,
  hint,
}: EditorNumberFieldProps) {
  return (
    <EditorField id={id} label={label} className={className}>
      <Input
        id={id}
        type="number"
        min={min}
        value={value ?? ""}
        disabled={disabled}
        onChange={(e) => {
          const parsed = Number.parseInt(e.target.value, 10);
          onValueChange(Number.isFinite(parsed) && parsed > 0 ? parsed : null);
        }}
        className="h-9"
      />
      {hint ? (
        <p className="text-muted-foreground mt-1 text-xs">{hint}</p>
      ) : null}
    </EditorField>
  );
}

interface EditorReadOnlyFieldProps {
  id: string;
  label: string;
  value: string;
  hint?: string;
  className?: string;
}

/** Non-editable field — used when another input owns the value (e.g. weight in prescription). */
export function EditorReadOnlyField({
  id,
  label,
  value,
  hint,
  className,
}: EditorReadOnlyFieldProps) {
  return (
    <EditorField id={id} label={label} className={className}>
      <div
        id={id}
        className="border-input bg-muted/40 text-muted-foreground flex min-h-9 items-center rounded-md border px-3 py-2 text-sm leading-snug"
      >
        {value}
      </div>
      {hint ? (
        <p className="text-muted-foreground mt-1 text-xs">{hint}</p>
      ) : null}
    </EditorField>
  );
}

interface MuscleSelectProps {
  id: string;
  value: string | null;
  onValueChange: (value: string | null) => void;
}

/** Muscle group picker backed by the fixed `MUSCLE_GROUPS` list. */
export function MuscleSelect({ id, value, onValueChange }: MuscleSelectProps) {
  return (
    <Select
      value={value ?? undefined}
      onValueChange={(next) => onValueChange(next)}
    >
      <SelectTrigger id={id} className="h-9 w-full">
        <SelectValue placeholder="Select muscle" />
      </SelectTrigger>
      <SelectContent>
        {MUSCLE_GROUPS.map((muscle) => (
          <SelectItem key={muscle} value={muscle}>
            {muscle}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

interface RestDurationFieldProps {
  id: string;
  value: string | null;
  onValueChange: (value: string | null) => void;
  className?: string;
}

function parseNonNegativeInt(raw: string, max?: number): number {
  if (raw.trim() === "") return 0;
  const parsed = Number.parseInt(raw, 10);
  if (!Number.isFinite(parsed) || parsed < 0) return 0;
  if (max !== undefined) return Math.min(parsed, max);
  return parsed;
}

/** Input that opens a minutes + seconds picker; persisted as `Ns` (e.g. `90s`). */
export function RestDurationField({
  id,
  value,
  onValueChange,
  className,
}: RestDurationFieldProps) {
  const [open, setOpen] = useState(false);
  const parts = parseRestTime(value);
  const label = formatRestLabel(value);

  const commit = (minutes: number, seconds: number) => {
    onValueChange(formatRestTime(minutes, seconds));
  };

  return (
    <EditorField id={id} label="Rest" className={className}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <button
            id={id}
            type="button"
            aria-label="Rest duration"
            className={cn(
              "border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring flex h-9 w-full items-center justify-between rounded-md border px-3 text-left text-sm focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none",
              !label && "text-muted-foreground"
            )}
          >
            <span className="truncate">{label || "Set rest"}</span>
            <ChevronDown className="text-muted-foreground h-4 w-4 shrink-0 opacity-60" />
          </button>
        </PopoverTrigger>
        <PopoverContent align="start" className="w-72 space-y-3 p-3">
          <p className="text-muted-foreground text-xs">
            Choose minutes and seconds.
          </p>
          <div className="grid grid-cols-2 gap-3">
            <div className="min-w-0 space-y-1">
              <label
                htmlFor={`${id}-minutes`}
                className="text-muted-foreground block text-xs"
              >
                Minutes
              </label>
              <Input
                id={`${id}-minutes`}
                type="number"
                inputMode="numeric"
                min={0}
                max={99}
                step={1}
                value={parts.minutes}
                aria-label="Rest minutes"
                onChange={(e) =>
                  commit(parseNonNegativeInt(e.target.value, 99), parts.seconds)
                }
                className="h-9"
              />
            </div>
            <div className="min-w-0 space-y-1">
              <label
                htmlFor={`${id}-seconds`}
                className="text-muted-foreground block text-xs"
              >
                Seconds
              </label>
              <Input
                id={`${id}-seconds`}
                type="number"
                inputMode="numeric"
                min={0}
                max={59}
                step={1}
                value={parts.seconds}
                aria-label="Rest seconds"
                onChange={(e) =>
                  commit(parts.minutes, parseNonNegativeInt(e.target.value, 59))
                }
                className="h-9"
              />
            </div>
          </div>
          <div className="flex justify-between gap-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => {
                commit(0, 0);
                setOpen(false);
              }}
            >
              Clear
            </Button>
            <Button
              type="button"
              size="sm"
              onClick={() => setOpen(false)}
            >
              Done
            </Button>
          </div>
        </PopoverContent>
      </Popover>
    </EditorField>
  );
}

interface StatusBannerProps {
  variant: "error" | "success";
  children: ReactNode;
}

/** Inline error/success banner (no Toaster mounted in this app). */
export function StatusBanner({ variant, children }: StatusBannerProps) {
  const isError = variant === "error";
  const Icon = isError ? AlertTriangle : CheckCircle2;

  return (
    <div
      role={isError ? "alert" : "status"}
      className={cn(
        "flex items-start gap-3 rounded-lg border p-3 text-sm",
        isError
          ? "border-destructive/30 bg-destructive/5 text-destructive"
          : "border-success/30 bg-success/5 text-success"
      )}
    >
      <Icon className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
      <div className="min-w-0 space-y-1">{children}</div>
    </div>
  );
}
