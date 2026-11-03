import { cn } from "@/lib/utils";
import { formatReps, setLabels, type PlannedSet } from "@/features/routines/sets";
import { formatKgNumber } from "@/features/routines/weight";

interface PlannedSetsTableProps {
  sets: PlannedSet[];
  caption?: string;
  className?: string;
}

/** Read-only set list styled like the workout screen. */
export function PlannedSetsTable({
  sets,
  caption,
  className,
}: PlannedSetsTableProps) {
  const labels = setLabels(sets);

  return (
    <table className={cn("w-full text-sm", className)}>
      {caption ? <caption className="sr-only">{caption}</caption> : null}
      <thead>
        <tr className="text-muted-foreground text-[11px] tracking-wide uppercase">
          <th scope="col" className="w-12 py-1 text-left font-medium">
            Set
          </th>
          <th scope="col" className="py-1 text-left font-medium">
            Reps
          </th>
          <th scope="col" className="py-1 text-right font-medium">
            Kg
          </th>
        </tr>
      </thead>
      <tbody>
        {sets.map((set, index) => (
          <tr
            key={`${index}-${set.setType}-${set.repsMin}-${set.repsMax}-${set.weightKg}`}
            className="border-border/50 border-t"
          >
            <td className="py-1.5">
              <span
                className={cn(
                  "inline-flex h-6 min-w-6 items-center justify-center rounded-md px-1 text-xs font-semibold tabular-nums",
                  set.setType === "warmup" && "bg-warning/20 text-foreground",
                  set.setType === "drop" && "bg-primary/10 text-primary",
                  set.setType === "working" && "text-muted-foreground"
                )}
              >
                {labels[index]}
              </span>
            </td>
            <td className="text-foreground py-1.5 tabular-nums">
              {formatReps(set.repsMin, set.repsMax) ?? "—"}
            </td>
            <td className="text-foreground py-1.5 text-right tabular-nums">
              {set.weightKg !== null ? formatKgNumber(set.weightKg) : "—"}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
