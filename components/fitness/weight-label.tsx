import { cn } from "@/lib/utils";
import { formatReps, type SetType } from "@/features/routines/sets";
import { formatKg } from "@/features/routines/weight";

interface SetTargetLabelProps {
  targetReps: number;
  targetRepsMax?: number | null;
  targetWeightKg?: number | null;
  setType?: SetType;
  className?: string;
}

export function SetTargetLabel({
  targetReps,
  targetRepsMax,
  targetWeightKg,
  setType = "working",
  className,
}: SetTargetLabelProps) {
  const reps = formatReps(
    targetReps > 0 ? targetReps : null,
    targetRepsMax ?? (targetReps > 0 ? targetReps : null)
  );
  const weight = formatKg(targetWeightKg);

  return (
    <span
      className={cn(
        "inline-flex min-w-0 flex-wrap items-center gap-x-1 gap-y-0 text-sm",
        className
      )}
    >
      <span className="sr-only">Target: </span>
      {setType !== "working" ? (
        <span
          className={cn(
            "rounded px-1 text-[10px] font-semibold tracking-wide uppercase",
            setType === "warmup" ? "bg-warning/20 text-foreground" : "bg-primary/10 text-primary"
          )}
        >
          {setType === "warmup" ? "Warm-up" : "Drop"}
        </span>
      ) : null}
      <span className="shrink-0 tabular-nums">
        {reps ?? "—"}
        <span className="sr-only"> reps</span>
      </span>
      {weight ? (
        <>
          <span className="text-muted-foreground shrink-0" aria-hidden>
            ×
          </span>
          <span className="shrink-0 tabular-nums">{weight}</span>
        </>
      ) : null}
    </span>
  );
}
