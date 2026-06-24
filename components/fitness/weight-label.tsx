import { Weight } from "lucide-react";
import { cn } from "@/lib/utils";

interface WeightLabelProps {
  weight: string;
  className?: string;
  iconClassName?: string;
}

/** Dumbbell icon + load text — shared in exercise header and set rows. */
export function WeightLabel({
  weight,
  className,
  iconClassName,
}: WeightLabelProps) {
  return (
    <span className={cn("inline-flex items-center gap-1", className)}>
      <Weight
        className={cn("h-3.5 w-3.5 shrink-0", iconClassName)}
        aria-hidden
      />
      {weight}
    </span>
  );
}

interface SetTargetLabelProps {
  targetReps: number;
  targetWeight?: string | null;
  className?: string;
}

/** Target reps with optional weight for a single set row. */
export function SetTargetLabel({
  targetReps,
  targetWeight,
  className,
}: SetTargetLabelProps) {
  return (
    <span
      className={cn(
        "inline-flex min-w-0 flex-wrap items-center gap-x-1 gap-y-0 text-sm lg:flex-nowrap",
        className
      )}
    >
      <span className="shrink-0">Target: {targetReps}</span>
      {targetWeight ? (
        <>
          <span className="text-muted-foreground shrink-0">·</span>
          <WeightLabel
            weight={targetWeight}
            className="min-w-0"
            iconClassName="text-muted-foreground"
          />
        </>
      ) : null}
    </span>
  );
}

interface PrescriptionBlockLineProps {
  sets: number;
  reps: number | string;
  weight?: string | null;
}

/** One prescription block in the exercise card header, e.g. `1 × 12 · 15kg`. */
export function PrescriptionBlockLine({
  sets,
  reps,
  weight,
}: PrescriptionBlockLineProps) {
  return (
    <span className="text-foreground/90 flex items-center gap-1 font-medium">
      {sets} × {reps}
      {weight ? (
        <>
          <span className="text-muted-foreground">·</span>
          <WeightLabel weight={weight} iconClassName="text-muted-foreground" />
        </>
      ) : null}
    </span>
  );
}
