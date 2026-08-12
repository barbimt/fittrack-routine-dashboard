import { Weight } from "lucide-react";
import { cn } from "@/lib/utils";

interface WeightLabelProps {
  weight: string;
  className?: string;
  iconClassName?: string;
}

/** Dumbbell icon + load text — shared in exercise header and set rows. */
function WeightLabel({ weight, className, iconClassName }: WeightLabelProps) {
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

/** Compact target: `12 · 40kg` (no “Target:” label — keeps mobile rows short). */
export function SetTargetLabel({
  targetReps,
  targetWeight,
  className,
}: SetTargetLabelProps) {
  const weight = targetWeight && targetWeight !== "—" ? targetWeight : null;

  return (
    <span
      className={cn(
        "inline-flex min-w-0 flex-wrap items-center gap-x-1 gap-y-0 text-sm",
        className
      )}
    >
      <span className="sr-only">Target: </span>
      <span className="shrink-0 tabular-nums">{targetReps}</span>
      {weight ? (
        <>
          <span className="text-muted-foreground shrink-0">·</span>
          <WeightLabel
            weight={weight}
            className="min-w-0"
            iconClassName="text-muted-foreground"
          />
        </>
      ) : null}
    </span>
  );
}
